import NextAuth, { User } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/db";
import { user as userTable, accounts, sessions, verificationTokens, specialization } from "@/db/schema";
import { eq } from "drizzle-orm";
import { mailConfig } from "@/lib/mail";
import { CreateUserInput, SafeUser, UserWithPassword } from "@/lib/types";

/**
 * Service: Verify if an email belongs to the KTH domain.
 */
export const verifyKthEmail = (email: string): boolean => {
  return email.toLowerCase().endsWith("@kth.se");
};

/**
 * Service: Validate that a specialization belongs to the given master's degree.
 * Throws if the relationship is invalid (defense against form manipulation).
 */
const validateSpecializationBelongsToMastersDegree = async (
  specializationId: number,
  mastersDegreeId: number
): Promise<void> => {
  const spec = await db.query.specialization.findFirst({
    where: eq(specialization.id, specializationId),
    columns: { programId: true },
  });

  if (!spec) {
    throw new Error("Specialization not found");
  }

  if (spec.programId !== mastersDegreeId) {
    throw new Error("Specialization does not belong to the selected degree");
  }
};

/**
 * Service: Find user by email - returns SAFE data only (no password).
 * This is the ONLY user lookup that should be used by actions/components.
 */
export const findUserByEmail = async (email: string): Promise<SafeUser | null> => {
  const user = await db.query.user.findFirst({
    where: eq(userTable.email, email.toLowerCase()),
    columns: {
      id: true,
      email: true,
      emailVerified: true,
      name: true,
      username: true,
      image: true,
      programId: true,
      mastersDegreeId: true,
      specializationId: true,
      // password: EXCLUDED
    },
  });
  return user ?? null;
};

/**
 * Internal: Find user WITH password for auth verification.
 * NOT exported - used only within this file's authorize() callback.
 */
const findUserWithPasswordByEmail = async (email: string): Promise<UserWithPassword | null> => {
  const user = await db.query.user.findFirst({
    where: eq(userTable.email, email.toLowerCase()),
  });
  if (!user || !user.password) return null;
  return user as UserWithPassword;
};

/**
 * Service: Create a new user with a hashed password.
 * Validates academic relationships before insertion.
 */
export const createUser = async (data: CreateUserInput) => {
  // Validate specialization belongs to selected master's degree (if both provided)
  if (data.specializationId && data.mastersDegreeId) {
    await validateSpecializationBelongsToMastersDegree(data.specializationId, data.mastersDegreeId);
  }

  const hashedPassword = await bcrypt.hash(data.password, 12);
  return await db.insert(userTable).values({
    ...data,
    email: data.email.toLowerCase(),
    password: hashedPassword,
  }).returning();
};

/** Cooldown period for resending verification emails (1 min) */
const RESEND_COOLDOWN_MS = 1 * 60 * 1000;
/** NextAuth token lifespan - used to calculate when token was created */
const TOKEN_LIFESPAN_MS = 24 * 60 * 60 * 1000; // 24 hours default

/**
 * Service: Check if user can resend verification email.
 * Returns remaining cooldown seconds if blocked, or true if allowed.
 */
export const getResendCooldownStatus = async (email: string): Promise<{ canResend: true } | { canResend: false; retryAfterSeconds: number }> => {
  const lastToken = await db.query.verificationTokens.findFirst({
    where: eq(verificationTokens.identifier, email.toLowerCase()),
  });

  if (!lastToken) {
    return { canResend: true };
  }

  // Calculate when token was created (expires - lifespan)
  const tokenCreatedAt = new Date(lastToken.expires.getTime() - TOKEN_LIFESPAN_MS);
  const timeSinceCreation = Date.now() - tokenCreatedAt.getTime();

  if (timeSinceCreation < RESEND_COOLDOWN_MS) {
    const retryAfterSeconds = Math.ceil((RESEND_COOLDOWN_MS - timeSinceCreation) / 1000);
    return { canResend: false, retryAfterSeconds };
  }

  return { canResend: true };
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

        const user = await findUserWithPasswordByEmail(credentials.email as string);
        if (!user) return null;

        const isValid = await bcrypt.compare(credentials.password as string, user.password);
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          emailVerified: user.emailVerified,
        } as User;
      }
    })
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Magic link verification: force redirect to /login with success message
      // overrides Auth.js default behavior (bit generic, use "targetUrl.pathname" if needed)
      if (url.includes("/register") || url === baseUrl + "/register") {
        return `${baseUrl}/login?success=verified`;
      }
      // Standard redirect handling
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (url.startsWith(baseUrl)) return url;
      return baseUrl;
    },
    async signIn({ user }) {
      // Defense-in-depth: ensure only KTH emails can ever sign in
      // Note: emailVerified is checked by loginAction before signIn is called
      return !!user.email && verifyKthEmail(user.email);
    },
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      return session;
    }
  },
  session: { strategy: "jwt" }, /* cookies */
  pages: {
    signIn: "/login",
    error: "/login",
    verifyRequest: "/login",
    newUser: "/login",
  },
});