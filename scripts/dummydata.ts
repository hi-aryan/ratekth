import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Seed Script for rateKTH
 * 
 * Seeds test data for:
 * - Case 1: Bachelor program (180hp) with a linked course
 * - Case 2: Master's degree (120hp) with a specialization and linked course
 * - Two test users (one for each case)
 */
async function main() {
    console.log('--- Seeding Database ---');

    try {
        await db.transaction(async (tx) => {
            // ==========================================
            // CASE 1: Bachelor Program (Base Program)
            // ==========================================
            const [bachelorProgram] = await tx.insert(schema.program).values({
                name: 'Information and Communication Technology',
                code: 'TCOMK',
                programType: 'bachelor',
                credits: 180,
            }).onConflictDoUpdate({
                target: schema.program.code,
                set: { name: 'Information and Communication Technology', credits: 180 }
            }).returning();
            console.log(`✓ Bachelor: ${bachelorProgram.code}`);

            // ==========================================
            // CASE 2: Master's Degree (Direct Master's)
            // ==========================================
            const [mastersDegree] = await tx.insert(schema.program).values({
                name: 'Computer Science',
                code: 'TCSCM',
                programType: 'master',
                credits: 120,
            }).onConflictDoUpdate({
                target: schema.program.code,
                set: { name: 'Computer Science', credits: 120 }
            }).returning();
            console.log(`✓ Master's Degree: ${mastersDegree.code}`);

            // Specialization for the Master's Degree
            const [specialization] = await tx.insert(schema.specialization).values({
                name: 'Machine Learning',
                programId: mastersDegree.id,
            }).onConflictDoNothing().returning();

            // Handle case where specialization already exists
            const spec = specialization ?? await tx.query.specialization.findFirst({
                where: eq(schema.specialization.programId, mastersDegree.id),
            });
            console.log(`✓ Specialization: ${spec?.name}`);

            // ==========================================
            // COURSES
            // ==========================================
            const [course1] = await tx.insert(schema.course).values({
                name: 'Programmering I',
                code: 'ID1018',
            }).onConflictDoUpdate({
                target: schema.course.code,
                set: { name: 'Programmering I' }
            }).returning();

            const [course2] = await tx.insert(schema.course).values({
                name: 'Machine Learning',
                code: 'DD2421',
            }).onConflictDoUpdate({
                target: schema.course.code,
                set: { name: 'Machine Learning' }
            }).returning();
            console.log(`✓ Courses: ${course1.code}, ${course2.code}`);

            // Link course to bachelor program
            await tx.insert(schema.courseProgram).values({
                courseId: course1.id,
                programId: bachelorProgram.id,
            }).onConflictDoNothing();

            // Link course to specialization
            if (spec) {
                await tx.insert(schema.courseSpecialization).values({
                    courseId: course2.id,
                    specializationId: spec.id,
                }).onConflictDoNothing();
            }

            // ==========================================
            // TEST USERS
            // ==========================================
            const hashedPassword = '$2b$12$DLu1O49pr9sw4d7/tpnXz.V0Z0xAS8T6Au3WMhIZcUjW6mqEaDmxq'; // "password"

            // User 1: Base Program student
            const email1 = 'student@kth.se';
            const existingUser1 = await tx.query.user.findFirst({
                where: eq(schema.user.email, email1),
            });
            if (!existingUser1) {
                const [user1] = await tx.insert(schema.user).values({
                    email: email1,
                    programId: bachelorProgram.id,
                    emailVerified: new Date(),
                    password: hashedPassword,
                }).returning();
                await tx.update(schema.user)
                    .set({ username: `${bachelorProgram.code}${user1.id.substring(0, 6)}` })
                    .where(eq(schema.user.id, user1.id));
                console.log(`✓ User 1 (Base Program): ${email1}`);
            }

            // User 2: Direct Master's student
            const email2 = 'masters@kth.se';
            const existingUser2 = await tx.query.user.findFirst({
                where: eq(schema.user.email, email2),
            });
            if (!existingUser2 && spec) {
                const [user2] = await tx.insert(schema.user).values({
                    email: email2,
                    mastersDegreeId: mastersDegree.id,
                    specializationId: spec.id,
                    emailVerified: new Date(),
                    password: hashedPassword,
                }).returning();
                await tx.update(schema.user)
                    .set({ username: `${mastersDegree.code}${user2.id.substring(0, 6)}` })
                    .where(eq(schema.user.id, user2.id));
                console.log(`✓ User 2 (Master's Degree): ${email2}`);
            }

            console.log('✅ Seed completed successfully.');
        });
    } catch (error) {
        console.error('❌ Seed failed. All changes rolled back.');
        console.error(error);
        process.exit(1);
    }
    process.exit(0);
}

main();

