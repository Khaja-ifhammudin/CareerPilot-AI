import type { NextAuthConfig } from "next-auth";
import { type UserRole } from "@/models/User";

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = nextUrl;

      const isProtectedRoute =
        pathname.startsWith("/dashboard") ||
        pathname.startsWith("/profile") ||
        pathname.startsWith("/resume") ||
        pathname.startsWith("/jobs") ||
        pathname.startsWith("/job-analysis") ||
        pathname.startsWith("/job-matcher") ||
        pathname.startsWith("/applications") ||
        pathname.startsWith("/interview") ||
        pathname.startsWith("/interview-prep") ||
        pathname.startsWith("/skills") ||
        pathname.startsWith("/analytics");

      const isAdminRoute = pathname.startsWith("/admin");
      const isAuthRoute =
        pathname.startsWith("/login") || pathname.startsWith("/register");

      // 1. Admin route protection: Require login and ADMIN role
      if (isAdminRoute) {
        if (!isLoggedIn) {
          const redirectUrl = new URL("/login", nextUrl);
          redirectUrl.searchParams.set("callbackUrl", pathname);
          return Response.redirect(redirectUrl);
        }
        if (auth.user.role !== "ADMIN") {
          return Response.redirect(new URL("/dashboard?error=unauthorized", nextUrl));
        }
        return true;
      }

      // 2. Authenticated user routes: Require login
      if (isProtectedRoute) {
        if (!isLoggedIn) {
          const redirectUrl = new URL("/login", nextUrl);
          redirectUrl.searchParams.set("callbackUrl", pathname);
          return Response.redirect(redirectUrl);
        }
        return true;
      }

      // 3. Guest auth routes: If already logged in, redirect away to respective portal
      if (isAuthRoute && isLoggedIn) {
        const dest = auth?.user?.role === "ADMIN" ? "/admin" : "/dashboard";
        return Response.redirect(new URL(dest, nextUrl));
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as UserRole) || "USER";
      }
      return session;
    },
  },
  providers: [],
};
