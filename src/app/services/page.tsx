import type { Metadata } from "next";
import { Suspense } from "react";
import { siteConfig } from "@/data/site-data";
import ServicesPageView from "@/components/services/ServicesPageView";
import { buildPageMetadata } from "@/lib/seo";
import {
  buildBreadcrumbListJsonLd,
  buildGraph,
  buildNamedPathItemListJsonLd,
  buildWebPageJsonLd,
} from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { getServerSiteSettings } from "@/lib/site-settings-server";
import { parseServiceFocus, servicesPageFrom } from "@/lib/services-page";
import { mergeProjectCatalog } from "@/lib/projects";

type PageProps = {
  searchParams?: Promise<{ focus?: string | string[] }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getServerSiteSettings();
  const content = servicesPageFrom(settings);
  return buildPageMetadata({
    title: content.seo.title,
    description: content.seo.description,
    path: "/services",
    absoluteTitle: true,
    keywords: [
      "Prince Parfait GANZA services",
      "software engineering Rwanda",
      "business systems",
      "digital presence",
      "technology consulting Kigali",
    ],
  });
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
  const projects = mergeProjectCatalog(settings.projectRecords);
  const projectTitles = Object.fromEntries(projects.map((project) => [project.id, project.title]));
  const whatsapp = settings.whatsappNumber
    ? `https://wa.me/${settings.whatsappNumber.replace(/\D/g, "")}`
    : siteConfig.social.whatsapp;

  const listItems = content.families.map((family, index) => ({
    name: family.title,
    path: `/services?focus=${family.id}`,
    position: index + 1,
  }));

  return (
    <>
      <JsonLd
        data={buildGraph([
          buildWebPageJsonLd({
            path: "/services",
            name: content.seo.title,
            description: content.seo.description,
          }),
          buildBreadcrumbListJsonLd(breadcrumbItems, "/services"),
          buildNamedPathItemListJsonLd({
            name: "Capability families",
            path: "/services",
            items: listItems,
          }),
        ])}
      />
      <Suspense fallback={<div className="section container theme-copy">Loading services…</div>}>
        <ServicesPageView
          content={content}
          initialFocus={focus}
          projectTitles={projectTitles}
          whatsappUrl={whatsapp}
        />
      </Suspense>
    </>
  );
}
