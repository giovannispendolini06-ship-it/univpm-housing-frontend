// middleware.ts (va nella ROOT del progetto, allo stesso livello di package.json)
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

function homeForRole(role: string | undefined): string {
  if (role === "admin") return "/admin";
  if (role === "owner") return "/owner";
  return "/dashboard";
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
  const isProtectedArea =
    path.startsWith("/dashboard") || path.startsWith("/admin") || path.startsWith("/owner");
  const isOnboarding = path.startsWith("/onboarding");

  // Non loggato e prova ad aprire un'area protetta → rimandalo al login
  if (!user && (isProtectedArea || isOnboarding)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && (path === "/login" || isProtectedArea || isOnboarding)) {
    const { data: profile } = await supabase
      .from("users")
      .select("role, profile_completed")
      .eq("id", user.id)
      .single();

    const home = homeForRole(profile?.role);
    // Gli admin non passano mai dall'onboarding.
    const needsOnboarding = profile?.role !== "admin" && profile?.profile_completed !== true;

    // Già loggato e apre /login → mandalo dove deve andare
    if (path === "/login") {
      const url = request.nextUrl.clone();
      url.pathname = needsOnboarding ? "/onboarding" : home;
      return NextResponse.redirect(url);
    }

    // Profilo non completo e prova ad aprire un'altra pagina → onboarding
    if (needsOnboarding && !isOnboarding) {
      const url = request.nextUrl.clone();
      url.pathname = "/onboarding";
      return NextResponse.redirect(url);
    }

    // Profilo già completo ma prova a tornare sull'onboarding → area sua
    if (!needsOnboarding && isOnboarding) {
      const url = request.nextUrl.clone();
      url.pathname = home;
      return NextResponse.redirect(url);
    }

    // Prova ad aprire l'area di un ruolo diverso dal suo → area sua
    if (isProtectedArea && !path.startsWith(home)) {
      const url = request.nextUrl.clone();
      url.pathname = home;
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
    "/onboarding/:path*",
  ],
};
