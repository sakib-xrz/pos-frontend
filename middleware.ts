import { jwtDecode, JwtPayload } from "jwt-decode";
import { NextRequest, NextResponse } from "next/server";
import { AUTH_TOKEN_KEY } from "./lib/constant";

interface CustomJwtPayload extends JwtPayload {
  role?: "SUPER_ADMIN" | "ADMIN" | "STAFF";
}

const AuthRoutes = ["/super-admin/login", "/admin/login", "/staff/login"];
const commonPrivateRoutes = ["/change-password", "/profile"];

const roleBasedRoutes = {
  SUPER_ADMIN: [/^\/super-admin/],
  ADMIN: [/^\/admin/],
  STAFF: [/^\/staff/],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get(AUTH_TOKEN_KEY)?.value;

  // Allow public routes and auth routes when no token
  if (!accessToken) {
    if (AuthRoutes.includes(pathname) || pathname === "/") {
      return NextResponse.next();
    }

    // Redirect to home page if trying to access protected routes without token
    return NextResponse.redirect(new URL("/", request.url));
  }

  let decodedData: CustomJwtPayload | null = null;
  try {
    decodedData = jwtDecode<CustomJwtPayload>(accessToken);
  } catch {
    // If token is invalid, redirect to home
    return NextResponse.redirect(new URL("/", request.url));
  }

  const role = decodedData?.role;

  // Redirect authenticated users away from login pages
  if (AuthRoutes.includes(pathname)) {
    if (role === "SUPER_ADMIN") {
      return NextResponse.redirect(
        new URL("/super-admin/dashboard", request.url)
      );
    } else if (role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    } else if (role === "STAFF") {
      return NextResponse.redirect(new URL("/staff/pos", request.url));
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Allow common private routes for all authenticated users
  if (commonPrivateRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Check role-based access
  if (role && roleBasedRoutes[role]) {
    const allowedRoutes = roleBasedRoutes[role];

    const hasAccess = allowedRoutes.some((route) => {
      if (typeof route === "string") {
        return pathname.startsWith(route);
      }
      return route.test(pathname);
    });

    if (hasAccess) {
      return NextResponse.next();
    } else {
      // Redirect to appropriate dashboard if accessing wrong role routes
      if (role === "SUPER_ADMIN") {
        return NextResponse.redirect(
          new URL("/super-admin/dashboard", request.url)
        );
      } else if (role === "ADMIN") {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      } else if (role === "STAFF") {
        return NextResponse.redirect(new URL("/staff/pos", request.url));
      }
    }
  }

  return NextResponse.redirect(new URL("/", request.url));
}

export const config = {
  matcher: [
    "/super-admin/:path*",
    "/admin/:path*",
    "/staff/:path*",
    "/change-password",
    "/profile",
  ],
};
