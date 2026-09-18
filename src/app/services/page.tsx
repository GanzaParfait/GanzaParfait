import type { Metadata } from "next";
import { Suspense } from "react";
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

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getServerSiteSettings();
  const content = servicesPageFrom(settings);
  return buildPageMetadata({
    title: content.seo.title,
    description: content.seo.description,
    path: "/services",
    absoluteTitle: true,
    keywords: [
      "Prince Parfait GANZA",
      "Prince Parfait GANZA services",
      "Prince Parfait GANZA Kigali",
      "software engineering Rwanda",
      "business systems Kigali",
      "digital presence Rwanda",
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
    path: `/services?focus=${family.id}`,
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
      <Suspense fallback={<div className="section container theme-copy">Loading services…</div>}>
        <ServicesPageView
          content={content}
          initialFocus={focus}
          projects={projects}
          whatsappUrl={whatsapp}
        />
      </Suspense>
    </>
  );
}
