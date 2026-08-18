// middleware.ts — auth gates for role areas
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

function homeForRole(role: string | undefined): string {
  if (role === "admin") return "/admin";
  if (role === "owner") return "/owner";
  return "/dashboard";
}

function isOwnerPath(path: string): boolean {
  return path.startsWith("/owner") || path.startsWith("/host");
}

function isStudentPath(path: string): boolean {
  return path.startsWith("/dashboard") || path.startsWith("/applications");
}

function isAdminPath(path: string): boolean {
  return path.startsWith("/admin");
}

function isSharedAuthPath(path: string): boolean {
  return path.startsWith("/messages") || path.startsWith("/profilo");
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options?: Parameters<typeof response.cookies.set>[2];
          }[],
        ) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isOnboarding = path.startsWith("/onboarding");
  const isProtectedArea =
    isOwnerPath(path) ||
    isStudentPath(path) ||
    isAdminPath(path) ||
    isSharedAuthPath(path);

  if (!user && (isProtectedArea || isOnboarding)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  if (user && (path === "/login" || isProtectedArea || isOnboarding)) {
    const { data: profile } = await supabase
      .from("users")
      .select("role, profile_completed")
      .eq("id", user.id)
      .single();

    const role = profile?.role;
    const home = homeForRole(role);
    const needsOnboarding = role !== "admin" && profile?.profile_completed !== true;

    if (path === "/login") {
      const url = request.nextUrl.clone();
      url.pathname = needsOnboarding ? "/onboarding" : home;
      return NextResponse.redirect(url);
    }

    if (needsOnboarding && !isOnboarding) {
      const url = request.nextUrl.clone();
      url.pathname = "/onboarding";
      return NextResponse.redirect(url);
    }

    if (!needsOnboarding && isOnboarding) {
      const url = request.nextUrl.clone();
      url.pathname = home;
      return NextResponse.redirect(url);
    }

    // Role gates (admins keep admin area; shared paths ok for any role)
    if (isAdminPath(path) && role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = home;
      return NextResponse.redirect(url);
    }

    if (isOwnerPath(path) && role !== "owner" && role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = home;
      return NextResponse.redirect(url);
    }

    if (isStudentPath(path) && role === "owner") {
      const url = request.nextUrl.clone();
      url.pathname = "/owner";
      return NextResponse.redirect(url);
    }

    if (isStudentPath(path) && role === "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/admin";
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/login",
    "/admin/:path*",
    "/owner/:path*",
    "/host/:path*",
    "/onboarding/:path*",
    "/applications/:path*",
    "/messages/:path*",
    "/profilo/:path*",
  ],
};
