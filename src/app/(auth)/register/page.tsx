import { RegisterForm } from "@/components/forms/RegisterForm";
import { getBasePrograms, getMastersDegrees } from "@/services/programs";
import { Card } from "@/components/ui/Card";
import { BackLink } from "@/components/ui/BackLink";
import { BorderBeam } from "@/components/ui/BorderBeam";

export const dynamic = "force-dynamic";
export default async function RegisterPage() {
    const [basePrograms, mastersDegrees] = await Promise.all([
        getBasePrograms(),
        getMastersDegrees(),
    ]);

    return (
        <>
            <BackLink href="/" label="Home" className="mb-4" />
            <div className="text-center text-carbon">
                <h1 className="text-2xl font-bold">Join rateKTH</h1>
                <p className="text-carbon/60 mt-2">The home of student reviews.</p>
            </div>
            <Card className="relative">
                {/* BorderBeam wrapper with its own overflow-hidden to clip animation */}
                <div className="absolute inset-0 overflow-hidden rounded-lg pointer-events-none">
                    <BorderBeam duration={8} size={200} />
                </div>
                <RegisterForm basePrograms={basePrograms} mastersDegrees={mastersDegrees} />
            </Card>
        </>
    );
}
