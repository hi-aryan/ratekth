/**
 * Tags Seeder for RateKTH
 * 
 * Inserts all review tags with sentiment.
 * Uses onConflictDoNothing for idempotency.
 */

import * as schema from '@/db/schema';

// Infer transaction type from db instance
type Transaction = Parameters<Parameters<typeof import('@/db').db.transaction>[0]>[0];

const TAGS = [
    { name: "Clear Grading Criteria", sentiment: "positive" as const },
    { name: "Entertaining Lectures", sentiment: "positive" as const },
    { name: "Helpful TAs", sentiment: "positive" as const },
    { name: "Professor & TAs are Accessible Outside Class", sentiment: "positive" as const },
    { name: "Recorded Lectures", sentiment: "positive" as const },
    { name: "Industry Relevant", sentiment: "positive" as const },
    { name: "Can Skip the Literature", sentiment: "positive" as const },
    { name: "Group Projects", sentiment: "positive" as const },

    { name: "Lots of Reading", sentiment: "negative" as const },
    { name: "Textbook Required", sentiment: "negative" as const },
    { name: "Tough Grading", sentiment: "negative" as const },
    { name: "Bamboozling Exams", sentiment: "negative" as const },
    { name: "LOTS of Assignments", sentiment: "negative" as const },
    { name: "Bad Course Layout", sentiment: "negative" as const },
    { name: "Lecture Heavy", sentiment: "negative" as const },
    { name: "Outdated Content", sentiment: "negative" as const },
];

export const seedTags = async (tx: Transaction): Promise<void> => {
    let inserted = 0;
    let skipped = 0;

    for (const tag of TAGS) {
        const [result] = await tx.insert(schema.tag).values({
            name: tag.name,
            sentiment: tag.sentiment,
        }).onConflictDoNothing().returning();

        if (result) {
            inserted++;
        } else {
            skipped++;
        }
    }

    console.log(`✓ Tags: ${inserted} inserted, ${skipped} already existed`);
};
