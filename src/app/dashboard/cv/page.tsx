"use client";

import { useEffect, useState } from "react";
import CvLibraryManager from "@/components/dashboard/cv/CvLibraryManager";
import { DEFAULT_SETTINGS, fetchRemoteSettings, getLocalSettings, type SiteSettings } from "@/lib/supabase";

export default function CvLibraryPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    setSettings(getLocalSettings());
    void fetchRemoteSettings().then((remote) => {
      if (remote) setSettings(remote);
    });
  }, []);

  if (!settings) {
    return (
      <div className="cv-lib" style={{ padding: "1.5rem" }}>
        <p className="cv-lib-lead">Loading CV library…</p>
      </div>
    );
  }

  return <CvLibraryManager initialSettings={{ ...DEFAULT_SETTINGS, ...settings }} />;
}
