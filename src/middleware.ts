import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Check if user is authenticated
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Role-based access control can be added here
    // Example: if (path.startsWith("/admin") && token.role !== "ADMIN") { ... }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/properties/:path*", "/messages/:path*", "/repairs/:path*", "/payments/:path*"],
};
