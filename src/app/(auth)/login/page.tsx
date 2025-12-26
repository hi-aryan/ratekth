import { LoginForm } from "@/components/forms/LoginForm";
import { ResendVerificationForm } from "@/components/forms/ResendVerificationForm";
import { Card } from "@/components/ui/Card";

/** force-dynamic: Ensures fresh session check on each request */
export const dynamic = "force-dynamic";
export default function LoginPage() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-50">
            <div className="w-full max-w-md space-y-8">
                <div className="mb-8 text-center text-slate-900">
                    <h1 className="text-2xl font-bold">Welcome Back</h1>
                    <p className="text-slate-500 mt-2">Login with your KTH credentials.</p>
                </div>
                <Card className="shadow-xl shadow-slate-200/50">
                    <LoginForm />
                </Card>

                <Card className="p-6 shadow-md shadow-slate-200/50">
                    <details>
                        <summary className="cursor-pointer text-sm font-medium text-slate-500 hover:text-slate-900">
                            Didn't receive verification email?
                        </summary>
                        <div className="mt-4 pt-4 border-t border-slate-100">
                            <ResendVerificationForm />
                        </div>
                    </details>
                </Card>
            </div>
        </main>
    )
}
