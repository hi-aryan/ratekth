/**
 * Review Export Script for RateKTH
 * 
 * Exports all reviews from the database to JSON files in data/reviews/.
 * Reviews are grouped by user email for easy management.
 * 
 * Exported data uses STABLE identifiers (email, courseCode, tagName)
 * so reviews can be re-imported after dropdb/createdb.
 * 
 * Usage:
 *   npm run export:reviews
 * 
 * Output:
 *   data/reviews/test.cdate.json
 *   data/reviews/test.taeem.json
 *   etc.
 */

import * as fs from 'fs';
import * as path from 'path';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq } from 'drizzle-orm';

// ==========================================
// TYPES
// ==========================================

interface ExportedReview {
    courseCode: string;
    yearTaken: number;
    datePosted: string;  // ISO string for JSON serialization
    ratingProfessor: number;
    ratingMaterial: number;
    ratingPeers: number;
    ratingWorkload: 'light' | 'medium' | 'heavy';
    content: string | null;
    tags: string[];  // Tag names
}

interface ExportedUserReviews {
    userEmail: string;
    exportedAt: string;
    reviews: ExportedReview[];
}

// ==========================================
// EXPORT LOGIC
// ==========================================

async function exportReviews() {
    console.log('📤 Exporting reviews from database...\n');

    // 1. Get all reviews with user and course info
    const reviews = await db
        .select({
            postId: schema.post.id,
            userId: schema.post.userId,
            userEmail: schema.user.email,
            courseCode: schema.course.code,
            yearTaken: schema.post.yearTaken,
            datePosted: schema.post.datePosted,
            ratingProfessor: schema.post.ratingProfessor,
            ratingMaterial: schema.post.ratingMaterial,
            ratingPeers: schema.post.ratingPeers,
            ratingWorkload: schema.post.ratingWorkload,
            content: schema.post.content,
        })
        .from(schema.post)
        .innerJoin(schema.user, eq(schema.post.userId, schema.user.id))
        .innerJoin(schema.course, eq(schema.post.courseId, schema.course.id));

    if (reviews.length === 0) {
        console.log('No reviews found in database.');
        return;
    }

    console.log(`Found ${reviews.length} reviews total.\n`);

    // 2. Get all post tags
    const postTags = await db
        .select({
            postId: schema.postTags.postId,
            tagName: schema.tag.name,
        })
        .from(schema.postTags)
        .innerJoin(schema.tag, eq(schema.postTags.tagId, schema.tag.id));

    // Build postId → tagNames map
    const tagsByPostId = new Map<number, string[]>();
    for (const pt of postTags) {
        const existing = tagsByPostId.get(pt.postId) ?? [];
        existing.push(pt.tagName);
        tagsByPostId.set(pt.postId, existing);
    }

    // 3. Group reviews by user email
    const reviewsByUser = new Map<string, ExportedReview[]>();

    for (const review of reviews) {
        const exported: ExportedReview = {
            courseCode: review.courseCode,
            yearTaken: review.yearTaken,
            datePosted: review.datePosted.toISOString(),
            ratingProfessor: review.ratingProfessor,
            ratingMaterial: review.ratingMaterial,
            ratingPeers: review.ratingPeers,
            ratingWorkload: review.ratingWorkload,
            content: review.content,
            tags: tagsByPostId.get(review.postId) ?? [],
        };

        const existing = reviewsByUser.get(review.userEmail) ?? [];
        existing.push(exported);
        reviewsByUser.set(review.userEmail, existing);
    }

    // 4. Create output directory
    const outputDir = path.join(process.cwd(), 'data', 'reviews');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // 5. Write JSON files per user
    const exportedAt = new Date().toISOString();
    let filesWritten = 0;

    for (const [userEmail, userReviews] of reviewsByUser) {
        const data: ExportedUserReviews = {
            userEmail,
            exportedAt,
            reviews: userReviews,
        };

        // Filename: sanitize email (replace @ and . with safe chars)
        const filename = userEmail.replace('@', '_at_').replace(/\./g, '_') + '.json';
        const filepath = path.join(outputDir, filename);

        fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
        console.log(`  ✓ ${filename}: ${userReviews.length} reviews`);
        filesWritten++;
    }

    console.log(`\n✅ Exported ${reviews.length} reviews to ${filesWritten} files`);
    console.log(`   Location: data/reviews/`);
}

// ==========================================
// MAIN
// ==========================================

async function main() {
    try {
        await exportReviews();
    } catch (error) {
        console.error('❌ Export failed:', error);
        process.exit(1);
    }
    process.exit(0);
}

main();
