import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Public routes that don't require auth
  const publicRoutes = ["/login", "/signup", "/verify", "/reset-password", "/auth/callback", "/callback", "/apply", "/applynow", "/api/applications", "/api/applications/stage", "/v1"];
  const isRoot = pathname === "/";
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  // Redirect unauthenticated users to login (except root landing page)
  if (!user && !isPublicRoute && !isRoot) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Single profile query for all authenticated users
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, setup_complete")
      .eq("auth_user_id", user.id)
      .single();

    // Authenticated on a public route — redirect to portal
    if (isPublicRoute) {
      if (!profile?.role) return supabaseResponse;

      const url = request.nextUrl.clone();

      if (profile.role === "client" && !profile.setup_complete) {
        url.pathname = "/onboarding";
        return NextResponse.redirect(url);
      }

      switch (profile.role) {
        case "client":
          url.pathname = "/portal";
          break;
        case "matchmaker":
          url.pathname = "/clients";
          break;
        case "admin":
          url.pathname = "/admin";
          break;
        default:
          url.pathname = "/overview";
      }
      return NextResponse.redirect(url);
    }

    // Authenticated on protected route — check onboarding
    if (profile?.role === "client" && !profile.setup_complete && !pathname.startsWith("/onboarding")) {
      const url = request.nextUrl.clone();
      url.pathname = "/onboarding";
      return NextResponse.redirect(url);
    }

    // Redirect legacy client routes to the single-page portal
    if (profile?.role === "client") {
      const legacyRouteMap: Record<string, string> = {
        "/dashboard": "#dashboard",
        "/overview": "#dates",
        "/preferences": "#preferences",
        "/profile": "#profile",
        "/access": "#access",
      };
      const hash = legacyRouteMap[pathname];
      if (hash) {
        const url = request.nextUrl.clone();
        url.pathname = "/portal";
        url.hash = hash;
        return NextResponse.redirect(url);
      }
    }
  }

  return supabaseResponse;
}
