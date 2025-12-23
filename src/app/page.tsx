import { getCourseByCode } from "@/services/courses";

export default async function Home() {
  const course = await getCourseByCode("ID1018");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-purple-200">
      <h1 className="text-4xl font-bold">rateKTH</h1>
      <div className="mt-8 p-4 bg-white rounded shadow">
        <p>Fetched Course: {course?.name || "Not Found"}</p>
        <p>Code: {course?.code || "N/A"}</p>
      </div>
    </main>
  );
}
