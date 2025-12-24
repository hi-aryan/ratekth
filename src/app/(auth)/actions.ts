"use server"

import { kthEmailSchema } from "@/lib/validation";
import { signIn, signOut } from "@/services/auth";

export async function loginAction(formData: FormData) {
  const result = kthEmailSchema.safeParse(formData.get("email"));

  if (!result.success) { /* TODO: change throw new to return when using with form?? */
    throw new Error(result.error.issues[0]?.message || "Invalid email");
  }

  await signIn("nodemailer", { email: result.data, redirectTo: "/" });
}

export async function logoutAction() {
  await signOut();
}