import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe base config. This is imported by middleware, which runs on the
 * Edge runtime and must not pull in Node-only code (mongoose, bcryptjs) — so
 * the Credentials provider with DB access lives only in src/auth.ts, which
 * spreads this config and adds it for the Node.js runtime (route handlers,
 * server components).
 */
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = request.nextUrl;
      const isProtectedRoute =
        pathname.startsWith("/dashboard") || pathname.startsWith("/project");

      if (isProtectedRoute && !isLoggedIn) {
        return false;
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
