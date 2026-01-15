/**
 * Main Seed Orchestrator for RateKTH
 * 
 * Runs all seeders in dependency order within a single ACID transaction:
 * 1. Programs (+ specializations, courses, links) from JSON files
 * 2. Tags (review tags with sentiment)
 * 3. Dummy users (one per program for manual review writing)
 * 
 * Usage:
 *   npx tsx scripts/seed/index.ts
 * 
 * After running, you can log in as any dummy user:
 *   Email: test.<programcode>@kth.se (e.g., test.cdate@kth.se)
 *   Password: password
 */

import { db } from '@/db';
import * as schema from '@/db/schema';
import { count } from 'drizzle-orm';
import { seedProgramsFromJSON } from './programs';
import { seedTags } from './tags';
import { seedDummyUsers } from './dummyUsers';
import { seedReviewsFromJSON } from './reviews';

// ==========================================
// VERIFICATION
// ==========================================

/**
 * Helper to count rows in a table.
 */
const countTable = async (
    table: typeof schema.program | typeof schema.course | typeof schema.specialization | typeof schema.courseProgram | typeof schema.courseSpecialization | typeof schema.tag | typeof schema.user | typeof schema.post
) => {
    const result = await db.select({ count: count() }).from(table);
    return result[0]?.count ?? 0;
};

/**
 * Log database counts after seeding for verification.
 */
const logDatabaseCounts = async () => {
    const counts = {
        programs: await countTable(schema.program),
        courses: await countTable(schema.course),
        specializations: await countTable(schema.specialization),
        coursePrograms: await countTable(schema.courseProgram),
        courseSpecializations: await countTable(schema.courseSpecialization),
        tags: await countTable(schema.tag),
        users: await countTable(schema.user),
        reviews: await countTable(schema.post),
    };

    console.log('\n📊 Database counts:');
    console.log(`   Programs: ${counts.programs}`);
    console.log(`   Courses: ${counts.courses}`);
    console.log(`   Specializations: ${counts.specializations}`);
    console.log(`   Course-Program links: ${counts.coursePrograms}`);
    console.log(`   Course-Specialization links: ${counts.courseSpecializations}`);
    console.log(`   Tags: ${counts.tags}`);
    console.log(`   Users: ${counts.users}`);
    console.log(`   Reviews: ${counts.reviews}`);
};

// ==========================================
// MAIN
// ==========================================

async function main() {
    console.log('🌱 RateKTH Production Seed\n');
    console.log('─'.repeat(50));

    const startTime = Date.now();

    try {
        await db.transaction(async (tx) => {
            // Phase 1: Programs from JSON files
            console.log('\n📚 Phase 1: Programs, Courses, Specializations');
            const programs = await seedProgramsFromJSON(tx);

            // Phase 2: Tags
            console.log('\n🏷️  Phase 2: Tags');
            await seedTags(tx);

            // Phase 3: Dummy Users
            console.log('\n👤 Phase 3: Dummy Users');
            await seedDummyUsers(tx, programs);

            // Phase 4: Reviews (from exported JSON files, if any)
            console.log('\n📝 Phase 4: Reviews');
            await seedReviewsFromJSON(tx);
        });

        // Verification (outside transaction)
        await logDatabaseCounts();

        const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(`\n✅ Seed completed successfully in ${elapsed}s`);
        console.log('─'.repeat(50));

    } catch (error) {
        console.error('\n❌ Seed failed. All changes rolled back.');
        console.error(error);
        process.exit(1);
    }

    process.exit(0);
}

main();
