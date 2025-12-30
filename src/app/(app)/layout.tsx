import { auth } from "@/services/auth";
import { logoutAction } from "@/actions/auth";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <main className="min-h-screen bg-porcelain">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-carbon/10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-carbon">
            rateKTH
          </Link>
          {session ? (
            <div className="flex items-center gap-3">
              <Link href="/review/new">
                <Button className="w-auto">Write Review</Button>
              </Link>
              <form action={logoutAction}>
                <Button type="submit" className="w-auto">
                  Logout
                </Button>
              </form>
            </div>
          ) : (
            <Link href="/login">
              <Button className="w-auto">Sign In</Button>
            </Link>
          )}
        </div>
      </header>

      {children}
    </main>
  );
}

