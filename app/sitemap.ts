import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/`, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/como-comprar`, changeFrequency: "yearly", priority: 0.6 },
    { url: `${SITE_URL}/contato`, changeFrequency: "yearly", priority: 0.4 },
  ];
}
