import { auth } from "@/services/auth";
import { logoutAction } from "@/actions/auth";
import { getUserWithProgramCredits } from "@/services/users";
import { getSpecializationsByProgramId } from "@/services/specializations";

import { getUserReviews } from "@/services/reviews";
import { AccountMastersForm } from "@/components/forms/AccountMastersForm";
import { AccountProgramSpecForm } from "@/components/forms/AccountProgramSpecForm";
import { MyReviewsList } from "@/components/features/MyReviewsList";
import { CollapsibleSection } from "@/components/ui/CollapsibleSection";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { BackLink } from "@/components/ui/BackLink";
import { redirect } from "next/navigation";
import { Specialization } from "@/lib/types";

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
    const isIntegratedProgram = user.programHasIntegratedMasters === true;
    const hasSelectedMasters = user.mastersDegreeId !== null;
    const canSelectMasters = isEligible && !hasSelectedMasters && !isIntegratedProgram;

    // Determine if user can select program specialization
    const hasSelectedProgramSpec = user.programSpecializationId !== null;
    const canSelectProgramSpec = isEligible && !hasSelectedProgramSpec;

    // Fetch program specializations if eligible
    let programSpecializations: Specialization[] = [];
    if (canSelectProgramSpec && user.programId) {
        programSpecializations = await getSpecializationsByProgramId(user.programId);
    }

    // Fetch user's reviews for My Reviews section
    const userReviews = await getUserReviews(session.user.id);

    return (
        <div className="max-w-3xl mx-auto px-6 py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <BackLink href="/" label="Home" className="mb-8" />

            <div className="flex items-end justify-between mb-8">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-carbon">
                        My Account
                    </h1>
                </div>
            </div>

            <div className="grid gap-8">
                {/* Profile Card */}
                <Card className="p-8">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                        <div className="space-y-6 flex-1">
                            {/* Header */}
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-full bg-carbon flex items-center justify-center text-white font-bold text-xl">
                                    {user.email.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-wider font-bold text-carbon/40 mb-0.5">
                                        Username
                                    </p>
                                    <h2 className="text-xl font-bold text-carbon">
                                        {user.username || "Anonymous"}
                                    </h2>
                                </div>
                            </div>

                            <div className="space-y-4 pt-2">
                                {/* Program Info */}
                                <div className="bg-blue/3 rounded-lg p-4">
                                    <p className="text-xs font-semibold text-carbon/40 uppercase tracking-wide mb-2">
                                        Enrolled Program
                                    </p>
                                    {user.programCode && user.programName ? (
                                        <div>
                                            <div className="flex items-baseline gap-2 justify-center">
                                                <span className="text-sm font-black text-blue bg-blue/10 py-0.5 px-2 rounded-lg">
                                                    {user.programCode}
                                                </span>
                                                <span className="text-lg font-bold text-carbon">
                                                    {user.programName}
                                                </span>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-carbon/60 italic">No program registered</p>
                                    )}
                                </div>

                                {/* Track Info (Master's / Spec) - Only show for non-integrated programs */}
                                {!isIntegratedProgram && (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="bg-blue/3 rounded-lg p-4 text-center">
                                            <p className="text-xs font-semibold text-carbon/40 uppercase tracking-wide mb-1">
                                                Program Specialization
                                            </p>
                                            {user.programSpecialization ? (
                                                <p className="font-semibold text-carbon">
                                                    {user.programSpecialization.name}
                                                </p>
                                            ) : (
                                                <p className="text-carbon/40 italic text-sm">Not selected</p>
                                            )}
                                        </div>
                                        <div className="bg-blue/3 rounded-lg p-4 text-center">
                                            <p className="text-xs font-semibold text-carbon/40 uppercase tracking-wide mb-1">
                                                Master&apos;s Track
                                            </p>
                                            {user.mastersDegree ? (
                                                <p className="font-semibold text-carbon">
                                                    {user.mastersDegree.name}
                                                </p>
                                            ) : (
                                                <p className="text-carbon/40 italic text-sm">Not selected</p>
                                            )}
                                        </div>
                                        <div className="bg-blue/3 rounded-lg p-4 text-center">
                                            <p className="text-xs font-semibold text-carbon/40 uppercase tracking-wide mb-1">
                                                Master&apos;s Specialization
                                            </p>
                                            {user.specialization ? (
                                                <p className="font-semibold text-carbon">
                                                    {user.specialization.name}
                                                </p>
                                            ) : (
                                                <p className="text-carbon/40 italic text-sm">None</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </Card>

                {/* My Reviews Section */}
                <div id="my-reviews" className="scroll-mt-24 animate-in fade-in slide-in-from-bottom-6 duration-600 delay-100">
                    <Card className="overflow-hidden">
                        <CollapsibleSection
                            title="My Reviews"
                            count={userReviews.length}
                        >
                            <MyReviewsList reviews={userReviews} />
                        </CollapsibleSection>
                    </Card>
                </div>

                {/* Program Specialization Section */}
                {canSelectProgramSpec && programSpecializations.length > 0 && (
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
                        <Card className="border-l-4 border-l-green relative">
                            <div className="bg-green/5 rounded-lg p-6 md:p-8">
                                <h3 className="text-xl font-bold text-carbon mb-2">Program Specialization</h3>
                                <p className="text-carbon/60 leading-relaxed">
                                    Select your year-3 specialization track. This will tailor your course feed to show additional courses for your specialization.
                                </p>
                            </div>
                            <div className="p-6 md:p-8">
                                <AccountProgramSpecForm 
                                    specializations={programSpecializations}
                                    programName={user.programName || "your program"}
                                />
                            </div>
                        </Card>
                    </div>
                )}

                {/* Master's Degree Selection Section */}
                {canSelectMasters && (
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
                        <Card className="border-l-4 border-l-blue relative">
                            <div className="bg-blue/3 rounded-lg p-6 md:p-8">
                                <h3 className="text-xl font-bold text-carbon mb-2">Master&apos;s Degree Selection</h3>
                                <p className="text-carbon/60 leading-relaxed">
                                    Please select your Master&apos;s degree track. This will tailor your course feed to show only relevant courses.
                                </p>
                            </div>
                            <div className="p-6 md:p-8">
                                <AccountMastersForm />
                            </div>
                        </Card>
                    </div>
                )}

                {/* Not Eligible Message */}
                {!isEligible && !hasSelectedMasters && (
                    <div className="bg-blue/3 rounded-lg p-6 border border-carbon/10 text-center">
                        <p className="text-carbon/60">
                            Master&apos;s degree selection is only available for students in base programs (180hp Bachelor or 300hp Master).
                        </p>
                    </div>
                )}

                {/* Logout Button */}
                <div className="pt-8 border-t border-carbon/10 flex justify-end">
                    <form action={logoutAction} className="w-full md:w-auto">
                        <Button
                            type="submit"
                            size="lg"
                            loadingText="Logging Out..."
                            className="w-full md:w-auto min-w-[140px] font-bold"
                        >
                            Log Out
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
