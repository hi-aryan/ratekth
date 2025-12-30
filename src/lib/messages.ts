/**
 * Centralized Message Registry
 * 
 * Purpose: A single source of truth for all user-facing success and error strings.
 * Helps prevent "magic strings" and makes bulk updates easier.
 */

export const FLASH_MESSAGES = {
    // Success Messages
    "account-created": "Account created! Please check your KTH inbox to verify your email.",
    "verified": "Email verified successfully! You can now log in.",
    "logged-out": "Successfully logged out.",
    "review-posted": "Your review has been published!",
    "review-updated": "Your review has been updated!",
    "password-reset": "Password reset successfully! You can now log in with your new password.",

    // Error Messages
    "verification-failed": "Invalid or expired verification link. Please request a new one.",
    "login-failed": "Invalid credentials or account not verified.",
    "unauthorized": "You must be logged in to view that page.",
    "reset-link-invalid": "Invalid or expired reset link. Please request a new one.",
    "logout-failed": "Something went wrong while logging out. Please try again.",
} as const;

export type FlashMessageKey = keyof typeof FLASH_MESSAGES;

export const getFlashMessage = (key: string): string | undefined => {
    return FLASH_MESSAGES[key as FlashMessageKey];
};
