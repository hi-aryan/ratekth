import type { MetadataRoute } from "next";
import { getAllCoursesForSitemap } from "@/services/courses";
import { getAllReviewsForSitemap } from "@/services/reviews";

// Regenerate at most once per hour so Googlebot always gets fresh URLs
// without hitting the DB on every crawl.
export const revalidate = 3600;

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
