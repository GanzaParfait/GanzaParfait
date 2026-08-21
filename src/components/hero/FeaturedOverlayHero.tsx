"use client";

import Link from "next/link";
import { RiPlayFill, RiArrowRightSLine } from "react-icons/ri";
import { SiteSettings } from "@/lib/supabase";
import { siteConfig } from "@/data/site-data";

export default function FeaturedOverlayHero({ settings }: { settings: SiteSettings }) {
  return (
    <section 
      className="relative w-full h-[100dvh] min-h-[600px] flex items-end pb-12 md:pb-24 pt-24 overflow-hidden"
    >
      {/* Background Image full bleed */}
      <div className="absolute inset-0 z-0">
        <img
          src={settings?.heroImageUrl || "/images/profile/hero-photo.png"}
          alt={settings.siteTitle}
          className="w-full h-full object-cover object-top"
        />
        {/* Gradient Overlay for Text Readability - matching the intense colors */}
        <div 
          className="absolute inset-0 mix-blend-multiply opacity-50"
          style={{ background: "linear-gradient(to right, #000046, #1CB5E0)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#020617]/90 via-[#020617]/40 to-transparent" />
      </div>

      <div className="container relative z-10 mx-auto px-6 max-w-7xl w-full flex flex-col md:flex-row items-end justify-between gap-10">
        
        {/* Main Content - Left Side */}
        <div className="max-w-3xl flex-1">
          <h1 
            className="text-[2.5rem] md:text-[4rem] lg:text-[5rem] font-black text-white leading-[1.05] tracking-tight mb-8"
            style={{ textShadow: "0 4px 20px rgba(0,0,0,0.5)" }}
          >
            {settings.siteTitle}
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 font-light" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>
            {settings.siteSubtitle}
          </p>
          <Link 
            href="/projects" 
            className="inline-flex items-center justify-center bg-white text-slate-900 font-bold px-8 py-4 rounded-full text-sm uppercase tracking-wide hover:bg-slate-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)]"
          >
            Explore Portfolio
          </Link>
        </div>

        {/* Featured Card - Right Side (Now Dynamic About Box) */}
        <div className="w-full md:w-[400px] bg-[#09090b]/80 backdrop-blur-md rounded-2xl p-8 border border-white/10 shadow-2xl shrink-0">
          <div className="flex items-center gap-2 mb-6">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            <span className="text-white text-xs font-bold tracking-widest uppercase opacity-70">
              Welcome
            </span>
          </div>
          
          <p className="text-white/90 text-sm md:text-base leading-relaxed mb-8">
            {settings.bio}
          </p>

          <Link 
            href="/about" 
            className="flex items-center gap-3 bg-white/10 hover:bg-white/20 transition-colors text-white rounded-full px-6 py-3 w-fit"
          >
            <div className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center">
              <RiArrowRightSLine size={18} />
            </div>
            <span className="text-sm font-bold">Discover More</span>
          </Link>
        </div>

      </div>
    </section>
  );
}
