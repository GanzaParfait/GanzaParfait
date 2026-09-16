"use client";

import { useCallback, useEffect } from "react";

type SectionLike<T extends string> = T | { id: T };

function sectionIds<T extends string>(sections: readonly SectionLike<T>[]): T[] {
  return sections.map((item) => (typeof item === "string" ? item : item.id));
}

/**
 * Keeps a dashboard section/tab in sync with `location.hash` so refresh restores it.
 */
export function useSectionHash<T extends string>(
  sections: readonly SectionLike<T>[],
  setSection: (id: T) => void,
) {
  useEffect(() => {
    const ids = sectionIds(sections);
    const apply = () => {
      const hash = window.location.hash.replace(/^#/, "") as T;
      if (ids.includes(hash)) setSection(hash);
    };
    apply();
    window.addEventListener("hashchange", apply);
    return () => window.removeEventListener("hashchange", apply);
  }, [sections, setSection]);

  return useCallback(
    (id: T) => {
      setSection(id);
      if (typeof window === "undefined") return;
      const next = `#${id}`;
      if (window.location.hash !== next) {
        window.history.replaceState(null, "", next);
      }
    },
    [setSection],
  );
}
