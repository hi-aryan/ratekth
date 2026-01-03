import { auth } from "@/services/auth";
import { logoutAction } from "@/actions/auth";
import { getUserWithProgramCredits } from "@/services/users";
import { getMastersDegrees } from "@/services/programs";
import { AccountMastersForm } from "@/components/forms/AccountMastersForm";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { BackLink } from "@/components/ui/BackLink";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
    const session = await auth();

    // Defense-in-depth: proxy.ts handles this, but verify anyway
    if (!session?.user?.id) {
        redirect("/login?error=unauthorized");
    }

    // Fetch user with eligibility info
    const user = await getUserWithProgramCredits(session.user.id);

    if (!user) {
        redirect("/login?error=unauthorized");
    }

    // Determine eligibility: base program (180hp or 300hp) with no selection yet
    const isEligible = user.programCredits === 180 || user.programCredits === 300;
    const hasSelectedMasters = user.mastersDegreeId !== null;
    const canSelectMasters = isEligible && !hasSelectedMasters;

    // Fetch master's degrees only if user can select
    const mastersDegrees = canSelectMasters ? await getMastersDegrees() : [];

    return (
        <div className="max-w-2xl mx-auto px-4 py-4">
            <BackLink href="/" label="Home" className="mb-4" />

            <h1 className="text-2xl font-bold text-carbon mb-6">Your Account</h1>

            {/* Profile Info Card */}
            <Card className="mb-6">
                <div className="space-y-4">
                    <h2 className="font-semibold text-carbon text-lg">Profile</h2>

                    {/* Email */}
                    <div>
                        <p className="text-sm text-carbon/60">Email</p>
                        <p className="text-carbon">{user.email}</p>
                    </div>

                    {/* Base Program */}
                    {user.programCode && user.programName && (
                        <div>
                            <p className="text-sm text-carbon/60">Base Program</p>
                            <p className="text-carbon">
                                [{user.programCode}] {user.programName}
                                <span className="text-carbon/50 ml-1">
                                    ({user.programCredits}hp)
                                </span>
                            </p>
                        </div>
                    )}

                    {/* Master's Degree (if selected) */}
                    {user.mastersDegree && (
                        <div>
                            <p className="text-sm text-carbon/60">Master&apos;s Degree</p>
                            <p className="text-carbon flex items-center gap-2">
                                [{user.mastersDegree.code}] {user.mastersDegree.name}
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                    </svg>
                                    Locked
                                </span>
                            </p>
                        </div>
                    )}

                    {/* Specialization (if selected) */}
                    {user.specialization && (
                        <div>
                            <p className="text-sm text-carbon/60">Specialization</p>
                            <p className="text-carbon">{user.specialization.name}</p>
                        </div>
                    )}
                </div>
            </Card>

            {/* Academic Selection Section */}
            {canSelectMasters && (
                <Card className="mb-6">
                    <AccountMastersForm mastersDegrees={mastersDegrees} />
                </Card>
            )}

            {/* Not Eligible Message */}
            {!isEligible && !hasSelectedMasters && (
                <Card className="mb-6">
                    <div className="text-center py-4">
                        <p className="text-carbon/60">
                            Master&apos;s degree selection is only available for students in base programs (180hp Bachelor or 300hp Master).
                        </p>
                    </div>
                </Card>
            )}

            {/* Logout Section */}
            <div className="pt-6 border-t border-carbon/10">
                <form action={logoutAction}>
                    <Button
                        type="submit"
                        variant="secondary"
                        className="w-full"
                    >
                        Log Out
                    </Button>
                </form>
            </div>
        </div>
    );
}
