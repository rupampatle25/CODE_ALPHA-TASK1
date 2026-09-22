import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "./lib/session";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;

  // 1. Root route: Default entry point routing
  if (pathname === "/") {
    if (session) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 2. Protected private routes: /dashboard and nested routes
  if (pathname.startsWith("/dashboard")) {
    if (!session) {
      const callbackPath = req.nextUrl.pathname + req.nextUrl.search;
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", callbackPath);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // 3. Auth pages: /login, /signup, /forgot-password
  // If user is already authenticated with a valid session, redirect to Dashboard
  if (
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/forgot-password"
  ) {
    if (session) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match root, dashboard routes, and authentication routes.
     * Excludes static assets, next internal files, and general API endpoints.
     */
    "/",
    "/dashboard",
    "/dashboard/:path*",
    "/login",
    "/signup",
    "/forgot-password",
  ],
};
