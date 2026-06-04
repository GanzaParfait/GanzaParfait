"use client";

import { useRef, useEffect, useState } from "react";

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

const strengths = [
  {
    icon: "🧠",
    title: "Systems Thinker",
    desc: "I don't just write code — I architect solutions. Every technical decision is rooted in business logic and long-term maintainability.",
  },
  {
    icon: "📡",
    title: "Data-Driven",
    desc: "ALX-certified in Data Analytics. I translate raw data into actionable intelligence that informs strategic business decisions.",
  },
  {
    icon: "🌍",
    title: "Impact at Scale",
    desc: "From local NGOs to international e-commerce, I've built systems that create measurable impact across sectors and geographies.",
  },
  {
    icon: "⚡",
    title: "Speed & Execution",
    desc: "Bias toward action. I iterate fast, ship value early, and continuously improve — startup velocity with enterprise quality.",
  },
];

export default function About() {
  const { ref, inView } = useInView({ threshold: 0.1 });

  return (
    <section id="about" className="relative py-24 lg:py-32" aria-labelledby="about-heading">
      <div className="absolute right-0 top-0 w-72 h-72 bg-cyan-600/5 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />

      <div className="max-w-5xl mx-auto px-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10" aria-hidden="true" />
          <span className="text-xs font-semibold tracking-widest text-slate-500 uppercase px-3">
            About
          </span>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10" aria-hidden="true" />
        </div>

        <div ref={ref} className={`transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left – Text */}
            <div>
              <h2 id="about-heading" className="text-3xl sm:text-4xl font-black text-gradient mb-6">
                The Person Behind the Work
              </h2>
              <div className="space-y-4 text-sm text-slate-400 leading-relaxed">
                <p>
                  I&apos;m <strong className="text-slate-200">Prince Parfait GANZA</strong>, a
                  technical founder who believes that the most powerful thing a builder can do is
                  make complex systems feel simple — and then make those simple systems change lives.
                </p>
                <p>
                  As the CEO & Founder of{" "}
                  <strong className="text-blue-400">Lerony Co. Ltd</strong>, I lead a company
                  focused on delivering real-world technology outcomes: digital transformation,
                  process automation, and engineering solutions that help organizations operate at
                  their highest potential.
                </p>
                <p>
                  My journey started with academic distinction — graduating{" "}
                  <strong className="text-slate-200">2nd overall in high school</strong> with an 86%
                  distinction. That same drive for excellence has carried into every professional
                  engagement since.
                </p>
                <p>
                  Through <strong className="text-slate-200">ALX Africa</strong>, I've been
                  rigorously trained in Data Analytics, Professional Foundations, and the Founder's
                  Academy — building the rare combination of technical depth and leadership breadth
                  needed to operate at the intersection of engineering and business.
                </p>
              </div>
            </div>

            {/* Right – Strengths */}
            <div>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-5">
                Core Strengths
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {strengths.map((s, i) => (
                  <div
                    key={s.title}
                    className={`group glass-card rounded-xl p-4 border border-white/[0.06] transition-all duration-500 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
                    style={{ transitionDelay: `${200 + i * 100}ms` }}
                  >
                    <span className="text-2xl mb-2 block" aria-hidden="true">{s.icon}</span>
                    <h4 className="text-sm font-bold text-slate-200 mb-1">{s.title}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
                  </div>
                ))}
              </div>

              {/* Tech Stack Callout */}
              <div className="mt-6 glass rounded-xl p-4 border border-white/[0.06]">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Primary Stack</p>
                <div className="flex flex-wrap gap-2">
                  {["Next.js", "TypeScript", "Supabase", "Python", "SQL", "Tailwind CSS", "Node.js", "REST APIs"].map((tech) => (
                    <span
                      key={tech}
                      className="px-2.5 py-1 rounded-md text-xs font-medium bg-gradient-to-r from-blue-600/10 to-violet-600/10 border border-blue-500/20 text-blue-300"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
