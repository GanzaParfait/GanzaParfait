"use client";

import Link from "next/link";
import {
  RiFacebookFill,
  RiTwitterXFill,
  RiInstagramLine,
  RiGlobalLine,
  RiLinkedinFill,
  RiGithubFill
} from "react-icons/ri";
import { SiteSettings } from "@/lib/supabase";
import { siteConfig } from "@/data/site-data";
import { useEffect, useState } from "react";

export default function FullCenteredHero({ settings }: { settings: SiteSettings }) {
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    setVisible(true);
  }, []);

  const roles = settings.siteSubtitle ? settings.siteSubtitle.split(" • ") : ["Software Engineer"];
  const primaryRole = roles[0];

  const primarySocials = [
    { href: siteConfig.social.linkedin, icon: RiLinkedinFill, label: "LinkedIn" },
    { href: siteConfig.social.twitter, icon: RiTwitterXFill, label: "Twitter" },
    { href: siteConfig.social.github, icon: RiGithubFill, label: "GitHub" },
    { href: siteConfig.url, icon: RiGlobalLine, label: "Website" },
  ];

  return (
    <section 
      className="relative w-full overflow-hidden flex flex-col items-center justify-end"
      style={{
        minHeight: "100dvh",
        background: "radial-gradient(circle at 50% 50%, #2e266f 0%, #050816 80%)",
        paddingTop: "6rem"
      }}
    >
      {/* Container for the absolute positioning of the elements */}
      <div className="container relative z-10 w-full h-full flex-1 flex flex-col items-center justify-end max-w-7xl mx-auto px-6">
        
        {/* The Person Image - absolute centered */}
        <div 
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[85%] md:w-[60%] max-w-[600px] h-[70vh] md:h-[80vh] z-0"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translate(-50%, 0)" : "translate(-50%, 40px)",
            transition: "opacity 1s ease 0.3s, transform 1s ease 0.3s"
          }}
        >
          <img
            src={settings?.heroImageUrl || "/images/profile/hero-photo.png"}
            alt={settings.siteTitle}
            className="w-full h-full object-cover object-bottom"
            style={{ 
              maskImage: "linear-gradient(to top, black 80%, transparent 100%)",
              WebkitMaskImage: "linear-gradient(to top, black 80%, transparent 100%)" 
            }}
          />
        </div>

        {/* LEFT FLOATING CONTENT */}
        <div 
          className="absolute left-6 md:left-12 lg:left-24 top-[30%] flex flex-col gap-12 z-10 hidden md:flex"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateX(0)" : "translateX(-40px)",
            transition: "all 1s ease 0.5s"
          }}
        >
          {/* Role & Location */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              <h3 className="text-xl md:text-2xl font-bold text-white tracking-wide">{primaryRole}</h3>
            </div>
            <p className="text-slate-400 text-sm ml-5">Based in {settings.location.split(",")[0]}</p>
          </div>
          
          {/* Email */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="w-2 h-2 rounded-full bg-slate-400"></span>
              <p className="text-slate-300">Say hello to</p>
            </div>
            <a href={`mailto:${settings.contactEmail}`} className="text-white font-bold text-lg md:text-xl ml-5 hover:text-red-400 transition-colors">
              {settings.contactEmail}
            </a>
          </div>

          {/* Socials */}
          <div className="flex gap-4 ml-5 mt-4">
            {primarySocials.slice(0, 4).map((social, i) => (
              <a 
                key={i} 
                href={social.href}
                target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 rounded-full flex items-center justify-center text-blue-500 hover:bg-blue-500 hover:text-white transition-all bg-transparent border border-blue-900/30"
              >
                <social.icon size={18} />
              </a>
            ))}
          </div>
        </div>

        {/* RIGHT FLOATING CONTENT */}
        <div 
          className="absolute right-6 md:right-12 lg:right-24 top-[30%] flex flex-col gap-10 text-right z-10 hidden md:flex"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateX(0)" : "translateX(40px)",
            transition: "all 1s ease 0.7s"
          }}
        >
          <div>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-white mb-1">100%</h2>
            <p className="text-slate-400 text-sm uppercase tracking-wider">Client Satisfaction</p>
          </div>
          <div className="w-full h-px bg-white/10"></div>
          <div>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-white mb-1">15+</h2>
            <p className="text-slate-400 text-sm uppercase tracking-wider">Projects Done</p>
          </div>
          <div className="w-full h-px bg-white/10"></div>
          <div>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-white mb-1">3+</h2>
            <p className="text-slate-400 text-sm uppercase tracking-wider">Years Experience</p>
          </div>
        </div>

        {/* BOTTOM CENTER CONTENT */}
        <div 
          className="w-full text-center relative z-20 pb-16 md:pb-24 pt-60 md:pt-0"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(30px)",
            transition: "all 1s ease 0.9s"
          }}
        >
          {/* Text shadow to ensure readability over image */}
          <h1 
            className="text-[3rem] sm:text-[4rem] md:text-[5rem] lg:text-[7rem] font-black tracking-tight leading-none mb-6"
            style={{ 
              fontFamily: "var(--font-heading)",
              background: "linear-gradient(to right, #ffffff, #c7d2fe)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textShadow: "0 10px 40px rgba(0,0,0,0.5)"
            }}
          >
            {settings.siteTitle}
          </h1>
          <p className="text-lg md:text-xl text-slate-300 font-medium">
            Do you have a project?{" "}
            <Link 
              href="/contact" 
              className="text-red-400 font-bold border-b-2 border-red-400 pb-1 hover:text-red-300 hover:border-red-300 transition-colors"
            >
              Let's Talk
            </Link>
          </p>
        </div>
        
        {/* Mobile-only stats & info (since side panels are hidden on mobile) */}
        <div className="md:hidden flex flex-col gap-6 items-center text-center w-full relative z-20 pb-12 opacity-90">
          <div className="flex items-center justify-center gap-6 w-full">
            <div>
              <h2 className="text-xl font-bold text-white">15+</h2>
              <p className="text-xs text-slate-400">Projects</p>
            </div>
            <div className="w-px h-8 bg-white/20"></div>
            <div>
              <h2 className="text-xl font-bold text-white">3+</h2>
              <p className="text-xs text-slate-400">Years Exp.</p>
            </div>
            <div className="w-px h-8 bg-white/20"></div>
            <div>
              <h2 className="text-xl font-bold text-white">100%</h2>
              <p className="text-xs text-slate-400">Satisfaction</p>
            </div>
          </div>
          <div className="flex gap-4 mt-2">
            {primarySocials.map((social, i) => (
              <a key={i} href={social.href} className="text-slate-400 hover:text-white">
                <social.icon size={20} />
              </a>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
