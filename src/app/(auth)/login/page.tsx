import { LoginForm } from "@/components/forms/LoginForm";
import { ResendVerificationForm } from "@/components/forms/ResendVerificationForm";

export const dynamic = "force-dynamic"; /* wtf is this? */
export default function LoginPage() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-50">
            <div className="w-full max-w-md space-y-8">
                <div className="mb-8 text-center text-slate-900">
                    <h1 className="text-2xl font-bold">Welcome Back</h1>
                    <p className="text-slate-500 mt-2">Login with your KTH credentials.</p>
                </div>
                <div className="bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
                    <LoginForm />
                </div>

                {/* Resend Verification Section */}
                <details className="bg-white p-6 rounded-2xl shadow-md shadow-slate-200/50 border border-slate-100">
                    <summary className="cursor-pointer text-sm font-medium text-slate-500 hover:text-slate-900">
                        Didn't receive verification email?
                    </summary>
                    <div className="mt-4 pt-4 border-t border-slate-100">
                        <ResendVerificationForm />
                    </div>
                </details>
            </div>
        </main>
    )
}
