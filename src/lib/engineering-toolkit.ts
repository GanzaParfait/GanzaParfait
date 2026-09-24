/**
 * Engineering toolkit — technologies as evidence-backed tools, not identity labels.
 * Categories only list items that appear on public projects, experience, or documented capabilities.
 */

import { listListedProjects } from "@/lib/projects";
import type { Project } from "@/data/site-data";

export type ToolkitCategoryId =
  | "frontend"
  | "backend"
  | "databases"
  | "research"
  | "analytics"
  | "cloud";

export type ToolkitItem = {
  name: string;
  /** Extra aliases matched against project.technologies (case-insensitive). */
  aliases?: string[];
};

export type ToolkitCategory = {
  id: ToolkitCategoryId;
  title: string;
  items: ToolkitItem[];
};

export const ENGINEERING_TOOLKIT: ToolkitCategory[] = [
  {
    id: "frontend",
    title: "Frontend Engineering",
    items: [
      { name: "React" },
      { name: "Next.js" },
      { name: "TypeScript" },
      { name: "JavaScript" },
    ],
  },
  {
    id: "backend",
    title: "Backend & APIs",
    items: [
      { name: "Node.js" },
      { name: "PHP" },
      { name: "REST APIs", aliases: ["API integration", "APIs"] },
    ],
  },
  {
    id: "databases",
    title: "Databases & Data",
    items: [
      { name: "PostgreSQL" },
      { name: "MySQL" },
      { name: "SQL" },
      { name: "Supabase" },
    ],
  },
  {
    id: "research",
    title: "Research & Data Collection",
    items: [
      { name: "XLSForm", aliases: ["xlsform"] },
      {
        name: "Survey Logic",
        aliases: [
          "questionnaire logic",
          "survey programming",
          "skip logic",
          "Survey Logic",
        ],
      },
      { name: "CAPI", aliases: ["capi"] },
      { name: "CATI", aliases: ["cati"] },
      { name: "CAWI", aliases: ["cawi"] },
      {
        name: "GPS / Geolocation",
        aliases: ["GPS / geolocation", "GPS-enabled", "GPS", "geolocation"],
      },
    ],
  },
  {
    id: "analytics",
    title: "Data & Analytics",
    items: [
      { name: "Python" },
      { name: "Power BI" },
      { name: "Data Analysis", aliases: ["Data analysis", "Reporting", "Dashboards"] },
    ],
  },
  {
    id: "cloud",
    title: "Cloud, Media & Delivery",
    items: [
      { name: "Cloudinary" },
      { name: "GitHub", aliases: ["Git", "Git/GitHub"] },
      { name: "Vercel" },
      { name: "Netlify" },
      { name: "Render" },
      { name: "Cloudflare" },
      { name: "Stripe", aliases: ["Stripe / international payments"] },
    ],
  },
];

function normalizeTechToken(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function techMatches(projectTech: string, item: ToolkitItem): boolean {
  const hay = normalizeTechToken(projectTech);
  const name = normalizeTechToken(item.name);
  if (!hay) return false;
  if (hay === name) return true;
  if (hay.includes(name) || name.includes(hay)) return true;
  return (item.aliases || []).some((alias) => {
    const needle = normalizeTechToken(alias);
    return hay === needle || hay.includes(needle) || needle.includes(hay);
  });
}

function projectEvidenceBag(project: Project): string[] {
  return [
    ...(project.technologies || []),
    ...(project.capabilities || []),
    ...(project.features || []),
    ...(project.highlights || []),
  ];
}

export function evidenceProjectsForTech(
  item: ToolkitItem,
  records?: Project[] | null,
): Project[] {
  return listListedProjects(records).filter((project) =>
    projectEvidenceBag(project).some((tech) => techMatches(tech, item)),
  );
}

/** Categories with at least one toolkit item that has project evidence (or always show curated set with evidence badges). */
export function toolkitWithEvidence(records?: Project[] | null) {
  return ENGINEERING_TOOLKIT.map((category) => ({
    ...category,
    items: category.items.map((item) => {
      const evidence = evidenceProjectsForTech(item, records);
      return { ...item, evidence };
    }),
  }));
}
