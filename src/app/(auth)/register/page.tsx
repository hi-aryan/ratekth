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
        <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-porcelain">
            <Card className="w-full max-w-xl">
                <div className="mb-4 text-center">
                    <h1 className="text-2xl font-bold text-carbon">Join rateKTH</h1>
                    <p className="text-carbon/60 mt-2">The home of student reviews.</p>
                </div>

                <RegisterForm basePrograms={basePrograms} mastersDegrees={mastersDegrees} />
            </Card>
        </div>
    );
}
