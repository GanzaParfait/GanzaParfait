"use client";

import { useState } from "react";
import {
  RiAddLine,
  RiArrowDownSLine,
  RiArrowUpSLine,
  RiDeleteBinLine,
  RiEyeLine,
  RiEyeOffLine,
  RiSettings3Line,
  RiUserLine,
} from "react-icons/ri";
import {
  CV_SECTION_KIND_OPTIONS,
  sectionKindLabel,
  type CvDocument,
  type CvSectionKind,
} from "@/lib/cv-library";
import { isSectionSelected, type CvEditorSelection } from "@/components/dashboard/cv/selection";

export default function CvSectionList({
  doc,
  selection,
  onSelect,
  onAddSection,
  onMoveSection,
  onToggleSectionHidden,
  onDeleteSection,
}: {
  doc: CvDocument;
  selection: CvEditorSelection;
  onSelect: (next: CvEditorSelection) => void;
  onAddSection: (kind: CvSectionKind) => void;
  onMoveSection: (sectionId: string, direction: -1 | 1) => void;
  onToggleSectionHidden: (sectionId: string) => void;
  onDeleteSection: (sectionId: string) => void;
}) {
  const [adding, setAdding] = useState(false);

  return (
    <div className="cv-editor-structure">
      <button
        type="button"
        className={selection.kind === "document" ? "cv-editor-nav is-active" : "cv-editor-nav"}
        onClick={() => onSelect({ kind: "document" })}
      >
        <RiSettings3Line size={14} />
        <span>Document setup</span>
      </button>
      <button
        type="button"
        className={selection.kind === "header" ? "cv-editor-nav is-active" : "cv-editor-nav"}
        onClick={() => onSelect({ kind: "header" })}
      >
        <RiUserLine size={14} />
        <span>Identity &amp; contact</span>
      </button>

      <p className="cv-editor-structure-label">Sections</p>
      <ul className="cv-editor-section-list">
        {doc.sections.map((section, index) => {
          const active = isSectionSelected(selection, section.id);
          const visibleItems = section.items.filter((item) => !item.hidden).length;
          return (
            <li
              key={section.id}
              className={
                active
                  ? "cv-editor-section-row is-active"
                  : section.hidden
                    ? "cv-editor-section-row is-hidden"
                    : "cv-editor-section-row"
              }
            >
              <button
                type="button"
                className="cv-editor-section-main"
                onClick={() => onSelect({ kind: "section", sectionId: section.id })}
              >
                <span className="cv-editor-section-title">{section.title || sectionKindLabel(section.kind)}</span>
                <span className="cv-editor-section-meta">
                  {sectionKindLabel(section.kind)}
                  {section.items.length ? ` · ${visibleItems}/${section.items.length}` : ""}
                </span>
              </button>
              <div className="cv-editor-section-tools">
                <button
                  type="button"
                  aria-label="Move section up"
                  disabled={index === 0}
                  onClick={() => onMoveSection(section.id, -1)}
                >
                  <RiArrowUpSLine size={14} />
                </button>
                <button
                  type="button"
                  aria-label="Move section down"
                  disabled={index === doc.sections.length - 1}
                  onClick={() => onMoveSection(section.id, 1)}
                >
                  <RiArrowDownSLine size={14} />
                </button>
                <button
                  type="button"
                  aria-label={section.hidden ? "Show section" : "Hide section"}
                  onClick={() => onToggleSectionHidden(section.id)}
                >
                  {section.hidden ? <RiEyeOffLine size={14} /> : <RiEyeLine size={14} />}
                </button>
                <button
                  type="button"
                  aria-label="Delete section"
                  onClick={() => {
                    if (window.confirm(`Delete “${section.title}” from this CV?`)) {
                      onDeleteSection(section.id);
                    }
                  }}
                >
                  <RiDeleteBinLine size={14} />
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {adding ? (
        <div className="cv-editor-add-menu" role="menu">
          {CV_SECTION_KIND_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              role="menuitem"
              onClick={() => {
                onAddSection(opt.id);
                setAdding(false);
              }}
            >
              {opt.label}
            </button>
          ))}
          <button type="button" className="cv-editor-add-cancel" onClick={() => setAdding(false)}>
            Cancel
          </button>
        </div>
      ) : (
        <button type="button" className="cv-editor-add-btn" onClick={() => setAdding(true)}>
          <RiAddLine size={14} /> Add section
        </button>
      )}
    </div>
  );
}
