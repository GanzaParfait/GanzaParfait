"use client";

import { useState } from "react";
import Link from "next/link";
import {
  RiArrowRightLine,
  RiArrowRightUpLine,
  RiBarChartBoxLine,
  RiCompass3Line,
  RiDatabase2Line,
  RiLayoutGridLine,
} from "react-icons/ri";
import type { HomepageContent, KnowledgeIcon } from "@/lib/homepage";

const ICONS: Record<KnowledgeIcon, typeof RiCompass3Line> = {
  strategy: RiCompass3Line,
  product: RiLayoutGridLine,
  technology: RiDatabase2Line,
  data: RiBarChartBoxLine,
};

const ICON_ORDER: KnowledgeIcon[] = ["strategy", "product", "technology", "data"];

function markStatement(text: string, mark: string) {
  if (!mark || !text.toLowerCase().includes(mark.toLowerCase())) {
    return <>{text}</>;
  }
  const start = text.toLowerCase().indexOf(mark.toLowerCase());
  const end = start + mark.length;
  return (
    <>
      {text.slice(0, start)}
      <span className="knowledge-mark">{text.slice(start, end)}</span>
      {text.slice(end)}
    </>
  );
}

export default function KnowledgeSection({
  knowledge,
  embedded = false,
}: {
  knowledge: HomepageContent["knowledge"];
  embedded?: boolean;
}) {
  const [active, setActive] = useState(0);
  const Tag = embedded ? "div" : "section";
  const display = knowledge.display;
  const showBar = (display.showStatement && knowledge.statement) || (display.showStats && knowledge.stats.length) || (display.showQuote && knowledge.quote);

  return (
    <Tag className={embedded ? "knowledge knowledge-embedded" : "knowledge"} id={embedded ? undefined : "knowledge"} aria-label="Knowledge preview" data-page-section={embedded ? undefined : true} data-section-label={embedded ? undefined : "Capabilities"}>
      <div className="container">
        <div className="knowledge-head">
          <div className="knowledge-copy">
            <p className="section-label">{knowledge.label}</p>
            <h2>{knowledge.title}</h2>
            {knowledge.body ? <p className="knowledge-body">{knowledge.body}</p> : null}
            {display.showScript && knowledge.script ? <p className="knowledge-script">{knowledge.script}</p> : null}
          </div>
          {display.showRail && knowledge.rail.length ? (
            <ol className="knowledge-rail" aria-hidden="true">
              {knowledge.rail.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          ) : null}
        </div>

        <div className="knowledge-grid">
          {knowledge.items.map((item, index) => {
            const iconKey = item.icon || ICON_ORDER[index % ICON_ORDER.length];
            const Icon = ICONS[iconKey];
            const href = item.href || "/services";
            const on = active === index;
            return (
              <article
                key={`${item.title}-${index}`}
                className={on ? `knowledge-card is-on is-${iconKey}` : `knowledge-card is-${iconKey}`}
                onMouseEnter={() => setActive(index)}
                onFocus={() => setActive(index)}
              >
                <div className="knowledge-card-top">
                  {display.showIndex ? <span className="knowledge-index">{String(index + 1).padStart(2, "0")}</span> : null}
                  <span className="knowledge-icon" aria-hidden="true">
                    <Icon size={18} />
                  </span>
                </div>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
                {item.tags?.length ? (
                  <p className="knowledge-tags">{item.tags.join(" · ")}</p>
                ) : null}
                <div className="knowledge-card-foot">
                  <Link href={href} className="knowledge-more">
                    {knowledge.learnMore} <RiArrowRightLine size={14} />
                  </Link>
                  {display.showGo ? (
                    <Link href={href} className="knowledge-go" aria-label={`${knowledge.learnMore}: ${item.title}`}>
                      <RiArrowRightUpLine size={16} />
                    </Link>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>

        {showBar ? (
          <div className="knowledge-bar">
            {display.showStatement && knowledge.statement ? (
              <p className="knowledge-statement">{markStatement(knowledge.statement, knowledge.statementMark)}</p>
            ) : null}
            {display.showStats && knowledge.stats.length ? (
              <ul className="knowledge-stats">
                {knowledge.stats.map((stat) => (
                  <li key={`${stat.value}-${stat.label}`}>
                    <strong>{stat.value}</strong>
                    <span>{stat.label}</span>
                  </li>
                ))}
              </ul>
            ) : null}
            {display.showQuote && knowledge.quote ? (
              <blockquote className="knowledge-quote">
                <p>“{knowledge.quote}”</p>
                {knowledge.attribution ? <cite>— {knowledge.attribution}</cite> : null}
              </blockquote>
            ) : null}
          </div>
        ) : null}
      </div>
    </Tag>
  );
}
