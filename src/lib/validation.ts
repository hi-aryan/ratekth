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

export const registerSchema = z.object({
  email: kthEmailSchema,
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Please confirm your password"),
  /* TODO: user should have either program or masters degree+specialization, at least one 
           base program is not a must */
  programId: z.coerce.number({ message: "Please select a program" }),
  mastersDegreeId: z.coerce.number().optional(),
  specializationId: z.coerce.number().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;