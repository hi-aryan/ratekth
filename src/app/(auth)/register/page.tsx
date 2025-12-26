import { RegisterForm } from "@/components/forms/RegisterForm";
import { getBasePrograms, getMastersDegrees } from "@/services/programs";
import { Card } from "@/components/ui/Card";

export const dynamic = "force-dynamic";
export default async function RegisterPage() {
    const [basePrograms, mastersDegrees] = await Promise.all([
        getBasePrograms(),
        getMastersDegrees(),
    ]);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-50">
            <Card className="w-full max-w-xl">
                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-bold text-slate-900">Join rateKTH</h1>
                    <p className="text-slate-500 mt-2">First, we need to verify your KTH identity.</p>
                </div>

                <RegisterForm basePrograms={basePrograms} mastersDegrees={mastersDegrees} />
            </Card>
        </div>
    );
}
