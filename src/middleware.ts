import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Define public routes that should NOT be protected
const publicPaths = ["/auth/login", "/auth/signup","/api/register","/api/chat"];

export default withAuth(
  // This middleware runs on every request (except static files)
  function middleware(req) {
    // If the current pathname is public, just allow it
    if (publicPaths.includes(req.nextUrl.pathname)) {
      return NextResponse.next();
    }
    // Otherwise, let NextAuth handle the check (and redirect if needed)
    return NextResponse.next();
  },
  {
    pages: { signIn: "/auth/login" },
    callbacks: {
      authorized: ({ req, token }) => {
        // Allow access if the path is public (login or signup)
        if (publicPaths.includes(req.nextUrl.pathname)) {
          return true;
        }
        // Otherwise, only allow if the user has a valid token
        return !!token;
      },
    },
  }
);


export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
