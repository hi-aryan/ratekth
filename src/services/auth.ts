import NextAuth, { User } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/db";
import { user as userTable, accounts, sessions, verificationTokens, specialization, passwordResetTokens, program as programTable } from "@/db/schema";
import { eq, and } from "drizzle-orm";
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
 * Service: Validate that a programId exists in the program table.
 * Used for both base programs (programId) and direct master's (mastersDegreeId).
 */
const validateProgramExists = async (programId: number): Promise<void> => {
  const program = await db.query.program.findFirst({
    where: eq(programTable.id, programId),
    columns: { id: true },
  });
  if (!program) {
    throw new Error("Invalid program selected");
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
 * Generates username atomically using transaction.
 */
export const createUser = async (data: CreateUserInput) => {
  // Validate academic IDs exist before insertion
  if (data.programId) {
    await validateProgramExists(data.programId);
  }
  if (data.mastersDegreeId) {
    await validateProgramExists(data.mastersDegreeId);
  }
  if (data.specializationId && data.mastersDegreeId) {
    await validateSpecializationBelongsToMastersDegree(data.specializationId, data.mastersDegreeId);
  }

  const hashedPassword = await bcrypt.hash(data.password, 12);

  try {
    // Use transaction to atomically insert user and generate username
    return await db.transaction(async (tx) => {
      // 1. Insert user
      const [newUser] = await tx.insert(userTable).values({
        ...data,
        email: data.email.toLowerCase(),
        password: hashedPassword,
      }).returning();

      // 2. Get program code for username generation
      // Priority: programId (base program) > mastersDegreeId (direct master's)
      const programIdForUsername = data.programId ?? data.mastersDegreeId;
      if (programIdForUsername) {
        const program = await tx.query.program.findFirst({
          where: eq(programTable.id, programIdForUsername),
          columns: { code: true },
        });

        if (program?.code) {
          // 3. Generate and set username: e.g., "CDATE1a2b3c"
          const username = `${program.code}${newUser.id.substring(0, 6)}`;
          await tx.update(userTable)
            .set({ username })
            .where(eq(userTable.id, newUser.id));

          return [{ ...newUser, username }];
        }
      }

      // Return user without username if no program selected (edge case)
      return [newUser];
    });
  } catch (error) {
    // Handle PostgreSQL unique constraint violation (race condition)
    if (error && typeof error === "object" && "code" in error && error.code === "23505") {
      throw new Error("Email already registered");
    }
    throw error;
  }
};

/** Cooldown period for resending emails (1 min) */
const RESEND_COOLDOWN_MS = 1 * 60 * 1000;
/** NextAuth token lifespan - used to calculate when token was created */
const TOKEN_LIFESPAN_MS = 24 * 60 * 60 * 1000; // 24 hours default
/** Password reset token lifespan (1 hour for security) */
const PASSWORD_RESET_LIFESPAN_MS = 1 * 60 * 60 * 1000;

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

/**
 * Service: Check if user can request password reset (cooldown logic).
 */
export const getPasswordResetCooldownStatus = async (email: string): Promise<{ canRequest: true } | { canRequest: false; retryAfterSeconds: number }> => {
  const lastToken = await db.query.passwordResetTokens.findFirst({
    where: eq(passwordResetTokens.identifier, email.toLowerCase()),
  });

  if (!lastToken) {
    return { canRequest: true };
  }

  // Calculate when token was created (expires - lifespan)
  const tokenCreatedAt = new Date(lastToken.expires.getTime() - PASSWORD_RESET_LIFESPAN_MS);
  const timeSinceCreation = Date.now() - tokenCreatedAt.getTime();

  if (timeSinceCreation < RESEND_COOLDOWN_MS) {
    const retryAfterSeconds = Math.ceil((RESEND_COOLDOWN_MS - timeSinceCreation) / 1000);
    return { canRequest: false, retryAfterSeconds };
  }

  return { canRequest: true };
};

/**
 * Service: Create password reset token for user.
 * Implements delete-before-insert pattern to ensure max 1 token per email.
 * Returns the token string to be included in the email link.
 */
export const createPasswordResetToken = async (email: string): Promise<string> => {
  const normalizedEmail = email.toLowerCase();
  const token = crypto.randomUUID();
  const expires = new Date(Date.now() + PASSWORD_RESET_LIFESPAN_MS);

  // Use transaction to ensure ACID compliance (race condition protection)
  // Ensures max 1 token per email atomically
  await db.transaction(async (tx) => {
    // 1. Delete any existing tokens for this email
    await tx.delete(passwordResetTokens)
      .where(eq(passwordResetTokens.identifier, normalizedEmail));

    // 2. Insert new token
    await tx.insert(passwordResetTokens).values({
      identifier: normalizedEmail,
      token,
      expires,
    });
  });

  return token;
};

/**
 * Service: Validate password reset token.
 * Returns the email if token is valid and not expired, null otherwise.
 */
export const validatePasswordResetToken = async (token: string): Promise<string | null> => {
  const tokenRecord = await db.query.passwordResetTokens.findFirst({
    where: eq(passwordResetTokens.token, token),
  });

  if (!tokenRecord) {
    return null;
  }

  // Check if token is expired
  if (tokenRecord.expires < new Date()) {
    // Clean up expired token
    await db.delete(passwordResetTokens)
      .where(and(
        eq(passwordResetTokens.identifier, tokenRecord.identifier),
        eq(passwordResetTokens.token, token)
      ));
    return null;
  }

  return tokenRecord.identifier;
};

/**
 * Service: Update user password and consume the reset token.
 * Hashes the password internally. Deletes the token after successful update.
 */
export const updateUserPassword = async (email: string, newPassword: string, token: string): Promise<void> => {
  const normalizedEmail = email.toLowerCase();
  const hashedPassword = await bcrypt.hash(newPassword, 12);

  // Use transaction to ensure ACID compliance (race condition protection)
  await db.transaction(async (tx) => {
    // 1. Update password
    await tx.update(userTable)
      .set({ password: hashedPassword })
      .where(eq(userTable.email, normalizedEmail));

    // 2. Delete the used token (single-use enforcement)
    await tx.delete(passwordResetTokens)
      .where(and(
        eq(passwordResetTokens.identifier, normalizedEmail),
        eq(passwordResetTokens.token, token)
      ));
  });
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
          programId: user.programId,
          mastersDegreeId: user.mastersDegreeId,
          specializationId: user.specializationId,
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
    async jwt({ token, user }) {
      // On initial sign-in, persist academic IDs to JWT
      if (user) {
        token.programId = user.programId;
        token.mastersDegreeId = user.mastersDegreeId;
        token.specializationId = user.specializationId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
        session.user.programId = token.programId as number | null | undefined;
        session.user.mastersDegreeId = token.mastersDegreeId as number | null | undefined;
        session.user.specializationId = token.specializationId as number | null | undefined;
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