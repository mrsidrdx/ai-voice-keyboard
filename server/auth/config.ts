import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authenticateUser } from "@/server/services/auth";
import { getEnv } from "@/lib/env";

export const authConfig = {
  trustHost: true,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const result = await authenticateUser(
          credentials.email as string,
          credentials.password as string
        );

        if (!result.ok) {
          return null;
        }

        return {
          id: result.value.id,
          email: result.value.email,
          name: result.value.name,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    signOut: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id ?? "";
        session.user.email = token.email ?? "";
        session.user.name = token.name ?? "";
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Handle relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Handle same-origin URLs
      if (new URL(url).origin === baseUrl) return url;
      // Default redirect to dashboard
      return `${baseUrl}/dashboard/dictate`;
    },
  },
  secret: getEnv().NEXTAUTH_SECRET,
} satisfies NextAuthConfig;

