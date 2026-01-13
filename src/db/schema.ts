import { pgTable, varchar, uniqueIndex, index, serial, foreignKey, unique, timestamp, integer, text, primaryKey, pgEnum, check, boolean } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const programType = pgEnum("program_type", ['bachelor', 'master'])
export const tagSentiment = pgEnum("tagsentiment", ['positive', 'negative'])
export const workloadLevel = pgEnum("workloadlevel", ['light', 'medium', 'heavy'])

export const course = pgTable("course", {
	id: serial("id").primaryKey().notNull(),
	name: varchar("name", { length: 150 }).notNull(),
	code: varchar("code", { length: 20 }).notNull(),
}, (table) => [
	uniqueIndex("ix_course_code").on(table.code),
	index("ix_course_name").on(table.name),
]);

export const post = pgTable("post", {
	id: serial("id").primaryKey().notNull(),
	datePosted: timestamp("date_posted", { mode: 'date' }).notNull(),
	yearTaken: integer("year_taken").notNull(),
	ratingProfessor: integer("rating_professor").notNull(),
	ratingMaterial: integer("rating_material").notNull(),
	ratingPeers: integer("rating_peers").notNull(),
	content: text("content"),
	userId: text("user_id").notNull(),
	courseId: integer("course_id").notNull(),
	ratingWorkload: workloadLevel("rating_workload").notNull(),
}, (table) => [
	index("ix_post_course_id").on(table.courseId),
	index("ix_post_date_posted").on(table.datePosted),
	index("ix_post_user_id").on(table.userId),
	check("rating_professor_check", sql`rating_professor >= 1 AND rating_professor <= 5`),
	check("rating_material_check", sql`rating_material >= 1 AND rating_material <= 5`),
	check("rating_peers_check", sql`rating_peers >= 1 AND rating_peers <= 5`),
	foreignKey({
		columns: [table.courseId],
		foreignColumns: [course.id],
		name: "post_course_id_fkey"
	}),
	foreignKey({
		columns: [table.userId],
		foreignColumns: [user.id],
		name: "post_user_id_fkey"
	}),
	unique("one_review_per_course").on(table.userId, table.courseId),
]);

export const courseProgram = pgTable("course__program", {
	id: serial("id").primaryKey().notNull(),
	courseId: integer("course_id").notNull(),
	programId: integer("program_id").notNull(),
}, (table) => [
	foreignKey({
		columns: [table.courseId],
		foreignColumns: [course.id],
		name: "course__program_course_id_fkey"
	}).onDelete("cascade"),
	foreignKey({
		columns: [table.programId],
		foreignColumns: [program.id],
		name: "course__program_program_id_fkey"
	}).onDelete("cascade"),
	unique("unique_course_program").on(table.courseId, table.programId),
	index("ix_course_program_program_id").on(table.programId),
]);

export const program = pgTable("program", {
	id: serial("id").primaryKey().notNull(),
	name: varchar("name", { length: 100 }).notNull(),
	code: varchar("code", { length: 20 }).notNull(),
	programType: programType("program_type").notNull(),
	credits: integer("credits").notNull(),
	hasIntegratedMasters: boolean("has_integrated_masters").notNull().default(false),
}, (table) => [
	unique("program_code_key").on(table.code),
]);

export const user = pgTable("user", {
	id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
	name: text("name"),
	username: varchar("username", { length: 20 }),
	email: varchar("email", { length: 120 }).notNull(),
	emailVerified: timestamp("email_verified", { mode: 'date' }),
	image: text("image"),
	password: varchar("password", { length: 200 }).notNull(),
	programId: integer("program_id"),
	mastersDegreeId: integer("masters_degree_id"),
	specializationId: integer("specialization_id"),
	programSpecializationId: integer("program_specialization_id"),
}, (table) => [
	foreignKey({
		columns: [table.programId],
		foreignColumns: [program.id],
		name: "user_program_id_fkey"
	}),
	foreignKey({
		columns: [table.specializationId],
		foreignColumns: [specialization.id],
		name: "user_specialization_id_fkey"
	}),
	foreignKey({
		columns: [table.mastersDegreeId],
		foreignColumns: [program.id],
		name: "user_masters_degree_id_fkey"
	}),
	foreignKey({
		columns: [table.programSpecializationId],
		foreignColumns: [specialization.id],
		name: "user_program_specialization_id_fkey"
	}),
	unique("user_username_key").on(table.username),
	unique("user_email_key").on(table.email),
]);

export const accounts = pgTable("account", {
	userId: text("userId").notNull().references(() => user.id, { onDelete: "cascade" }),
	type: text("type").notNull(),
	provider: text("provider").notNull(),
	providerAccountId: text("providerAccountId").notNull(),
	refresh_token: text("refresh_token"),
	access_token: text("access_token"),
	expires_at: integer("expires_at"),
	token_type: text("token_type"),
	scope: text("scope"),
	id_token: text("id_token"),
	session_state: text("session_state"),
}, (account) => [
	primaryKey({ columns: [account.provider, account.providerAccountId] }),
]);

export const sessions = pgTable("session", {
	sessionToken: text("sessionToken").primaryKey(),
	userId: text("userId").notNull().references(() => user.id, { onDelete: "cascade" }),
	expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable("verificationToken", {
	identifier: text("identifier").notNull(),
	token: text("token").notNull(),
	expires: timestamp("expires", { mode: "date" }).notNull(),
}, (vt) => [
	primaryKey({ columns: [vt.identifier, vt.token] }),
]);

export const passwordResetTokens = pgTable("passwordResetToken", {
	identifier: text("identifier").notNull(), // email
	token: text("token").notNull(),
	expires: timestamp("expires", { mode: "date" }).notNull(),
}, (table) => [
	primaryKey({ columns: [table.identifier, table.token] }),
	index("ix_password_reset_token").on(table.token),
]);

export const tag = pgTable("tag", {
	id: serial("id").primaryKey().notNull(),
	name: varchar("name", { length: 50 }).notNull(),
	sentiment: tagSentiment("sentiment").notNull(),
}, (table) => [
	unique("tag_name_key").on(table.name),
]);

export const specialization = pgTable("specialization", {
	id: serial("id").primaryKey().notNull(),
	name: varchar("name", { length: 100 }).notNull(),
	programId: integer("program_id").notNull(),
}, (table) => [
	foreignKey({
		columns: [table.programId],
		foreignColumns: [program.id],
		name: "specialization_program_id_fkey"
	}),
	unique("unique_spec_name_program").on(table.name, table.programId),
]);

export const courseSpecialization = pgTable("course__specialization", {
	id: serial("id").primaryKey().notNull(),
	courseId: integer("course_id").notNull(),
	specializationId: integer("specialization_id").notNull(),
}, (table) => [
	foreignKey({
		columns: [table.courseId],
		foreignColumns: [course.id],
		name: "course__specialization_course_id_fkey"
	}).onDelete("cascade"),
	foreignKey({
		columns: [table.specializationId],
		foreignColumns: [specialization.id],
		name: "course__specialization_specialization_id_fkey"
	}).onDelete("cascade"),
	unique("unique_course_specialization").on(table.courseId, table.specializationId),
	index("ix_course_specialization_specialization_id").on(table.specializationId),
]);

export const postTags = pgTable("post_tags", {
	postId: integer("post_id").notNull(),
	tagId: integer("tag_id").notNull(),
}, (table) => [
	foreignKey({
		columns: [table.postId],
		foreignColumns: [post.id],
		name: "post_tags_post_id_fkey"
	}).onDelete("cascade"),
	foreignKey({
		columns: [table.tagId],
		foreignColumns: [tag.id],
		name: "post_tags_tag_id_fkey"
	}).onDelete("cascade"),
	primaryKey({ columns: [table.postId, table.tagId], name: "post_tags_pkey" }),
]);

export const feedback = pgTable("feedback", {
	id: serial("id").primaryKey(),
	userId: text("user_id").references(() => user.id), // Optional: link to user if logged in
	content: text("content").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});