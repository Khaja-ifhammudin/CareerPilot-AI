import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/resume/:path*",
    "/jobs/:path*",
    "/job-analysis/:path*",
    "/job-matcher/:path*",
    "/applications/:path*",
    "/interview/:path*",
    "/interview-prep/:path*",
    "/skills/:path*",
    "/analytics/:path*",
    "/admin/:path*",
    "/login",
    "/register",
  ],
};
