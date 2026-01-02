/**
 * Auth Layout: Shared layout for all (auth) route group pages.
 * Provides consistent positioning and styling for login, register, reset-password.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <main className="flex min-h-screen flex-col items-center pt-20 px-6 bg-porcelain">
            <div className="w-full max-w-md space-y-8">
                {children}
            </div>
        </main>
    );
}
