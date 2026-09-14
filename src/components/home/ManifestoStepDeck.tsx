"use client";

import { RiBarChartBoxLine, RiLightbulbFlashLine, RiSettings3Line } from "react-icons/ri";
import type { HomePoint } from "@/lib/homepage";

const ICONS = [RiLightbulbFlashLine, RiSettings3Line, RiBarChartBoxLine];

export default function ManifestoStepDeck({ points }: { points: HomePoint[] }) {
  return (
    <div className="manifesto-deck" role="region" aria-label="How the work moves">
      {points.map((point, index) => {
        const Icon = ICONS[index % ICONS.length];
        return (
          <article className="manifesto-card" key={`${point.title}-${index}`}>
            <div>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <span><Icon size={18} /></span>
            </div>
            <strong>{point.title}</strong>
            <p>{point.body}</p>
            {point.tag ? <small>{point.tag}</small> : null}
          </article>
        );
      })}
    </div>
  );
}
