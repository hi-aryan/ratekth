import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/db";
import { user, accounts, sessions, verificationTokens } from "@/db/schema";
import { mailConfig } from "@/lib/mail";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: user,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  providers: [mailConfig],
  callbacks: {
    async signIn({ user }) {
      return !!user.email?.toLowerCase().endsWith("@kth.se");
    },
  },
});