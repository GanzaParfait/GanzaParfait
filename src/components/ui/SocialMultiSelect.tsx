"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { RiArrowDownSLine, RiCheckLine, RiCloseLine } from "react-icons/ri";

export type SocialMultiSelectOption = {
  value: string;
  label: string;
};

type SocialMultiSelectProps = {
  values: string[];
  onChange: (values: string[]) => void;
  options: SocialMultiSelectOption[];
  max?: number;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
};

export default function SocialMultiSelect({
  values,
  onChange,
  options,
  max = 6,
  placeholder = "Select socials…",
  disabled = false,
  className = "",
  "aria-label": ariaLabel,
}: SocialMultiSelectProps) {
  const reactId = useId();
  const listId = `${reactId}-list`;
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const selected = useMemo(
    () => options.filter((option) => values.includes(option.value)),
    [options, values],
  );

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const toggle = (value: string) => {
    if (values.includes(value)) {
      onChange(values.filter((item) => item !== value));
      return;
    }
    if (values.length >= max) return;
    onChange([...values, value]);
  };

  const remove = (value: string) => {
    onChange(values.filter((item) => item !== value));
  };

  return (
    <div ref={rootRef} className={`social-multi ${className}`.trim()} data-open={open ? "true" : "false"}>
      <button
        type="button"
        className="social-multi-trigger"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={ariaLabel || placeholder}
        disabled={disabled}
        onClick={() => !disabled && setOpen((current) => !current)}
      >
        <span className="social-multi-value">
          {selected.length ? (
            selected.map((option) => (
              <span key={option.value} className="social-multi-chip">
                {option.label}
                <span
                  role="button"
                  tabIndex={0}
                  aria-label={`Remove ${option.label}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    remove(option.value);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      event.stopPropagation();
                      remove(option.value);
                    }
                  }}
                >
                  <RiCloseLine size={12} />
                </span>
              </span>
            ))
          ) : (
            <em>{placeholder}</em>
          )}
        </span>
        <RiArrowDownSLine size={16} />
      </button>
      {open ? (
        <div className="social-multi-menu" id={listId} role="listbox" aria-multiselectable="true">
          <p className="social-multi-hint">
            {values.length}/{max} selected
            {options.length === 0 ? " · Add links in Site Settings → Socials" : ""}
          </p>
          {options.map((option) => {
            const on = values.includes(option.value);
            const blocked = !on && values.length >= max;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={on}
                disabled={blocked}
                className={on ? "is-on" : undefined}
                onClick={() => toggle(option.value)}
              >
                <span>{option.label}</span>
                {on ? <RiCheckLine size={15} /> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
