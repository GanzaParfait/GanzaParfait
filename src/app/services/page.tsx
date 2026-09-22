import type { Metadata } from "next";
import { siteConfig } from "@/data/site-data";
import ServicesPageView from "@/components/services/ServicesPageView";
import { buildPageMetadata } from "@/lib/seo";
import {
  buildBreadcrumbListJsonLd,
  buildGraph,
  buildNamedPathItemListJsonLd,
  buildPersonJsonLd,
  buildWebPageJsonLd,
} from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { getServerSiteSettings } from "@/lib/site-settings-server";
import { parseServiceFocus, servicesPageFrom } from "@/lib/services-page";
import { mergeProjectCatalog } from "@/lib/projects";

type PageProps = {
  searchParams?: Promise<{ focus?: string | string[] }>;
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const settings = await getServerSiteSettings();
  const content = servicesPageFrom(settings);
  const params = searchParams ? await searchParams : {};
  const focus = parseServiceFocus(params.focus);
  const base = buildPageMetadata({
    title: content.seo.title,
    description: content.seo.description,
    path: "/services",
    absoluteTitle: true,
    keywords: [
      "Prince Parfait GANZA",
      "Prince Parfait GANZA services",
      "Prince Parfait GANZA Kigali",
      "software engineering Rwanda",
      "software engineer Kigali",
      "AI builder Kigali",
      "business systems Kigali",
      "digital presence Rwanda",
      "technology consulting Kigali",
      "practical AI Rwanda",
    ],
  });
  // Focus query variants are UX filters; keep one indexable services URL.
  if (focus) {
    return {
      ...base,
      robots: { index: false, follow: true },
    };
  }
  return base;
}

const breadcrumbItems = [
  { name: "Home", path: "/" },
  { name: "Services", path: "/services" },
];

export default async function ServicesPage({ searchParams }: PageProps) {
  const params = searchParams ? await searchParams : {};
  const focus = parseServiceFocus(params.focus);
  const settings = await getServerSiteSettings();
  const content = servicesPageFrom(settings);
  const catalog = mergeProjectCatalog(settings.projectRecords);
  const projects = catalog.map((project) => ({
    id: project.id,
    title: project.title,
    description: project.description,
    image: project.image || project.logo || "/images/projects/project-placeholder.png",
    organization: project.organization,
  }));
  const whatsapp = settings.whatsappNumber
    ? `https://wa.me/${settings.whatsappNumber.replace(/\D/g, "")}`
    : siteConfig.social.whatsapp;

  const listItems = content.families.map((family, index) => ({
    name: `${family.title} — Prince Parfait GANZA`,
    path: `/services#${family.id}`,
    position: index + 1,
  }));

  return (
    <>
      <JsonLd
        data={buildGraph([
          buildPersonJsonLd(),
          buildWebPageJsonLd({
            path: "/services",
            name: content.seo.title,
            description: content.seo.description,
          }),
          buildBreadcrumbListJsonLd(breadcrumbItems, "/services"),
          buildNamedPathItemListJsonLd({
            name: "Services by Prince Parfait GANZA",
            path: "/services",
            items: listItems,
          }),
        ])}
      />
      <ServicesPageView
        content={content}
        initialFocus={focus}
        projects={projects}
        whatsappUrl={whatsapp}
      />
    </>
  );
}
