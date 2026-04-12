import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    return {
        sitemap: "https://ratekth.se/sitemap.xml",
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: [
                    "/api/",
                    "/account",
                    "/login",
                    "/register",
                    "/reset-password",
                    "/review/new",
                ],
            },
            // Block AI training crawlers (mirrors the previous Cloudflare-managed policy)
            {
                userAgent: [
                    "GPTBot",
                    "CCBot",
                    "ClaudeBot",
                    "Google-Extended",
                    "Amazonbot",
                    "Applebot-Extended",
                    "Bytespider",
                    "meta-externalagent",
                    "CloudflareBrowserRenderingCrawler",
                ],
                disallow: "/",
            },
        ],
    };
}
