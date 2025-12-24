"use server"

import { loginSchema } from "@/lib/validation";
import { signIn, signOut } from "@/services/auth";
import { ActionState } from "@/lib/types";

/**
 * Action: Handles user login/magic link request.
 * Role: Controller - Validates input, calls service, returns state.
 */
export async function loginAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
    const rawEmail = formData.get("email");
    const result = loginSchema.safeParse({ email: rawEmail }); // any non @kth.se email is alr caught here

    if (!result.success) {
        return {
            error: "Please check your input.",
            fieldErrors: result.error.flatten().fieldErrors,
        };
    }

    const { email } = result.data;

    try {
        await signIn("nodemailer", {
            email,
            redirectTo: "/",
            redirect: false // Manual UI feedback is cleaner
        });

        return {
            success: true,
            message: "Success! Check your KTH inbox for the login link."
        };
    } catch (error) {
        console.error("[LoginAction Error]:", error);
        return {
            error: "Service temporarily unavailable. Please try again later."
        };
    }
}

export async function logoutAction() {
    await signOut();
}
