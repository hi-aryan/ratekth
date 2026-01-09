import { relations } from "drizzle-orm/relations";
import { course, post, user, courseProgram, program, specialization, courseSpecialization, postTags, tag } from "./schema";

export const postRelations = relations(post, ({ one, many }) => ({
	course: one(course, {
		fields: [post.courseId],
		references: [course.id]
	}),
	user: one(user, {
		fields: [post.userId],
		references: [user.id]
	}),
	postTags: many(postTags),
}));

export const courseRelations = relations(course, ({ many }) => ({
	posts: many(post),
	coursePrograms: many(courseProgram),
	courseSpecializations: many(courseSpecialization),
}));

export const userRelations = relations(user, ({ one, many }) => ({
	posts: many(post),
	program: one(program, {
		fields: [user.programId],
		references: [program.id],
		relationName: "user_program"
	}),
	specialization: one(specialization, {
		fields: [user.specializationId],
		references: [specialization.id],
		relationName: "user_mastersSpecialization"
	}),
	programSpecialization: one(specialization, {
		fields: [user.programSpecializationId],
		references: [specialization.id],
		relationName: "user_programSpecialization"
	}),
	mastersDegree: one(program, {
		fields: [user.mastersDegreeId],
		references: [program.id],
		relationName: "user_mastersDegree"
	}),
}));

export const courseProgramRelations = relations(courseProgram, ({ one }) => ({
	course: one(course, {
		fields: [courseProgram.courseId],
		references: [course.id]
	}),
	program: one(program, {
		fields: [courseProgram.programId],
		references: [program.id]
	}),
}));

export const programRelations = relations(program, ({ many }) => ({
	coursePrograms: many(courseProgram),
	users: many(user, {
		relationName: "user_program"
	}),
	mastersDegreeUsers: many(user, {
		relationName: "user_mastersDegree"
	}),
	specializations: many(specialization),
}));

export const specializationRelations = relations(specialization, ({ one, many }) => ({
	mastersSpecUsers: many(user, { relationName: "user_mastersSpecialization" }),
	programSpecUsers: many(user, { relationName: "user_programSpecialization" }),
	program: one(program, {
		fields: [specialization.programId],
		references: [program.id]
	}),
	courseSpecializations: many(courseSpecialization),
}));

export const courseSpecializationRelations = relations(courseSpecialization, ({ one }) => ({
	course: one(course, {
		fields: [courseSpecialization.courseId],
		references: [course.id]
	}),
	specialization: one(specialization, {
		fields: [courseSpecialization.specializationId],
		references: [specialization.id]
	}),
}));

export const postTagsRelations = relations(postTags, ({ one }) => ({
	post: one(post, {
		fields: [postTags.postId],
		references: [post.id]
	}),
	tag: one(tag, {
		fields: [postTags.tagId],
		references: [tag.id]
	}),
}));

export const tagRelations = relations(tag, ({ many }) => ({
	postTags: many(postTags),
}));