import { RegisterForm } from "@/components/forms/RegisterForm";
import { getAllPrograms } from "@/services/programs";

export const dynamic = "force-dynamic";
export default async function RegisterPage() {
    const programs = await getAllPrograms();

    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-50">
            <div className="w-full max-w-xl p-8 bg-white rounded-2xl shadow-sm border border-slate-100">
                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-bold text-slate-900">Join rateKTH</h1>
                    <p className="text-slate-500 mt-2">First, we need to verify your KTH identity.</p>
                </div>

                <RegisterForm programs={programs} />
            </div>
        </div>
    );
}
