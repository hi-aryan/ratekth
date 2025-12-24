import { LoginForm } from "@/components/forms/LoginForm"

export default function LoginPage() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-50">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Sign in to rateKTH</h1>
                    <p className="text-slate-500 font-medium">Use your KTH email to get started</p>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
                    <LoginForm />
                </div>
            </div>
        </main>
    )
}
