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
});

export type LoginInput = z.infer<typeof loginSchema>;