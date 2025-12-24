import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/db";
import { user, accounts, sessions, verificationTokens } from "@/db/schema";
import { mailConfig } from "@/lib/mail";

/**
 * Service: Verify if an email belongs to the KTH domain.
 * Centralized source of truth for KTH identity verification.
 */
export const verifyKthEmail = (email: string): boolean => {
  return email.toLowerCase().endsWith("@kth.se");
};

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
      if (!user.email) return false;
      return verifyKthEmail(user.email);
    },
  },
});