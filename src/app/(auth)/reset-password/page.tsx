import { redirect } from "next/navigation";
import { validatePasswordResetToken } from "@/services/auth";
import { ResetPasswordForm } from "@/components/forms/ResetPasswordForm";
import { Card } from "@/components/ui/Card";
import { BackLink } from "@/components/ui/BackLink";
import { BorderBeam } from "@/components/ui/BorderBeam";

export const dynamic = "force-dynamic";

interface ResetPasswordPageProps {
    searchParams: Promise<{ token?: string }>;
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
    const { token } = await searchParams;

    // No token in URL = invalid access
    if (!token) {
        redirect("/login?error=reset-link-invalid");
    }

    // Validate token immediately (UX: don't show form if link is dead)
    const email = await validatePasswordResetToken(token);
    if (!email) {
        redirect("/login?error=reset-link-invalid");
    }

    return (
        <>
            <BackLink href="/login" label="Back to Login" className="mb-4" />
            <div className="text-center text-carbon">
                <h1 className="text-2xl font-bold">Reset Password</h1>
                <p className="text-carbon/60 mt-2">Enter your new password below.</p>
            </div>
            <Card className="relative">
                <div className="absolute inset-0 overflow-hidden rounded-lg pointer-events-none">
                    <BorderBeam duration={8} size={200} />
                </div>
                <ResetPasswordForm token={token} />
            </Card>
        </>
    );
}
