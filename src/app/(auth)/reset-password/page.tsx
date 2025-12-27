import { redirect } from "next/navigation";
import { ResetPasswordForm } from "@/components/forms/ResetPasswordForm";
import { Card } from "@/components/ui/Card";

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

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-50">
            <div className="w-full max-w-md space-y-8">
                <div className="mb-8 text-center text-slate-900">
                    <h1 className="text-2xl font-bold">Reset Password</h1>
                    <p className="text-slate-500 mt-2">Enter your new password below.</p>
                </div>
                <Card className="shadow-xl shadow-slate-200/50">
                    <ResetPasswordForm token={token} />
                </Card>
            </div>
        </main>
    );
}
