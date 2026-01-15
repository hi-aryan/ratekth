/**
 * Dummy Users Seeder for RateKTH
 * 
 * Creates ONE realistic dummy user per program for manual review writing.
 * 
 * Features:
 * - Uses same password hash as dummydata.ts ("password")
 * - Realistic usernames matching real user pattern: PROGRAMCODE + UUID substring
 * - Email format: test.programcode@kth.se
 * - Pre-verified emails so users can immediately post reviews
 * - No specialization selected (valid for all program types)
 * - Uses onConflictDoNothing for idempotency
 */

import * as schema from '@/db/schema';
import type { ProgramInfo } from './programs';

// Infer transaction type from db instance
type Transaction = Parameters<Parameters<typeof import('@/db').db.transaction>[0]>[0];

// Pre-computed bcrypt hash for "password" - same as dummydata.ts
// This allows logging in with password: "password"
const HASHED_PASSWORD = '$2b$12$DLu1O49pr9sw4d7/tpnXz.V0Z0xAS8T6Au3WMhIZcUjW6mqEaDmxq';

/**
 * Seed dummy users for all provided programs.
 * Creates one user per program with credentials:
 * - Email: test.<programcode>@kth.se (e.g., test.cdate@kth.se)
 * - Password: password
 */
export const seedDummyUsers = async (
    tx: Transaction,
    programs: ProgramInfo[]
): Promise<void> => {
    let created = 0;
    let skipped = 0;

    for (const program of programs) {
        // Generate user ID (UUID)
        const userId = crypto.randomUUID();

        // Generate realistic username matching real pattern
        // Real users: CDATE550e84 (PROGRAMCODE + first 6 chars of UUID)
        const username = `${program.code}${userId.substring(0, 6)}`;

        // Generate email
        const email = `test.${program.code.toLowerCase()}@kth.se`;

        // Determine programId vs mastersDegreeId based on credits
        // Base programs (180hp, 300hp) → programId
        // Master's degrees (120hp) → mastersDegreeId
        const isBaseProgram = program.credits === 180 || program.credits === 300;

        const [user] = await tx.insert(schema.user).values({
            id: userId,
            email,
            username,
            password: HASHED_PASSWORD,
            programId: isBaseProgram ? program.id : null,
            mastersDegreeId: isBaseProgram ? null : program.id,
            // No specialization - valid for all program types during registration
            specializationId: null,
            programSpecializationId: null,
            // Pre-verified so user can immediately post reviews
            emailVerified: new Date(),
        }).onConflictDoNothing().returning();

        if (user) {
            created++;
        } else {
            skipped++;
        }
    }

    console.log(`✓ Dummy users: ${created} created, ${skipped} already existed`);

    if (created > 0) {
        console.log(`  📧 Login format: test.<programcode>@kth.se`);
        console.log(`  🔑 Password: password`);
    }
};
