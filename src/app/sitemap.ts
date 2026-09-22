import type { MetadataRoute } from "next";
import { blogPosts } from "@/data/site-data";
import { getIndexableProjects } from "@/lib/projects";
import { canonicalUrl } from "@/lib/schema";
import { sitemapLastModified } from "@/lib/seo";

/** Rebuild when project records change in Supabase (via short settings cache). */
export const revalidate = 60;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const revised = sitemapLastModified();
  const projects = await getIndexableProjects();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: canonicalUrl("/"), lastModified: revised, changeFrequency: "weekly", priority: 1 },
    { url: canonicalUrl("/about"), lastModified: revised, changeFrequency: "monthly", priority: 0.9 },
    { url: canonicalUrl("/projects"), lastModified: revised, changeFrequency: "weekly", priority: 0.9 },
    { url: canonicalUrl("/experience"), lastModified: revised, changeFrequency: "monthly", priority: 0.85 },
    { url: canonicalUrl("/services"), lastModified: revised, changeFrequency: "monthly", priority: 0.8 },
    { url: canonicalUrl("/cv"), lastModified: revised, changeFrequency: "monthly", priority: 0.75 },
    { url: canonicalUrl("/contact"), lastModified: revised, changeFrequency: "yearly", priority: 0.7 },
    { url: canonicalUrl("/privacy"), lastModified: revised, changeFrequency: "yearly", priority: 0.4 },
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
