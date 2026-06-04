"use client";

import Image from "next/image";
import { useRef, useEffect, useState } from "react";

const certificates = [
  {
    id: "data-analytics",
    title: "Data Analytics",
    issuer: "ALX Africa",
    year: "2024",
    category: "Analytics",
    description:
      "Comprehensive training in data collection, cleaning, visualization, and storytelling. Equipped to extract business insights from complex datasets.",
    skills: ["Python", "SQL", "Tableau", "Excel", "Statistical Analysis"],
    gradient: "from-blue-600/30 to-cyan-600/30",
    borderColor: "border-blue-500/30",
    accentClass: "text-blue-400",
    bgAccent: "bg-blue-500/10",
    icon: "📊",
  },
  {
    id: "professional-foundations",
    title: "Professional Foundations",
    issuer: "ALX Africa",
    year: "2024",
    category: "Leadership",
    description:
      "Intensive program developing executive soft skills, professional communication, critical thinking, and workplace leadership competencies.",
    skills: ["Leadership", "Communication", "Problem Solving", "Project Management", "Ethics"],
    gradient: "from-violet-600/30 to-purple-600/30",
    borderColor: "border-violet-500/30",
    accentClass: "text-violet-400",
    bgAccent: "bg-violet-500/10",
    icon: "🏛️",
  },
  {
    id: "founders-academy",
    title: "Founder's Academy",
    issuer: "ALX Africa",
    year: "2024",
    category: "Entrepreneurship",
    description:
      "Elite entrepreneurship accelerator covering startup mechanics, fundraising strategy, product-market fit, and scaling a technology business.",
    skills: ["Startup Strategy", "Fundraising", "Product Vision", "GTM Strategy", "Team Building"],
    gradient: "from-amber-600/30 to-orange-600/30",
    borderColor: "border-amber-500/30",
    accentClass: "text-amber-400",
    bgAccent: "bg-amber-500/10",
    icon: "🚀",
  },
  {
    id: "academic-distinction",
    title: "Academic Excellence Award",
    issuer: "High School — National Distinction",
    year: "2022",
    category: "Academic",
    description:
      "Graduated 2nd overall in the nation with a distinction mark of 86% — a testament to exceptional dedication, intellectual rigor, and consistent performance.",
    skills: ["Mathematics", "Sciences", "Research", "Critical Analysis", "Discipline"],
    gradient: "from-emerald-600/30 to-teal-600/30",
    borderColor: "border-emerald-500/30",
    accentClass: "text-emerald-400",
    bgAccent: "bg-emerald-500/10",
    icon: "🎓",
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

function CertificateCard({
  cert,
  index,
}: {
  cert: (typeof certificates)[0];
  index: number;
}) {
  const { ref, inView } = useInView({ threshold: 0.1 });

  return (
    <article
      ref={ref}
      id={`credential-${cert.id}`}
      className={`group glass-card rounded-2xl overflow-hidden border ${cert.borderColor} flex flex-col transition-all duration-700 ${
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
      aria-label={`${cert.title} certificate from ${cert.issuer}`}
    >
      {/* Thumbnail area */}
      <div
        className={`relative h-40 bg-gradient-to-br ${cert.gradient} flex items-center justify-center overflow-hidden`}
      >
        {/* Decorative grid */}
        <div className="absolute inset-0 grid-dots opacity-30" aria-hidden="true" />

        {/* Certificate mock visual */}
        <div className="relative z-10 text-center">
          <div className="text-5xl mb-2" aria-hidden="true">
            {cert.icon}
          </div>
          <div className="glass rounded-lg px-4 py-2 border border-white/10 inline-block">
            <p className="text-xs font-bold text-slate-100">{cert.issuer}</p>
          </div>
        </div>

        {/* Category badge */}
        <div
          className={`absolute top-3 right-3 px-2 py-1 rounded-md text-xs font-semibold ${cert.bgAccent} ${cert.accentClass} border ${cert.borderColor}`}
        >
          {cert.category}
        </div>

        {/* Year badge */}
        <div className="absolute bottom-3 left-3 px-2 py-1 rounded-md text-xs font-medium glass border border-white/10 text-slate-300">
          {cert.year}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5">
        <h3 className={`text-base font-bold ${cert.accentClass} mb-1`}>{cert.title}</h3>
        <p className="text-xs text-slate-500 font-medium mb-3">{cert.issuer}</p>
        <p className="text-sm text-slate-400 leading-relaxed mb-4 flex-1">{cert.description}</p>

        {/* Skills */}
        <div className="flex flex-wrap gap-1.5">
          {cert.skills.map((skill) => (
            <span
              key={skill}
              className="px-2 py-1 rounded-md text-xs font-medium bg-white/[0.04] border border-white/[0.08] text-slate-400 group-hover:border-white/15 transition-colors"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Hover shimmer effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-500 animate-shimmer" aria-hidden="true" />
    </article>
  );
}

export default function Credentials() {
  const { ref: headerRef, inView: headerInView } = useInView({ threshold: 0.2 });

  return (
    <section
      id="credentials"
      className="relative py-24 lg:py-32"
      aria-labelledby="credentials-heading"
    >
      {/* Background accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-950/10 to-transparent pointer-events-none" aria-hidden="true" />
      <div className="absolute left-1/4 top-1/3 w-80 h-80 bg-violet-600/5 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />

      <div className="max-w-6xl mx-auto px-6">
        {/* Section header */}
        <div
          ref={headerRef}
          className={`mb-16 transition-all duration-700 ${headerInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10" aria-hidden="true" />
            <span className="text-xs font-semibold tracking-widest text-slate-500 uppercase px-3">
              Accreditations
            </span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10" aria-hidden="true" />
          </div>
          <h2
            id="credentials-heading"
            className="text-3xl sm:text-4xl font-black text-center text-gradient mb-4"
          >
            Credentials &amp; Certificates
          </h2>
          <p className="text-slate-400 text-center max-w-xl mx-auto text-sm leading-relaxed">
            Formally recognized expertise spanning data intelligence, entrepreneurship, and
            professional leadership — each credential backed by rigorous, world-class programs.
          </p>
        </div>

        {/* Certificate Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {certificates.map((cert, index) => (
            <CertificateCard key={cert.id} cert={cert} index={index} />
          ))}
        </div>

        {/* Bottom note */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-3 glass rounded-xl px-6 py-3 border border-white/[0.06]">
            <span className="text-lg" aria-hidden="true">✨</span>
            <p className="text-sm text-slate-400">
              Continuously expanding expertise across engineering, strategy & leadership
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
