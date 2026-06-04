"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

const stats = [
  { value: "3+", label: "Years Building" },
  { value: "86%", label: "Academic Score" },
  { value: "10+", label: "Clients Served" },
  { value: "∞", label: "Impact Focus" },
];

const badges = ["CEO & Founder", "ALX Graduate", "Data Analyst", "Tech Architect"];

export default function Hero() {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const el = headingRef.current;
    if (!el) return;
    el.style.opacity = "0";
    el.style.transform = "translateY(30px)";
    const timer = setTimeout(() => {
      el.style.transition = "opacity 1s ease, transform 1s ease";
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      aria-label="Hero section"
    >
      {/* Background Grid */}
      <div className="absolute inset-0 grid-dots opacity-40" aria-hidden="true" />

      {/* Ambient Glows */}
      <div
        className="hero-glow w-96 h-96 bg-blue-600/20 top-20 left-1/4"
        style={{ transform: "translateX(-50%)" }}
        aria-hidden="true"
      />
      <div
        className="hero-glow w-80 h-80 bg-violet-600/15 bottom-1/3 right-1/4"
        aria-hidden="true"
      />
      <div
        className="hero-glow w-64 h-64 bg-cyan-500/10 top-1/2 right-1/3"
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-24 pb-16">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          {/* Left – Text content */}
          <div className="flex-1 text-center lg:text-left">
            {/* Pre-headline badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-blue-500/20 text-sm text-blue-400 font-medium mb-8 animate-fade-up">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Available for Strategic Collaborations
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 justify-center lg:justify-start mb-6 animate-fade-up delay-100">
              {badges.map((badge) => (
                <span
                  key={badge}
                  className="px-3 py-1 rounded-md text-xs font-medium bg-white/5 border border-white/10 text-slate-400"
                >
                  {badge}
                </span>
              ))}
            </div>

            {/* Main Headline */}
            <h1
              ref={headingRef}
              className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.08] tracking-tight mb-6"
            >
              <span className="text-gradient block">Engineering</span>
              <span className="text-gradient block">the Future,</span>
              <span className="text-gradient-accent block">Leading</span>
              <span className="text-gradient block">with Vision.</span>
            </h1>

            {/* Sub-headline */}
            <p className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-xl mx-auto lg:mx-0 mb-10 animate-fade-up delay-200">
              I&apos;m <strong className="text-slate-200">Prince Parfait GANZA</strong> — CEO & Founder
              of <strong className="text-blue-400">Lerony Co. Ltd</strong>. I bridge the gap between
              deep technical engineering and executive business leadership to build solutions that
              drive measurable impact.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-14 animate-fade-up delay-300">
              <a
                href="#work"
                id="hero-cta-work"
                className="group px-8 py-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-blue-600 to-violet-600 text-white hover:from-blue-500 hover:to-violet-500 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/30 hover:scale-105 flex items-center justify-center gap-2"
              >
                View Case Studies
                <svg
                  className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
              <a
                href="#contact"
                id="hero-cta-contact"
                className="px-8 py-4 rounded-xl font-semibold text-sm glass border border-white/10 text-slate-200 hover:border-blue-500/40 hover:text-white transition-all duration-300 flex items-center justify-center gap-2"
              >
                Get in Touch
              </a>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-4 gap-4 max-w-sm mx-auto lg:mx-0 animate-fade-up delay-400">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center lg:text-left">
                  <div className="text-xl font-black text-gradient-accent">{stat.value}</div>
                  <div className="text-xs text-slate-500 leading-tight mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right – Profile Image */}
          <div className="relative flex-shrink-0 animate-fade-up delay-300">
            {/* Outer ring glow */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500/20 via-violet-500/20 to-cyan-500/20 blur-xl scale-110" aria-hidden="true" />

            {/* Image container */}
            <div className="relative w-72 h-72 sm:w-80 sm:h-80 lg:w-96 lg:h-96 rounded-3xl overflow-hidden glass-card border-2 border-white/10 animate-float">
              <Image
                src="/profile.png"
                alt="Prince Parfait GANZA – CEO & Technical Founder of Lerony Co. Ltd"
                fill
                priority
                sizes="(max-width: 640px) 288px, (max-width: 1024px) 320px, 384px"
                className="object-cover object-top"
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#080b12]/60 via-transparent to-transparent" aria-hidden="true" />
              {/* Name tag overlay */}
              <div className="absolute bottom-4 left-4 right-4">
                <div className="glass rounded-xl px-4 py-3 border border-white/10">
                  <p className="text-sm font-bold text-slate-100">Prince Parfait GANZA</p>
                  <p className="text-xs text-blue-400 font-medium">CEO & Founder · Lerony Co. Ltd</p>
                </div>
              </div>
            </div>

            {/* Floating accent card */}
            <div className="absolute -top-4 -right-4 glass rounded-xl px-3 py-2 border border-blue-500/20 flex items-center gap-2 animate-float" style={{ animationDelay: "2s" }}>
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold">
                A
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-100">ALX Certified</p>
                <p className="text-[10px] text-slate-400">3× Programs</p>
              </div>
            </div>

            {/* Floating stat card */}
            <div className="absolute -bottom-4 -left-4 glass rounded-xl px-3 py-2 border border-violet-500/20 flex items-center gap-2 animate-float" style={{ animationDelay: "3s" }}>
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-pink-600 flex items-center justify-center text-white text-xs font-bold">
                #
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-100">Top 2 Graduate</p>
                <p className="text-[10px] text-slate-400">86% Distinction</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce" aria-hidden="true">
        <p className="text-xs text-slate-600 font-medium tracking-widest uppercase">Scroll</p>
        <div className="w-0.5 h-8 bg-gradient-to-b from-blue-500/50 to-transparent" />
      </div>
    </section>
  );
}
