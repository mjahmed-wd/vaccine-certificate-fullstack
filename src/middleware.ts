import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";

export default withAuth(
  async function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isAuthPage = req.nextUrl.pathname === "/login";
    const isAdminRoute = 
      req.nextUrl.pathname.startsWith('/dashboard/vaccines') ||
      req.nextUrl.pathname.startsWith('/dashboard/users');

    // Redirect authenticated users from login page to dashboard
    if (isAuthPage && isAuth) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Check for admin routes
    if (isAdminRoute && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return null;
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const isAuth = !!token;
        const isAuthPage = req.nextUrl.pathname === "/login";
        
        // Bypass middleware for login page
        if (isAuthPage) {
          return true;
        }
        
        // Require authentication for all other pages
        return isAuth;
      },
    },
  }
);

// Update matcher to be more specific
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/login",
  ],
};
