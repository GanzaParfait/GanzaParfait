import type { Metadata } from "next";
import Link from "next/link";
import { RiArrowRightLine } from "react-icons/ri";
import { identity, siteConfig } from "@/data/site-data";
import { buildPageMetadata } from "@/lib/seo";
import { buildBreadcrumbListJsonLd, buildGraph, buildWebPageJsonLd } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import AnimatedSection from "@/components/ui/AnimatedSection";

const PAGE_DESCRIPTION =
  "Lerony is the venture Prince Parfait GANZA founded and leads from Kigali. This page explains the company without turning the personal site into the corporate website.";

export const metadata: Metadata = buildPageMetadata({
  title: "Ventures | Prince Parfait GANZA",
  description: PAGE_DESCRIPTION,
  path: "/ventures",
  absoluteTitle: true,
});

const breadcrumbItems = [
  { name: "Home", path: "/" },
  { name: "Ventures", path: "/ventures" },
];

export default function VenturesPage() {
  return (
    <>
      <JsonLd
        data={buildGraph([
          buildWebPageJsonLd({
            path: "/ventures",
            name: "Ventures | Prince Parfait GANZA",
            description: PAGE_DESCRIPTION,
          }),
          buildBreadcrumbListJsonLd(breadcrumbItems, "/ventures"),
        ])}
      />
      <Breadcrumbs items={breadcrumbItems} />
      <section className="section pt-8" aria-label="Ventures">
        <div className="container" style={{ maxWidth: "46rem" }}>
          <AnimatedSection>
            <p className="section-label">Ventures</p>
            <h1 className="theme-heading" style={{ marginBottom: "1rem" }}>
              A founder-led company, not a side label.
            </h1>
            <p className="theme-copy text-lg" style={{ marginBottom: "1.5rem" }}>
              {identity.compactBio} The venture that carries the commercial work is {siteConfig.company.name}.
            </p>
          </AnimatedSection>
          <article className="card p-8">
            <p className="section-label">{siteConfig.company.role} · {siteConfig.company.established}</p>
            <h2 style={{ color: "var(--color-text)", marginBottom: "0.75rem" }}>{siteConfig.company.name}</h2>
            <p style={{ color: "var(--color-text-2)", marginBottom: "0.85rem" }}>
              Lerony is a Rwanda-based technology and innovation company. Its focus is digital products, operational systems, and consulting that help organizations move from an ambitious idea to something staff can actually run.
            </p>
            <p style={{ color: "var(--color-text-2)", marginBottom: "1.4rem" }}>
              Prince&apos;s role is {siteConfig.company.role}: leadership of the company, not a job title borrowed from a client project. The company site is lerony.com. This page exists so the personal portfolio can name the venture without becoming the company website.
            </p>
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <a href={siteConfig.company.url} className="btn btn-primary" target="_blank" rel="noopener noreferrer">
                Open lerony.com
                <RiArrowRightLine size={16} />
              </a>
              <Link href="/services" className="btn btn-outline">
                How engagements work
              </Link>
              <Link href="/projects" className="btn btn-ghost">
                Selected work
              </Link>
            </div>
          </article>
        </div>
      </section>
    </>
  );
}
