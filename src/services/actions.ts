"use server"

import { signIn, signOut } from "@/services/auth";

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  
  if (!email) throw new Error("Email is required");

  // This triggers the Nodemailer Gmail logic
  await signIn("nodemailer", { email, redirectTo: "/" });
}

export async function logoutAction() {
  await signOut();
}