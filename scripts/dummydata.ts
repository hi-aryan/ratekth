import { db } from '../src/db';
import * as schema from '../src/db/schema';
import { eq, and } from 'drizzle-orm';

/**
 * Robust Seed Script for rateKTH
 * 
 * ACID Compliance:
 * - A (Atomicity): All inserts/updates happen within one transaction. One failure = full rollback.
 * - C (Consistency): Schema constraints (FKs, unique indexes) strictly enforced by DB.
 * - I (Isolation): Transaction ensures no partial data is visible to other queries.
 * - D (Durability): Committed data is safely stored in Postgres.
 */
async function main() {
    console.log('--- Seeding Database (Robust Mode) ---');

    try {
        await db.transaction(async (tx) => {
            // 1. Upsert Program
            const [program] = await tx.insert(schema.program).values({
                name: 'Information and Communication Technology',
                code: 'TCOMK',
                programType: 'bachelor',
                credits: 180,
            }).onConflictDoUpdate({
                target: schema.program.code,
                set: { name: 'Information and Communication Technology', credits: 180 }
            }).returning();

            // 2. Upsert Course
            const [course] = await tx.insert(schema.course).values({
                name: 'Programmering I',
                code: 'ID1018',
            }).onConflictDoUpdate({
                target: schema.course.code,
                set: { name: 'Programmering I' }
            }).returning();

            // 3. Upsert Junction (Course Program)
            await tx.insert(schema.courseProgram).values({
                courseId: course.id,
                programId: program.id,
            }).onConflictDoNothing();

            // 4. Robust User Creation (ID-based Username Logic)
            // a) Ensure user exists by email.
            // b) If new, generate username as CODE + ID.
            const email = 'student@kth.se';
            const existingUser = await tx.query.user.findFirst({
                where: eq(schema.user.email, email),
            });

            if (!existingUser) {
                const [newUser] = await tx.insert(schema.user).values({
                    email: email,
                    image: 'default1.png',
                    programId: program.id,
                    emailVerified: new Date(),
                }).returning();

                await tx.update(schema.user)
                    .set({ username: `${program.code}${newUser.id.substring(0, 8)}` })
                    .where(eq(schema.user.id, newUser.id));

                console.log(`Created new user: ${program.code}${newUser.id.substring(0, 8)}`);
            } else {
                // If user exists, optionally sync the program
                await tx.update(schema.user)
                    .set({ programId: program.id })
                    .where(eq(schema.user.id, existingUser.id));
                console.log(`User already exists: ${existingUser.username}`);
            }

            console.log('✅ ACID Transaction finished successfully.');
        });
    } catch (error) {
        console.error('❌ Transaction Failed. All changes rolled back.');
        console.error(error);
        process.exit(1);
    }
    process.exit(0);
}

main();
