"use client";

import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { RiArrowDownSLine, RiCheckLine, RiSearchLine } from "react-icons/ri";

export type CustomSelectOption = {
  value: string;
  label: string;
};

type CustomSelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: CustomSelectOption[];
  placeholder?: string;
  id?: string;
  name?: string;
  disabled?: boolean;
  /** Force search on/off. Default: on when options.length > 5. */
  searchable?: boolean;
  className?: string;
  icon?: ReactNode;
  "aria-label"?: string;
};

export default function CustomSelect({
  value,
  onChange,
  options,
  placeholder = "Select…",
  id,
  name,
  disabled = false,
  searchable,
  className = "",
  icon,
  "aria-label": ariaLabel,
}: CustomSelectProps) {
  const reactId = useId();
  const listId = `${reactId}-list`;
  const searchId = `${reactId}-search`;
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const enableSearch = searchable ?? options.length > 5;

  const selected = options.find((option) => option.value === value);
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return options;
    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(needle) || option.value.toLowerCase().includes(needle),
    );
  }, [options, query]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopImmediatePropagation();
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      return;
    }
    const index = Math.max(
      0,
      filtered.findIndex((option) => option.value === value),
    );
    setActiveIndex(index === -1 ? 0 : index);
    if (enableSearch) {
      requestAnimationFrame(() => searchRef.current?.focus());
    }
  }, [open, enableSearch, filtered, value]);

  const pick = (next: string) => {
    onChange(next);
    setOpen(false);
  };

  const onTriggerKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setOpen(true);
    }
  };

  const onListKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => Math.min(filtered.length - 1, current + 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => Math.max(0, current - 1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const option = filtered[activeIndex];
      if (option) pick(option.value);
    } else if (event.key === "Home") {
      event.preventDefault();
      setActiveIndex(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setActiveIndex(Math.max(0, filtered.length - 1));
    }
  };

  return (
    <div
      ref={rootRef}
      className={`cselect${open ? " is-open" : ""}${disabled ? " is-disabled" : ""}${icon ? " has-icon" : ""}${className ? ` ${className}` : ""}`}
    >
      {name ? <input type="hidden" name={name} value={value} /> : null}
      <button
        type="button"
        id={id}
        className="cselect-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={onTriggerKeyDown}
      >
        {icon ? <span className="cselect-icon">{icon}</span> : null}
        <span className={selected ? "cselect-value" : "cselect-placeholder"}>
          {selected?.label || placeholder}
        </span>
        <RiArrowDownSLine className="cselect-caret" size={18} aria-hidden />
      </button>

      {open ? (
        <div className="cselect-panel" role="presentation" onKeyDown={onListKeyDown}>
          {enableSearch ? (
            <label className="cselect-search" htmlFor={searchId}>
              <RiSearchLine size={15} aria-hidden />
              <input
                ref={searchRef}
                id={searchId}
                type="search"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setActiveIndex(0);
                }}
                placeholder="Search options…"
                autoComplete="off"
              />
            </label>
          ) : null}
          <ul id={listId} className="cselect-list" role="listbox" aria-label={ariaLabel || placeholder}>
            {filtered.length === 0 ? (
              <li className="cselect-empty">No matches</li>
            ) : (
              filtered.map((option, index) => {
                const active = index === activeIndex;
                const selectedOption = option.value === value;
                return (
                  <li key={option.value} role="presentation">
                    <button
                      type="button"
                      role="option"
                      aria-selected={selectedOption}
                      className={`cselect-option${active ? " is-active" : ""}${selectedOption ? " is-selected" : ""}`}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => pick(option.value)}
                    >
                      <span>{option.label}</span>
                      {selectedOption ? <RiCheckLine size={15} aria-hidden /> : null}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
