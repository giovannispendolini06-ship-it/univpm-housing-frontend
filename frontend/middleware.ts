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
  // Extended protect list — same auth cookie flow as before
  const isProtectedArea =
    path.startsWith("/dashboard") ||
    path.startsWith("/vesta") ||
    path.startsWith("/admin") ||
    path.startsWith("/owner") ||
    path.startsWith("/applications") ||
    path.startsWith("/messages") ||
    path.startsWith("/profilo");
  const isOnboarding = path.startsWith("/onboarding");
  // Student-only extras (not under /dashboard prefix)
  const isStudentExtra =
    path.startsWith("/applications") || path.startsWith("/vesta");
  const isSharedAuth =
    path.startsWith("/messages") || path.startsWith("/profilo");

  // Non loggato e prova ad aprire un'area protetta → rimandalo al login
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

    const home = homeForRole(profile?.role);

    // Già loggato e apre /login → area del ruolo (profilo incompleto OK: progressivo)
    if (path === "/login") {
      const url = request.nextUrl.clone();
      url.pathname = home;
      return NextResponse.redirect(url);
    }

    // Onboarding è opzionale: non bloccare dashboard/owner/profilo se incompleto.
    // Se il profilo è già completo e aprono /onboarding → home.
    if (isOnboarding && profile?.profile_completed === true) {
      const url = request.nextUrl.clone();
      url.pathname = home;
      return NextResponse.redirect(url);
    }

    // Shared authenticated pages (messages, profilo): any role
    if (isSharedAuth) {
      return response;
    }

    // Prova ad aprire l'area di un ruolo diverso dal suo → area sua
    // /owner/* (including /owner/properties) stays owner home prefix
    if (isProtectedArea && !isStudentExtra && !path.startsWith(home)) {
      const url = request.nextUrl.clone();
      url.pathname = home;
      return NextResponse.redirect(url);
    }

    // Extra student pages: solo studenti (admin può comunque)
    if (isStudentExtra && profile?.role === "owner") {
      const url = request.nextUrl.clone();
      url.pathname = "/owner";
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/vesta/:path*",
    "/login",
    "/admin/:path*",
    "/owner/:path*",
    "/onboarding/:path*",
    "/applications/:path*",
    "/messages/:path*",
    "/profilo/:path*",
  ],
};
