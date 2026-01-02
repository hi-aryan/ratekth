import { auth } from "@/services/auth";
import { logoutAction } from "@/actions/auth";
import { Button } from "@/components/ui/Button";
import { WriteReviewButton } from "@/components/ui/WriteReviewButton";
import { MobileSidebar } from "@/components/features/MobileSidebar";
import Link from "next/link";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <main className="min-h-screen bg-porcelain">
      {/* Header - gradient fade from white to transparent */}
      <header className="sticky top-0 z-40 bg-gradient-to-b from-white via-white/90 to-transparent">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-carbon">
            rateKTH
          </Link>

          {/* Desktop Nav - hidden on mobile */}
          {session ? (
            <div className="hidden md:flex items-center gap-3">
              <WriteReviewButton className="w-auto" />
              <form action={logoutAction}>
                <Button type="submit" className="w-auto">
                  Logout
                </Button>
              </form>
            </div>
          ) : (
            <Link href="/login" className="hidden md:block">
              <Button className="w-auto">Sign In</Button>
            </Link>
          )}

          {/* Mobile Sidebar Toggle */}
          <MobileSidebar isAuthenticated={!!session} logoutAction={logoutAction} />
        </div>
      </header>

      {children}
    </main>
  );
}
