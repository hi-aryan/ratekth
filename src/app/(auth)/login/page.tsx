import { LoginForm } from "@/components/forms/LoginForm";
import { ResendVerificationForm } from "@/components/forms/ResendVerificationForm";
import { ForgotPasswordForm } from "@/components/forms/ForgotPasswordForm";
import { Card } from "@/components/ui/Card";

/** force-dynamic: Ensures fresh session check on each request */
export const dynamic = "force-dynamic";
export default function LoginPage() {
    return (
        <>
            <div className="text-center text-carbon">
                <h1 className="text-2xl font-bold">Welcome Back</h1>
                <p className="text-carbon/60 mt-2">Login with your rateKTH credentials.</p>
            </div>
            <Card>
                <LoginForm />
            </Card>

            <Card className="p-6 space-y-4">
                <details>
                    <summary className="cursor-pointer text-sm font-medium text-carbon/60 hover:text-carbon">
                        Forgot password?
                    </summary>
                    <div className="mt-4 pt-4 border-t border-carbon/10">
                        <ForgotPasswordForm />
                    </div>
                </details>

                <details>
                    <summary className="cursor-pointer text-sm font-medium text-carbon/60 hover:text-carbon">
                        Didn't receive verification email?
                    </summary>
                    <div className="mt-4 pt-4 border-t border-carbon/10">
                        <ResendVerificationForm />
                    </div>
                </details>
            </Card>
        </>
    )
}
