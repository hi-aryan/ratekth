import NextAuth, { User } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/db";
import { user as userTable, accounts, sessions, verificationTokens } from "@/db/schema";
import { eq } from "drizzle-orm";
import { mailConfig } from "@/lib/mail";

/**
 * Service: Verify if an email belongs to the KTH domain.
 * Centralized source of truth for KTH identity verification.
 */
export const verifyKthEmail = (email: string): boolean => {
  return email.toLowerCase().endsWith("@kth.se");
};

/**
 * Service: Find a user in the database by their email.
 */
export const findUserByEmail = async (email: string) => {
  return await db.query.user.findFirst({
    where: eq(userTable.email, email.toLowerCase()),
  });
};

/**
 * Service: Create a new user with a hashed password.
 */
export const createUser = async (data: any) => {
  const hashedPassword = await bcrypt.hash(data.password, 12);
  return await db.insert(userTable).values({
    ...data,
    email: data.email.toLowerCase(),
    password: hashedPassword,
  }).returning();
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: userTable,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  providers: [
    mailConfig,
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await findUserByEmail(credentials.email as string);
        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(credentials.password as string, user.password);
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        } as User;
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "credentials") {
        return !!user.email && verifyKthEmail(user.email) && !!(user as any).emailVerified;
      }
      if (!user.email) return false;
      return verifyKthEmail(user.email);
    },
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      return session;
    }
  },
  session: { strategy: "jwt" }
});