/**
 * Centralized Message Registry
 * 
 * Purpose: A single source of truth for all user-facing success and error strings.
 * Helps prevent "magic strings" and makes bulk updates easier.
 */

export const FLASH_MESSAGES = {
    // Success Messages
    "account-created": "Account created! Please check your KTH inbox to verify your email.",
    "verified": "Email verified successfully!",
    "logged-out": "Successfully logged out.",
    "review-posted": "Your review has been published!",
    "review-updated": "Your review has been updated!",
    "review-deleted": "Your review has been deleted.",
    "password-reset": "Password reset successfully! You can now log in with your new password.",
    "academic-updated": "Academic selection saved! Please log in again.",
    "program-specialization-updated": "Program specialization saved! Please log in again.",

    // Error Messages
    "verification-failed": "Invalid or expired verification link. Please request a new one.",
    "login-failed": "Invalid credentials or account not verified.",
    "unauthorized": "You must be logged in to view that page.",
    "reset-link-invalid": "Invalid or expired reset link. Please request a new one.",
    "logout-failed": "Something went wrong while logging out. Please try again.",
    "review-not-found": "Review not found or you don't have permission to edit it.",
    "course-not-found": "Course not found.",
} as const;

export type FlashMessageKey = keyof typeof FLASH_MESSAGES;

export const getFlashMessage = (key: string): string | undefined => {
    return FLASH_MESSAGES[key as FlashMessageKey];
};
