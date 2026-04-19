import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";

interface SessionData {
  userId: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  isLoggedIn: boolean;
  isAdmin?: boolean;
  isSuspended?: boolean;
}

const protectedRoutes = ["/create", "/profile/edit", "/saved", "/admin"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if route needs protection
  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (!isProtected) return NextResponse.next();

  // Check session cookie
  const response = NextResponse.next();
  const session = await getIronSession<SessionData>(request, response, {
    password: process.env.SESSION_SECRET!,
    cookieName: "uninews-session",
  });

  if (!session.isLoggedIn || session.isSuspended) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Admin protection
  if (pathname.startsWith("/admin") && !session.isAdmin) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/create/:path*", "/profile/edit/:path*", "/saved/:path*", "/admin/:path*"],
};
