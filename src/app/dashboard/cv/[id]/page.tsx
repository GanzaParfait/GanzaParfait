"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import CvDocumentEditor from "@/components/dashboard/cv/CvDocumentEditor";
import { DEFAULT_SETTINGS, fetchRemoteSettings, getLocalSettings, type SiteSettings } from "@/lib/supabase";

export default function CvDocumentEditorPage() {
  const params = useParams<{ id: string }>();
  const search = useSearchParams();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const id = params?.id || "";
  const tab = search.get("tab") === "preview" ? "preview" : undefined;

  useEffect(() => {
    setSettings(getLocalSettings());
    void fetchRemoteSettings().then((remote) => {
      if (remote) setSettings(remote);
    });
  }, []);

  if (!settings || !id) {
    return (
      <div className="cv-editor-missing">
        <p>Loading editor…</p>
      </div>
    );
  }

  return (
    <CvDocumentEditor
      documentId={id}
      initialSettings={{ ...DEFAULT_SETTINGS, ...settings }}
      initialTab={tab}
    />
  );
}
