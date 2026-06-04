"use client";

import { useRef, useEffect, useState } from "react";

const experiences = [
  {
    id: "lerony",
    company: "Lerony Co. Ltd",
    role: "CEO & Founder",
    period: "2023 – Present",
    location: "Rwanda",
    type: "Founded",
    gradient: "from-blue-500/20 to-violet-500/20",
    accentColor: "blue",
    borderColor: "border-blue-500/30",
    dotColor: "bg-blue-500",
    outcomes: [
      {
        icon: "🏗️",
        title: "Built a Company from Zero",
        detail:
          "Founded and scaled Lerony Co. Ltd from a single idea into a full-service technology firm delivering IT infrastructure, custom software, and digital transformation strategies to clients across Rwanda.",
      },
      {
        icon: "⚙️",
        title: "Automated Client Technical Pipelines",
        detail:
          "Designed and implemented end-to-end process automation systems that reduced manual operational overhead by 60%, enabling clients to redirect resources into growth-oriented activities.",
      },
      {
        icon: "🌐",
        title: "Drove Digital Transformation",
        detail:
          "Led the digital overhaul of multiple client organizations — migrating legacy workflows to modern cloud-native architectures, resulting in improved uptime, faster delivery cycles, and measurable cost savings.",
      },
      {
        icon: "📊",
        title: "Executive Strategy & Vision",
        detail:
          "Simultaneously held the CEO role while serving as lead architect — developing go-to-market strategies, managing client relationships, and overseeing technical delivery with a lean, high-performance team.",
      },
    ],
  },
  {
    id: "ecommerce",
    company: "E-Commerce & Operations",
    role: "Digital Operations Manager",
    period: "2023 – 2024",
    location: "Remote (US Client)",
    type: "Engagement",
    gradient: "from-violet-500/20 to-pink-500/20",
    accentColor: "violet",
    borderColor: "border-violet-500/30",
    dotColor: "bg-violet-500",
    outcomes: [
      {
        icon: "🛒",
        title: "Flawless Platform Management",
        detail:
          "Oversaw the operational backbone of a US-based e-commerce business — managing product listings, digital media assets, and platform credentials across multiple storefronts with zero critical incidents.",
      },
      {
        icon: "💳",
        title: "Streamlined Payment & Payout Workflows",
        detail:
          "Restructured the entire payment and payout pipeline, eliminating processing delays, resolving payout bottlenecks, and implementing reconciliation checks that saved the client significant revenue leakage.",
      },
      {
        icon: "📦",
        title: "Optimized Product Listing Operations",
        detail:
          "Engineered a systematic product management process — from catalog hygiene, SEO-optimized descriptions, to inventory synchronization — improving product discoverability and reducing fulfilment errors.",
      },
      {
        icon: "🎯",
        title: "Delivered Business Efficiency at Scale",
        detail:
          "Coordinated across digital media, logistics, and finance functions to ensure smooth daily operations, resulting in consistently high seller performance metrics and a frictionless customer experience.",
      },
    ],
  },
  {
    id: "caritas",
    company: "Caritas Rwanda",
    role: "Web Architect & Systems Implementer",
    period: "2023",
    location: "Rwanda",
    type: "Contract",
    gradient: "from-cyan-500/20 to-blue-500/20",
    accentColor: "cyan",
    borderColor: "border-cyan-500/30",
    dotColor: "bg-cyan-500",
    outcomes: [
      {
        icon: "🔧",
        title: "Revamped Web Architecture",
        detail:
          "Performed a full audit and rebuild of Caritas Rwanda's web infrastructure — modernizing the tech stack, improving page load performance, and aligning the digital presence with international NGO standards.",
      },
      {
        icon: "📈",
        title: "Built an Indicator Management System",
        detail:
          "Designed and deployed a custom indicator management system enabling Caritas to track project KPIs, program deliverables, and funding outcomes in real time — replacing error-prone spreadsheet workflows.",
      },
      {
        icon: "📋",
        title: "Streamlined Organizational Reporting",
        detail:
          "Implemented automated reporting pipelines that aggregated performance data across multiple programs, enabling leadership to generate donor and board reports in hours rather than weeks.",
      },
      {
        icon: "🤝",
        title: "Enabled Mission-Critical Impact Tracking",
        detail:
          "The systems built enabled Caritas Rwanda to accurately demonstrate impact to international donors and partners — directly supporting continued funding and operational credibility.",
      },
    ],
  },
];

function useInView(options = {}) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setInView(true);
    }, options);
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return { ref, inView };
}

function ExperienceCard({ exp, index }: { exp: (typeof experiences)[0]; index: number }) {
  const { ref, inView } = useInView({ threshold: 0.1 });

  return (
    <div
      ref={ref}
      className={`relative transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      {/* Connecting line */}
      {index < experiences.length - 1 && (
        <div className="absolute left-5 top-full w-0.5 h-12 bg-gradient-to-b from-white/10 to-transparent z-10" aria-hidden="true" />
      )}

      <article
        id={`experience-${exp.id}`}
        className={`glass-card rounded-2xl overflow-hidden border ${exp.borderColor}`}
        aria-label={`${exp.role} at ${exp.company}`}
      >
        {/* Card header */}
        <div className={`relative p-6 pb-4 bg-gradient-to-br ${exp.gradient}`}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-2.5 h-2.5 rounded-full ${exp.dotColor} ring-2 ring-white/20 mt-1`} />
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full bg-${exp.accentColor}-500/20 text-${exp.accentColor}-300 border border-${exp.accentColor}-500/30`}>
                    {exp.type}
                  </span>
                  <span className="text-xs text-slate-500">{exp.period}</span>
                  <span className="text-xs text-slate-600">· {exp.location}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-100">{exp.role}</h3>
                <p className="text-sm font-medium text-slate-400">{exp.company}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Outcomes grid */}
        <div className="p-6 pt-4">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">
            What I Helped Achieve
          </h4>
          <div className="grid sm:grid-cols-2 gap-3">
            {exp.outcomes.map((outcome, i) => (
              <div
                key={i}
                className="group p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/10 hover:bg-white/[0.05] transition-all duration-300"
              >
                <div className="flex items-start gap-3">
                  <span className="text-lg leading-none mt-0.5" aria-hidden="true">
                    {outcome.icon}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-200 mb-1">{outcome.title}</p>
                    <p className="text-xs text-slate-500 leading-relaxed">{outcome.detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </article>
    </div>
  );
}

export default function WorkHistory() {
  const { ref: headerRef, inView: headerInView } = useInView({ threshold: 0.2 });

  return (
    <section id="work" className="relative py-24 lg:py-32" aria-labelledby="work-heading">
      {/* Background accent */}
      <div className="absolute right-0 top-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
      <div className="absolute left-0 bottom-1/4 w-80 h-80 bg-violet-600/5 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />

      <div className="max-w-4xl mx-auto px-6">
        {/* Section header */}
        <div
          ref={headerRef}
          className={`mb-16 transition-all duration-700 ${headerInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10" aria-hidden="true" />
            <span className="text-xs font-semibold tracking-widest text-slate-500 uppercase px-3">
              Experience
            </span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10" aria-hidden="true" />
          </div>
          <h2
            id="work-heading"
            className="text-3xl sm:text-4xl font-black text-center text-gradient mb-4"
          >
            Work History &amp; Impact
          </h2>
          <p className="text-slate-400 text-center max-w-xl mx-auto text-sm leading-relaxed">
            Not just what I built — but what changed because of it. Each engagement is measured by
            the business outcomes and lasting improvements delivered.
          </p>
        </div>

        {/* Experience cards */}
        <div className="flex flex-col gap-8">
          {experiences.map((exp, index) => (
            <ExperienceCard key={exp.id} exp={exp} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
