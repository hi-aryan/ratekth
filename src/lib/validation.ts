import { z } from "zod";
import { verifyKthEmail } from "@/services/auth";

export const kthEmailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email())
  .refine(verifyKthEmail, {
    message: "Only @kth.se emails are allowed.",
  });

export const loginSchema = z.object({
  email: kthEmailSchema,
  password: z.string().min(1, "Password is required"),
});

/**
 * Schema Helper: Optional numeric ID from HTML form.
 * HTML forms send empty strings for unfilled fields.
 * converts "" to undefined, then coerces valid values to numbers.
 */
const optionalId = z.preprocess(
  (val) => (val === "" || val === null || val === undefined) ? undefined : val,
  z.coerce.number().optional()
);

export const registerSchema = z.object({
  email: kthEmailSchema,
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Please confirm your password"),
  programId: optionalId,
  mastersDegreeId: optionalId,
  specializationId: optionalId,
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
}).superRefine((data, ctx) => {
  // Either programId (Case 1: Base Program) or mastersDegreeId (Case 2: Direct Master's) must be provided
  if (!data.programId && !data.mastersDegreeId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Please select either a Base Program or a Master's Degree.",
      path: ["programId"],
    });
  }
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

/**
 * Review Schema: Validates review submission data.
 * Enforces rating bounds (1-5) and tag limit (3 max).
 */
const ratingField = z.coerce.number().int().min(1, "Rating required").max(5, "Rating must be 1-5");

export const reviewSchema = z.object({
  courseId: z.coerce.number().int().positive("Please select a course"),
  yearTaken: z.coerce.number().int().min(2000, "Invalid year").refine(
    (year) => year <= new Date().getFullYear(),
    { message: "Year cannot be in the future" }
  ),
  ratingProfessor: ratingField,
  ratingMaterial: ratingField,
  ratingPeers: ratingField,
  ratingWorkload: z.enum(["light", "medium", "heavy"], {
    message: "Please select workload level"
  }),
  content: z.string().max(2000, "Review too long (max 2000 chars)").optional().nullable(),
  tagIds: z.array(z.coerce.number().int().positive()).max(3, "Maximum 3 tags allowed").optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
