import { getCourseByCode } from "@/services/courses";
import { auth } from "@/services/auth";
import { logoutAction } from "@/actions/auth";
import { createFeedback } from "@/services/feedback";
import Link from "next/link";

export default async function Home() {
  const session = await auth();
  const course = await getCourseByCode("ID1018");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-slate-50">
      <h1 className="text-4xl font-bold mb-8">rateKTH</h1>

      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-sm border border-slate-100">
        {session ? (
          <div className="space-y-4">
            <p className="text-slate-600">
              Logged in as <span className="font-medium text-slate-900">{session.user?.email}</span>
            </p>
            <form action={logoutAction}>
              <button
                type="submit"
                className="w-full py-2 px-4 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                Logout
              </button>
            </form>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <p className="text-slate-600">Sign in to start reviewing courses.</p>
            <Link
              href="/login"
              className="block w-full py-2 px-4 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all font-medium"
            >
              Go to Login
            </Link>
          </div>
        )}
      </div>

      <div className="mt-12 p-6 bg-slate-100/50 rounded-xl border border-slate-200/60 max-w-md w-full">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Debug Info</h2>
        <div className="space-y-1 text-sm text-slate-600">
          <p>Fetched Course: <span className="text-slate-900">{course?.name || "Not Found"}</span></p>
          <p>Code: <span className="text-slate-900">{course?.code || "N/A"}</span></p>
        </div>

        {/* TEMPORARY FEEDBACK TEST, should probably move to src/actions/feedback.ts later */}
        <form action={async () => {
          "use server"
          try {
            await createFeedback("Test feedback from UI!");
            console.log("Feedback saved!");
          } catch (e) {
            console.error("Feedback failed", e);
          }
        }} className="mt-4 pt-4 border-t border-slate-200">
          <button type="submit" className="text-xs text-blue-600 hover:underline">
            Test Feedback Save
          </button>
        </form>
      </div>
    </main>
  );
}
