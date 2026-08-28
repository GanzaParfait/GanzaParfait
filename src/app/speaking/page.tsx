import type { Metadata } from "next";
import { speakingEngagements } from "@/data/site-data";
import AnimatedSection from "@/components/ui/AnimatedSection";
import Link from "next/link";
import { RiArrowRightLine } from "react-icons/ri";
import { buildPageMetadata } from "@/lib/seo";
import { buildBreadcrumbListJsonLd, buildGraph, buildWebPageJsonLd } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import Breadcrumbs from "@/components/seo/Breadcrumbs";

const PAGE_DESCRIPTION =
  "Verified training record, including data-systems training with Eshuri Learning, and invitations for technical sessions.";

export const metadata: Metadata = buildPageMetadata({
  title: "Speaking and training | Prince Parfait GANZA",
  description: PAGE_DESCRIPTION,
  path: "/speaking",
  absoluteTitle: true,
});

const breadcrumbItems = [
  { name: "Home", path: "/" },
  { name: "Speaking", path: "/speaking" },
];

export default function SpeakingPage() {
  return (
    <>
      <JsonLd
        data={buildGraph([
          buildWebPageJsonLd({
            path: "/speaking",
            name: "Speaking and training | Prince Parfait GANZA",
            description: PAGE_DESCRIPTION,
          }),
          buildBreadcrumbListJsonLd(breadcrumbItems, "/speaking"),
        ])}
      />
      <Breadcrumbs items={breadcrumbItems} />

      <section className="section pt-8 pb-10" aria-label="Speaking header">
        <div className="container max-w-4xl">
          <AnimatedSection>
            <p className="section-label">Speaking & training</p>
            <h1 className="theme-heading mb-4">Knowledge sharing with a paper trail.</h1>
            <p className="theme-copy text-lg leading-relaxed max-w-2xl">
              The public record here is training that actually happened. Conference keynotes and university talks are not listed because they have not been verified for this site.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="section pt-0" aria-label="Training record">
        <div className="container max-w-3xl">
          <AnimatedSection className="mb-10">
            <p className="section-label">Record</p>
            <h2 className="theme-heading">Documented engagements.</h2>
          </AnimatedSection>
          <div className="space-y-4">
            {speakingEngagements.map((engagement, i) => (
              <AnimatedSection key={`${engagement.event}-${i}`} delay={i * 80}>
                <article className="card p-6">
                  <span className="badge badge-primary">{engagement.type}</span>
                  <h3 className="theme-heading font-semibold mt-3 mb-1">{engagement.title}</h3>
                  <p className="text-sm font-medium" style={{ color: "var(--color-primary)" }}>{engagement.event}</p>
                  <p className="text-sm theme-copy mt-3">{engagement.topic}</p>
                  <p className="text-xs theme-muted mt-3">{engagement.location} · {engagement.date}</p>
                </article>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="section" aria-label="Invitation" style={{ background: "var(--color-bg-2)" }}>
        <div className="container text-center">
          <AnimatedSection>
            <h2 className="theme-heading mb-4">Invite a session.</h2>
            <p className="theme-copy mb-8 max-w-md mx-auto">
              Available for technical training, workshops, and speaking where the brief is real. Send the audience, format, and date.
            </p>
            <Link href="/contact" className="btn btn-primary btn-lg">
              Send an invitation
              <RiArrowRightLine size={18} />
            </Link>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
