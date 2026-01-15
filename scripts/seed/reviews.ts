/**
 * Reviews Seeder for RateKTH
 * 
 * Imports reviews from JSON files in data/reviews/.
 * Uses stable identifiers (email, courseCode, tagNames) to resolve IDs.
 * 
 * Features:
 * - Uses onConflictDoNothing on (userId, courseId) for idempotency
 * - Validates all references exist before inserting
 * - Preserves original datePosted timestamps
 * - Links tags after review is created
 */

import * as fs from 'fs';
import * as path from 'path';
import { eq, and } from 'drizzle-orm';
import * as schema from '@/db/schema';

// Infer transaction type from db instance
type Transaction = Parameters<Parameters<typeof import('@/db').db.transaction>[0]>[0];

// ==========================================
// TYPES (must match export format)
// ==========================================

interface ExportedReview {
    courseCode: string;
    yearTaken: number;
    datePosted: string;  // ISO string
    ratingProfessor: number;
    ratingMaterial: number;
    ratingPeers: number;
    ratingWorkload: 'light' | 'medium' | 'heavy';
    content: string | null;
    tags: string[];
}

interface ExportedUserReviews {
    userEmail: string;
    exportedAt: string;
    reviews: ExportedReview[];
}

// ==========================================
// SEEDER
// ==========================================

export const seedReviewsFromJSON = async (tx: Transaction): Promise<void> => {
    const reviewsDir = path.join(process.cwd(), 'data', 'reviews');

    // Check if reviews directory exists
    if (!fs.existsSync(reviewsDir)) {
        console.log('  ℹ No data/reviews/ directory found, skipping reviews import');
        return;
    }

    // Get all JSON files
    const files = fs.readdirSync(reviewsDir)
        .filter(f => f.endsWith('.json'))
        .map(f => path.join(reviewsDir, f));

    if (files.length === 0) {
        console.log('  ℹ No review files found in data/reviews/');
        return;
    }

    // Pre-fetch all users, courses, and tags for efficient lookups
    const allUsers = await tx.query.user.findMany({
        columns: { id: true, email: true }
    });
    const userByEmail = new Map(allUsers.map(u => [u.email.toLowerCase(), u.id]));

    const allCourses = await tx.query.course.findMany({
        columns: { id: true, code: true }
    });
    const courseByCode = new Map(allCourses.map(c => [c.code, c.id]));

    const allTags = await tx.query.tag.findMany({
        columns: { id: true, name: true }
    });
    const tagByName = new Map(allTags.map(t => [t.name, t.id]));

    let reviewsInserted = 0;
    let reviewsSkipped = 0;
    let tagsLinked = 0;
    const warnings: string[] = [];

    for (const file of files) {
        const filename = path.basename(file);
        const raw = JSON.parse(fs.readFileSync(file, 'utf-8'));
        const data = raw as ExportedUserReviews;

        // Resolve user ID
        const userId = userByEmail.get(data.userEmail.toLowerCase());
        if (!userId) {
            warnings.push(`User not found: ${data.userEmail} (file: ${filename})`);
            continue;
        }

        for (const review of data.reviews) {
            // Resolve course ID
            const courseId = courseByCode.get(review.courseCode);
            if (!courseId) {
                warnings.push(`Course not found: ${review.courseCode} (user: ${data.userEmail})`);
                continue;
            }

            // Insert review
            const [insertedPost] = await tx.insert(schema.post).values({
                userId,
                courseId,
                yearTaken: review.yearTaken,
                datePosted: new Date(review.datePosted),
                ratingProfessor: review.ratingProfessor,
                ratingMaterial: review.ratingMaterial,
                ratingPeers: review.ratingPeers,
                ratingWorkload: review.ratingWorkload,
                content: review.content,
            }).onConflictDoNothing().returning();

            if (insertedPost) {
                reviewsInserted++;

                // Link tags
                for (const tagName of review.tags) {
                    const tagId = tagByName.get(tagName);
                    if (tagId) {
                        await tx.insert(schema.postTags).values({
                            postId: insertedPost.id,
                            tagId,
                        }).onConflictDoNothing();
                        tagsLinked++;
                    } else {
                        warnings.push(`Tag not found: "${tagName}" (review for ${review.courseCode})`);
                    }
                }
            } else {
                reviewsSkipped++;
            }
        }
    }

    console.log(`✓ Reviews: ${reviewsInserted} imported, ${reviewsSkipped} already existed, ${tagsLinked} tags linked`);

    if (warnings.length > 0) {
        console.log(`  ⚠ ${warnings.length} warnings:`);
        warnings.forEach(w => console.log(`    - ${w}`));
    }
};
