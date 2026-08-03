import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://univpm-housing-frontend.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Le aree private (dashboard, pannello admin, area proprietari,
      // onboarding) non hanno senso indicizzate su Google — sono
      // comunque protette da login, ma è corretto dirlo esplicitamente
      // anche ai motori di ricerca.
      disallow: ["/dashboard", "/admin", "/owner", "/onboarding", "/reset-password"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
