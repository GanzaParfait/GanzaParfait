"use client";

import { RiMagicLine, RiRefreshLine } from "react-icons/ri";
import {
  canResetField,
  resetFieldToSource,
  setFieldValue,
  type CvField,
} from "@/lib/cv-library";

/**
 * A single CV field. Editing marks the field customized so portfolio refreshes
 * never overwrite authored copy; Reset restores the stored suggestion.
 */
export default function CvFieldEditor({
  label,
  field,
  onChange,
  multiline = false,
  rows = 3,
  placeholder,
  hint,
  /** Live portfolio value offered as a suggestion, when available. */
  suggestion,
  onSuggest,
}: {
  label: string;
  field?: CvField;
  onChange: (next: CvField) => void;
  multiline?: boolean;
  rows?: number;
  placeholder?: string;
  hint?: string;
  suggestion?: string;
  onSuggest?: () => void;
}) {
  const current = field || { value: "" };
  const customized = Boolean(current.isCustomized);
  const resettable = canResetField(current);
  const suggestable = Boolean(
    onSuggest && suggestion?.trim() && suggestion.trim() !== current.value.trim()
  );

  return (
    <div className="cv-editor-field">
      <div className="cv-editor-field-head">
        <span className="cv-editor-field-label">{label}</span>
        <span className="cv-editor-field-tools">
          {customized ? <span className="cv-editor-badge">Edited</span> : null}
          {suggestable ? (
            <button
              type="button"
              className="cv-editor-mini-btn"
              title={`Suggestion: ${suggestion}`}
              onClick={onSuggest}
            >
              <RiMagicLine size={13} /> Suggest
            </button>
          ) : null}
          {resettable ? (
            <button
              type="button"
              className="cv-editor-mini-btn"
              title={`Reset to: ${current.sourceValue}`}
              onClick={() => onChange(resetFieldToSource(current))}
            >
              <RiRefreshLine size={13} /> Reset
            </button>
          ) : null}
        </span>
      </div>
      {multiline ? (
        <textarea
          className="cv-editor-input"
          rows={rows}
          value={current.value}
          placeholder={placeholder}
          onChange={(event) => onChange(setFieldValue(current, event.target.value))}
        />
      ) : (
        <input
          className="cv-editor-input"
          value={current.value}
          placeholder={placeholder}
          onChange={(event) => onChange(setFieldValue(current, event.target.value))}
        />
      )}
      {hint ? <p className="cv-editor-hint">{hint}</p> : null}
    </div>
  );
}
