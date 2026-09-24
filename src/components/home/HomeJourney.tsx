"use client";

import { useEffect, useState } from "react";
import ManifestoSection from "@/components/home/ManifestoSection";
import SelectedWork from "@/components/home/SelectedWork";
import KnowledgeSection from "@/components/home/KnowledgeSection";
import JourneySection from "@/components/home/JourneySection";
import PrinciplesSection from "@/components/home/PrinciplesSection";
import SpeakingSection from "@/components/home/SpeakingSection";
import BookingSection from "@/components/home/BookingSection";
import TestimonialsSection from "@/components/testimonials/TestimonialsSection";
import { homepageFrom } from "@/lib/homepage";
import { useSiteSettings } from "@/hooks/useSiteSettings";

export default function HomeJourney() {
  const settings = useSiteSettings();
  const home = homepageFrom(settings);
  const [pageProgress, setPageProgress] = useState(0);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const update = () => {
      const height = document.documentElement.scrollHeight - window.innerHeight;
      setPageProgress(height <= 0 ? 0 : window.scrollY / height);
    };
    update();
    if (reduce) {
      setPageProgress(0);
      return;
    }
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <>
      <div className="scroll-progress" aria-hidden="true">
        <span style={{ transform: `scaleX(${pageProgress})` }} />
      </div>

      <ManifestoSection manifesto={{ ...home.manifesto, attribution: home.manifesto.attribution || settings.siteTitle }} />

      <SelectedWork work={home.work} records={settings.projectRecords} />

      <KnowledgeSection knowledge={home.knowledge} />

      <JourneySection journey={home.journey} />

      <PrinciplesSection
        principles={home.principles}
        attribution={settings.siteTitle || "Prince Parfait GANZA"}
      />

      <SpeakingSection
        speaking={home.speaking}
        attribution={settings.siteTitle || "Prince Parfait GANZA"}
      />

      <TestimonialsSection limit={8} />

      <BookingSection booking={home.booking} />
    </>
  );
}
