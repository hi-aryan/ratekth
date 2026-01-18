import { auth } from "@/services/auth";
import { Button } from "@/components/ui/Button";
import { WriteReviewButton } from "@/components/ui/WriteReviewButton";
import { MobileSidebar } from "@/components/features/MobileSidebar";
import { MobileReviewFab } from "@/components/ui/MobileReviewFab";
import Image from "next/image";
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
          <Link href="/">
            <Image
              src="/ratekth-new-logo.png"
              alt="rateKTH"
              width={120}
              height={32}
              className="h-8 w-auto -my-2 transition-transform duration-200 ease-in-out hover:scale-105 active:scale-95"
              priority
            />
          </Link>

          {/* Desktop Nav - hidden on mobile */}
          {session ? (
            <div className="hidden md:flex items-center gap-3">
              <WriteReviewButton />
              <Link href="/account">
                <Button>Account</Button>
              </Link>
            </div>
          ) : (
            <Link href="/login" className="hidden md:block">
              <Button showShine>Sign In</Button>
            </Link>
          )}

          {/* Mobile Sidebar Toggle */}
          <MobileSidebar isAuthenticated={!!session} />
        </div>
      </header>

      {children}

      {/* Mobile FAB for writing reviews */}
      <MobileReviewFab isAuthenticated={!!session} />
    </main>
  );
}
