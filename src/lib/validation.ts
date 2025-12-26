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

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;