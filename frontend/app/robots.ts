import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",
        "/api/",
        "/dashboard",
        "/owner",
        "/onboarding",
        "/lista-attesa/conferma",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
