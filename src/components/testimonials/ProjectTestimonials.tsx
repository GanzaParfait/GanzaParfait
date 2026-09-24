"use client";

import { useEffect, useState } from "react";
import type { PublicTestimonial } from "@/lib/testimonials";

/** Approved/published testimonials attached to a single project. Renders nothing when empty. */
export default function ProjectTestimonials({ projectId }: { projectId: string }) {
  const [items, setItems] = useState<PublicTestimonial[]>([]);

  useEffect(() => {
    if (!projectId) return;
    let active = true;
    fetch(`/api/testimonials?projectId=${encodeURIComponent(projectId)}&limit=3`)
      .then((res) => (res.ok ? res.json() : { items: [] }))
      .then((data) => {
        if (active) setItems((data.items || []) as PublicTestimonial[]);
      })
      .catch(() => {
        if (active) setItems([]);
      });
    return () => {
      active = false;
    };
  }, [projectId]);

  if (!items.length) return null;

  return (
    <section className="case-testimonials" data-page-section aria-labelledby="case-testimonials-title">
      <h2 id="case-testimonials-title">From collaborators</h2>
      <ul>
        {items.map((item) => {
          const meta = [item.personTitle, item.organization].filter(Boolean).join(", ");
          return (
            <li key={item.id}>
              <figure>
                <blockquote>
                  <p>{item.body}</p>
                </blockquote>
                <figcaption>
                  <strong>{item.personName}</strong>
                  {meta ? <span>{meta}</span> : null}
                </figcaption>
              </figure>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
