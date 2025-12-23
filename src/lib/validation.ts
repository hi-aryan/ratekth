import { z } from "zod";

export const kthEmailSchema = z
  .email()
  .refine((email) => email.endsWith("@kth.se"), {
    message: "Only @kth.se emails are allowed.",
  });