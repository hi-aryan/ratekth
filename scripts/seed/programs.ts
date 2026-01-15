/**
 * Programs Seeder for RateKTH
 * 
 * Reads all JSON files from data/ folder and inserts:
 * - Programs (onConflictDoUpdate - allows name corrections)
 * - Specializations (onConflictDoNothing)
 * - Courses (onConflictDoUpdate - allows name corrections)
 * - Course-Program links (onConflictDoNothing)
 * - Course-Specialization links (onConflictDoNothing)
 * 
 * All operations are idempotent and safe to re-run.
 * Validates JSON structure with Zod before insertion.
 */

import * as fs from 'fs';
import * as path from 'path';
import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import * as schema from '@/db/schema';

// Infer transaction type from db instance
type Transaction = Parameters<Parameters<typeof import('@/db').db.transaction>[0]>[0];

// ==========================================
// ZOD SCHEMAS FOR VALIDATION
// ==========================================

const CourseSchema = z.object({
    code: z.string().min(2).max(20),
    name: z.string().min(1).max(150),
    specializations: z.array(z.string()).optional(),
});

const ProgramDataSchema = z.object({
    program: z.object({
        code: z.string().min(3).max(10),
        name: z.string().min(1).max(100),
        programType: z.enum(['bachelor', 'master']),
        credits: z.union([z.literal(180), z.literal(300), z.literal(120)]),
        hasIntegratedMasters: z.boolean().optional(),
    }),
    specializations: z.array(z.string()),
    courses: z.array(CourseSchema),
});

export type ProgramData = z.infer<typeof ProgramDataSchema>;

// ==========================================
// RETURN TYPE
// ==========================================

export interface ProgramInfo {
    id: number;
    code: string;
    credits: number;
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Process a single JSON file and insert its data.
 * Returns the inserted/updated program info.
 */
const processFile = async (
    tx: Transaction,
    filePath: string
): Promise<ProgramInfo> => {
    const fileName = path.basename(filePath);
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    // Validate with Zod - throws ZodError if invalid
    let data: ProgramData;
    try {
        data = ProgramDataSchema.parse(raw);
    } catch (error) {
        if (error instanceof z.ZodError) {
            console.error(`✗ Validation failed for ${fileName}:`);
            error.issues.forEach((issue: z.ZodIssue) => console.error(`  - ${issue.path.join('.')}: ${issue.message}`));
            throw new Error(`Invalid JSON structure in ${fileName}`);
        }
        throw error;
    }

    // 1. Insert/update program
    const [insertedProgram] = await tx.insert(schema.program).values({
        code: data.program.code,
        name: data.program.name,
        programType: data.program.programType,
        credits: data.program.credits,
        hasIntegratedMasters: data.program.hasIntegratedMasters ?? false,
    }).onConflictDoUpdate({
        target: schema.program.code,
        set: {
            name: data.program.name,
            credits: data.program.credits,
            hasIntegratedMasters: data.program.hasIntegratedMasters ?? false,
        }
    }).returning();

    // 2. Insert specializations and build lookup map
    const specMap = new Map<string, number>(); // name → id

    for (const specName of data.specializations) {
        const [spec] = await tx.insert(schema.specialization).values({
            name: specName,
            programId: insertedProgram.id,
        }).onConflictDoNothing().returning();

        if (spec) {
            specMap.set(specName, spec.id);
        } else {
            // Already exists, fetch it
            const existing = await tx.query.specialization.findFirst({
                where: and(
                    eq(schema.specialization.name, specName),
                    eq(schema.specialization.programId, insertedProgram.id)
                ),
            });
            if (existing) {
                specMap.set(specName, existing.id);
            }
        }
    }

    // 3. Insert courses and create links
    let coursesProcessed = 0;
    let linksCreated = 0;

    for (const courseData of data.courses) {
        // Insert/update course
        const [insertedCourse] = await tx.insert(schema.course).values({
            code: courseData.code,
            name: courseData.name,
        }).onConflictDoUpdate({
            target: schema.course.code,
            set: { name: courseData.name }
        }).returning();

        coursesProcessed++;

        // Link course to program
        await tx.insert(schema.courseProgram).values({
            courseId: insertedCourse.id,
            programId: insertedProgram.id,
        }).onConflictDoNothing();
        linksCreated++;

        // Link course to its specializations (if any)
        const courseSpecs = courseData.specializations ?? [];
        for (const specName of courseSpecs) {
            const specId = specMap.get(specName);
            if (specId) {
                await tx.insert(schema.courseSpecialization).values({
                    courseId: insertedCourse.id,
                    specializationId: specId,
                }).onConflictDoNothing();
                linksCreated++;
            } else {
                console.warn(`  ⚠ Specialization "${specName}" not found for course ${courseData.code}`);
            }
        }
    }

    console.log(`  ✓ ${fileName}: ${coursesProcessed} courses, ${data.specializations.length} specializations, ${linksCreated} links`);

    return {
        id: insertedProgram.id,
        code: insertedProgram.code,
        credits: insertedProgram.credits,
    };
};

// ==========================================
// MAIN EXPORT
// ==========================================

/**
 * Seed all programs from JSON files in data/ folder.
 * Returns array of all inserted/updated programs.
 */
export const seedProgramsFromJSON = async (tx: Transaction): Promise<ProgramInfo[]> => {
    const dataDir = path.join(process.cwd(), 'data');

    // Check if data directory exists
    if (!fs.existsSync(dataDir)) {
        throw new Error(`Data directory not found: ${dataDir}`);
    }

    // Get all JSON files (exclude insert.ts and other non-JSON)
    const files = fs.readdirSync(dataDir)
        .filter(f => f.endsWith('.json'))
        .map(f => path.join(dataDir, f))
        .sort(); // Process alphabetically for consistent ordering

    if (files.length === 0) {
        console.warn('⚠ No JSON files found in data/ folder');
        return [];
    }

    console.log(`\n📁 Processing ${files.length} program files...\n`);

    const programs: ProgramInfo[] = [];

    for (const file of files) {
        const programInfo = await processFile(tx, file);
        programs.push(programInfo);
    }

    console.log(`\n✓ Programs: ${programs.length} processed`);

    return programs;
};
