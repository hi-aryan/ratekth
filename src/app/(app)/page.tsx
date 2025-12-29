import { getCourseByCode } from "@/services/courses";
import { auth } from "@/services/auth";
import { logoutAction } from "@/actions/auth";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default async function Home() {
  const session = await auth();
  const course = await getCourseByCode("ID1018");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-porcelain text-carbon">
      <h1 className="text-4xl font-bold mb-8">rateKTH</h1>

      <Card className="w-full max-w-md">
        {session ? (
          <div className="space-y-4">
            <p className="text-carbon/70">
              Logged in as <span className="font-medium text-carbon">{session.user?.email}</span>
            </p>
            <form action={logoutAction}>
              <Button type="submit">Logout</Button>
            </form>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <p className="text-carbon/70">Sign in to start reviewing courses.</p>
            <Link href="/login">
              <Button>Go to Login</Button>
            </Link>
          </div>
        )}
      </Card>

      <div className="mt-8 text-sm text-carbon/50">
        <p>Featured Course: {course?.name} ({course?.code})</p>
      </div>
    </main>
  );
}

