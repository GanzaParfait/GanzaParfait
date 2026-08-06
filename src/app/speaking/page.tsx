import type { Metadata } from "next";
import { siteConfig, speakingEngagements } from "@/data/site-data";
import AnimatedSection from "@/components/ui/AnimatedSection";
import Link from "next/link";
import {
  RiArrowRightLine,
  RiMicLine,
  RiTeamLine,
  RiGlobeLine,
  RiVideoLine,
} from "react-icons/ri";

export const metadata: Metadata = {
  title: "Speaking",
  description:
    "Prince Parfait GANZA speaks on AI, software engineering, entrepreneurship, and technology building in Africa at conferences, workshops, and universities.",
  alternates: { canonical: `${siteConfig.url}/speaking` },
  openGraph: {
    title: "Speaking — Prince Parfait GANZA",
    description:
      "Speaking on AI, software engineering, and entrepreneurship by Prince Parfait GANZA.",
    url: `${siteConfig.url}/speaking`,
  },
};

const topics = [
  {
    icon: RiGlobeLine,
    title: "AI in African Contexts",
    description:
      "How to build AI products that work in low-connectivity, low-resource environments with underrepresented languages.",
  },
  {
    icon: RiTeamLine,
    title: "From Student to Founder",
    description:
      "The journey of building a technology company as a young entrepreneur in Africa — honest lessons from the trenches.",
  },
  {
    icon: RiMicLine,
    title: "The Future of Software Engineering",
    description:
      "How AI is reshaping software development and what engineers need to know to stay relevant.",
  },
  {
    icon: RiVideoLine,
    title: "Building for Impact",
    description:
      "Why purposeful software — built with real users in mind — always outperforms feature-bloated products.",
  },
];

const typeConfig: Record<string, string> = {
  conference: "badge-primary",
  workshop: "badge-success",
  panel: "badge-outline",
  podcast: "badge-outline",
};

export default function SpeakingPage() {
  return (
    <>
      {/* Header */}
      <section className="section pt-32 pb-10 relative dot-grid overflow-hidden" aria-label="Speaking header">
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-radial pointer-events-none" />
        <div className="container relative z-10 max-w-4xl">
          <AnimatedSection>
            <p className="section-label">Speaking</p>
            <h1 className="text-white mb-4" style={{ fontFamily: "var(--font-heading)" }}>
              Sharing what I know.
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed max-w-2xl">
              I speak at conferences, universities, and events on AI, software
              engineering, and building technology in Africa. If you&apos;d like me
              to speak at your event, reach out.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Topics */}
      <section className="section bg-mesh" aria-label="Speaking topics">
        <div className="container">
          <AnimatedSection className="mb-12">
            <p className="section-label">Topics</p>
            <h2 className="text-white" style={{ fontFamily: "var(--font-heading)" }}>
              What I speak about.
            </h2>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {topics.map((topic, i) => (
              <AnimatedSection key={topic.title} delay={i * 80}>
                <article className="card glass-hover p-7 h-full flex gap-5" aria-label={topic.title}>
                  <div
                    className="w-12 h-12 rounded-xl bg-[rgba(14,82,168,0.15)] border border-[rgba(14,82,168,0.2)] flex items-center justify-center text-[#60a5fa] flex-shrink-0"
                    aria-hidden="true"
                  >
                    <topic.icon size={22} />
                  </div>
                  <div>
                    <h3
                      className="text-white font-semibold mb-2"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      {topic.title}
                    </h3>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      {topic.description}
                    </p>
                  </div>
                </article>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Past engagements */}
      <section className="section" aria-label="Past speaking engagements">
        <div className="container max-w-3xl">
          <AnimatedSection className="mb-10">
            <p className="section-label">Past Engagements</p>
            <h2 className="text-white" style={{ fontFamily: "var(--font-heading)" }}>
              Where I&apos;ve spoken.
            </h2>
          </AnimatedSection>

          <div className="space-y-4">
            {speakingEngagements.map((engagement, i) => (
              <AnimatedSection key={`${engagement.event}-${i}`} delay={i * 80}>
                <article
                  className="card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  aria-label={`${engagement.title} at ${engagement.event}`}
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`badge ${typeConfig[engagement.type]}`}>
                        {engagement.type}
                      </span>
                      <time className="text-xs text-slate-600">{engagement.date}</time>
                    </div>
                    <h3
                      className="text-white font-semibold mb-1"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      {engagement.title}
                    </h3>
                    <p className="text-sm text-[#60a5fa]">{engagement.event}</p>
                    <p className="text-xs text-slate-600 mt-0.5">{engagement.location}</p>
                  </div>
                </article>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Invite CTA */}
      <section className="section" aria-label="Speaking invitation">
        <div className="container">
          <AnimatedSection>
            <div className="relative rounded-2xl overflow-hidden text-center">
              <div className="absolute inset-0 bg-[#0B192C]" aria-hidden="true" />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(ellipse 60% 80% at 50% 50%, rgba(14,82,168,0.2) 0%, transparent 70%)",
                }}
                aria-hidden="true"
              />
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#0E52A8] to-transparent opacity-50" aria-hidden="true" />
              <div className="relative z-10 p-12 md:p-16">
                <p className="section-label justify-center">Book Me</p>
                <h2 className="text-white mb-4" style={{ fontFamily: "var(--font-heading)" }}>
                  Invite me to speak.
                </h2>
                <p className="text-slate-400 max-w-md mx-auto mb-8">
                  I&apos;m available for conferences, workshops, university events, and
                  podcasts. Share details and let&apos;s make it happen.
                </p>
                <Link href="/contact" className="btn btn-primary btn-lg">
                  Send an Invitation
                  <RiArrowRightLine size={18} />
                </Link>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
