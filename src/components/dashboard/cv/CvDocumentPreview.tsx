"use client";

import { useMemo } from "react";
import { CvDocumentSheet } from "@/components/cv/CvDocumentSheet";
import { resolveLibraryDocument } from "@/lib/cv-document-resolve";
import type { CvDocument } from "@/lib/cv-library";

export type CvPreviewZoom = "fit" | 75 | 100 | 125;

/** Page geometry at 96dpi, used for the paper frame and page-break guides. */
const PAGE_SIZE = {
  a4: { width: 794, height: 1123 },
  letter: { width: 816, height: 1056 },
};

const FONT_STACK = {
  sans: "var(--font-sans, 'Inter', system-ui, sans-serif)",
  serif: "Georgia, 'Times New Roman', serif",
};

const HEADING_SCALE = { small: 0.92, standard: 1, strong: 1.12 };
const DENSITY_SCALE = { compact: 0.86, standard: 1, spacious: 1.18 };

export default function CvDocumentPreview({
  doc,
  zoom = "fit",
  showPageGuides = true,
}: {
  doc: CvDocument;
  zoom?: CvPreviewZoom;
  showPageGuides?: boolean;
}) {
  const resolved = useMemo(() => resolveLibraryDocument(doc), [doc]);
  const page = PAGE_SIZE[doc.pageSize] || PAGE_SIZE.a4;
  const scale = zoom === "fit" ? undefined : zoom / 100;

  return (
    <div
      className="cv-editor-stage"
      data-zoom={zoom === "fit" ? "fit" : "fixed"}
      style={
        {
          "--cv-page-w": `${page.width}px`,
          "--cv-page-h": `${page.height}px`,
          "--cv-zoom": scale ?? 1,
          "--cv-body-font": FONT_STACK[doc.fontFamily || "sans"],
          "--cv-body-size": `${doc.baseFontSize || 10}pt`,
          "--cv-heading-scale": HEADING_SCALE[doc.headingScale || "standard"],
          "--cv-density": DENSITY_SCALE[doc.density || "standard"],
        } as React.CSSProperties
      }
    >
      <div className="cv-editor-paper">
        {showPageGuides ? <div className="cv-editor-page-guides" aria-hidden="true" /> : null}
        <CvDocumentSheet resolved={resolved} className="is-public cv-editor-sheet" />
      </div>
    </div>
  );
}
