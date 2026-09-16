"use client";

import {
  RiBarChart2Line,
  RiBookOpenLine,
  RiDatabase2Line,
  RiFlashlightLine,
  RiMapPinLine,
  RiTeamLine,
} from "react-icons/ri";
import type { HomepageContent, SpeakingTopicIcon } from "@/lib/homepage";

function TopicIcon({ icon }: { icon: SpeakingTopicIcon }) {
  if (icon === "tools") return <RiBarChart2Line size={18} />;
  if (icon === "hands") return <RiTeamLine size={18} />;
  if (icon === "teams") return <RiFlashlightLine size={18} />;
  return <RiDatabase2Line size={18} />;
}

function StatIcon({ icon }: { icon: string }) {
  if (icon === "book") return <RiBookOpenLine size={18} />;
  if (icon === "pin") return <RiMapPinLine size={18} />;
  return <RiTeamLine size={18} />;
}

export default function SpeakingSection({
  speaking,
  attribution,
  embedded = false,
}: {
  speaking: HomepageContent["speaking"];
  attribution?: string;
  embedded?: boolean;
}) {
  const cite = attribution || "Prince Parfait GANZA";
  const quote = speaking.quote?.trim() || "Technology is more powerful when people can use it.";

  return (
    <section
      className={embedded ? "speaking-band speaking-embedded" : "speaking-band"}
      aria-label="Speaking and training"
      id="speaking"
      data-page-section={embedded ? undefined : true}
    >
      <div className="container speaking-shell">
        <div className="speaking-hero">
          <div className="speaking-intro">
            <p className="section-label">{speaking.label}</p>
            <h2>{speaking.title}</h2>
            {speaking.body ? <p className="speaking-lead">{speaking.body}</p> : null}

            {speaking.stats?.length ? (
              <ul className="speaking-stats">
                {speaking.stats.map((stat) => (
                  <li key={stat.label}>
                    <span className="speaking-stat-icon" aria-hidden="true">
                      <StatIcon icon={stat.icon} />
                    </span>
                    <em>{stat.label}</em>
                  </li>
                ))}
              </ul>
            ) : null}

            <div className="speaking-brand">
              {speaking.brandLogo ? (
                <img src={speaking.brandLogo} alt="" width={44} height={44} className="speaking-brand-mark" />
              ) : null}
              <div>
                <strong>{speaking.brandName}</strong>
                {speaking.brandTagline ? <span>{speaking.brandTagline}</span> : null}
                {speaking.brandNote ? <p>{speaking.brandNote}</p> : null}
              </div>
            </div>
          </div>

          <div className="speaking-visual">
            {speaking.image ? (
              <img src={speaking.image} alt="" className="speaking-photo" width={720} height={900} />
            ) : (
              <div className="speaking-photo-fallback" aria-hidden="true" />
            )}
            {speaking.visualCaption ? (
              <p className="speaking-visual-caption">{speaking.visualCaption}</p>
            ) : null}
            <blockquote className="speaking-quote-card">
              <p>{quote}</p>
              <cite>— {cite}</cite>
            </blockquote>
            <div className="speaking-logo-card">
              {speaking.brandLogo ? <img src={speaking.brandLogo} alt="" width={36} height={36} /> : null}
              <div>
                <strong>{speaking.brandName}</strong>
                {speaking.brandTagline ? <span>{speaking.brandTagline}</span> : null}
              </div>
            </div>
          </div>
        </div>

        <div className="speaking-cover">
          <div className="speaking-cover-head">
            <h3>{speaking.coverTitle}</h3>
            {speaking.coverSubtitle ? <p>{speaking.coverSubtitle}</p> : null}
          </div>
          <ul className="speaking-topics">
            {speaking.topics.map((topic) => (
              <li key={topic.title}>
                <span className={`speaking-topic-icon is-${topic.icon}`} aria-hidden="true">
                  <TopicIcon icon={topic.icon} />
                </span>
                <strong>{topic.title}</strong>
                <p>{topic.body}</p>
              </li>
            ))}
          </ul>
          <div className="speaking-foot">
            {speaking.footQuote ? (
              <p className="speaking-foot-quote">
                <span aria-hidden="true">“</span>
                {speaking.footQuote} — {cite}
              </p>
            ) : (
              <span />
            )}
            <div className="speaking-foot-brand">
              {speaking.brandLogo ? <img src={speaking.brandLogo} alt="" width={28} height={28} /> : null}
              <div>
                <strong>{speaking.brandName}</strong>
                {speaking.brandTagline ? <span>{speaking.brandTagline}</span> : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
