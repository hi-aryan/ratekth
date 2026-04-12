import type { MetadataRoute } from "next";
import { getAllCoursesForSitemap } from "@/services/courses";
import { getAllReviewsForSitemap } from "@/services/reviews";

// `postgres.railway.internal` only resolves at runtime inside Railway's network,
// not during `next build`. Force-dynamic so the DB queries run at request time.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const [courses, reviews] = await Promise.all([
        getAllCoursesForSitemap(),
        getAllReviewsForSitemap(),
    ]);

    const courseUrls: MetadataRoute.Sitemap = courses.map(({ code }) => ({
        url: `https://ratekth.se/course/${code}`,
    }));

    const reviewUrls: MetadataRoute.Sitemap = reviews.map(({ id, datePosted }) => ({
        url: `https://ratekth.se/review/${id}`,
        lastModified: datePosted,
    }));

    return [
        { url: "https://ratekth.se" },
        ...courseUrls,
        ...reviewUrls,
    ];
}
