import type { MetadataRoute } from "next";
import { projects, blogPosts } from "@/data/site-data";
import { canonicalUrl } from "@/lib/schema";
import { sitemapLastModified } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const revised = sitemapLastModified();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: canonicalUrl("/"), lastModified: revised, changeFrequency: "monthly", priority: 1 },
    { url: canonicalUrl("/about"), lastModified: revised, changeFrequency: "monthly", priority: 0.9 },
    { url: canonicalUrl("/projects"), lastModified: revised, changeFrequency: "monthly", priority: 0.9 },
    { url: canonicalUrl("/experience"), lastModified: revised, changeFrequency: "monthly", priority: 0.85 },
    { url: canonicalUrl("/services"), lastModified: revised, changeFrequency: "monthly", priority: 0.6 },
    { url: canonicalUrl("/contact"), lastModified: revised, changeFrequency: "yearly", priority: 0.7 },
  ];

  const projectRoutes: MetadataRoute.Sitemap = projects.map((project) => ({
    url: canonicalUrl(`/projects/${project.id}`),
    lastModified: revised,
    changeFrequency: "monthly" as const,
    priority: project.featured ? 0.8 : 0.7,
  }));

  const articleRoutes: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: canonicalUrl(`/blog/${post.slug}`),
    lastModified: new Date(post.date),
    changeFrequency: "yearly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...projectRoutes, ...articleRoutes];
}
