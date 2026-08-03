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

  // Non loggato e prova ad aprire un'area protetta → rimandalo al login
  if (!user && isProtectedArea) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Da qui in poi ci serve sapere il ruolo solo se l'utente è loggato e sta
  // toccando /login oppure un'area protetta di un ruolo diverso dal suo.
  if (user && (path === "/login" || isProtectedArea)) {
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    const home = homeForRole(profile?.role);

    // Già loggato e apre /login → mandalo alla sua schermata
    if (path === "/login") {
      const url = request.nextUrl.clone();
      url.pathname = home;
      return NextResponse.redirect(url);
    }

    // Prova ad aprire un'area che non è la sua → rimandalo alla sua
    const isInOwnArea = path.startsWith(home);
    if (!isInOwnArea) {
      const url = request.nextUrl.clone();
      url.pathname = home;
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/admin/:path*", "/owner/:path*"],
};
