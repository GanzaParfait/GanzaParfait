"use client";

import Link from "next/link";
import {
  RiArchiveLine,
  RiBarChartBoxLine,
  RiCalendarLine,
  RiCheckboxCircleLine,
  RiCloudLine,
  RiFileUserLine,
  RiLockLine,
  RiMailLine,
  RiNewspaperLine,
  RiRefreshLine,
  RiShieldCheckLine,
  RiArrowRightLine,
  RiTimeLine,
  RiUser3Line,
  RiUserHeartLine,
  RiCookieLine,
} from "react-icons/ri";
import type {
  PrivacyCollectIcon,
  PrivacyPageContent,
  PrivacyPromiseIcon,
  PrivacySectionIcon,
} from "@/lib/privacy-page";
import { privacyPageFrom } from "@/lib/privacy-page";
import { siteConfig } from "@/data/site-data";
import { useSiteSettings } from "@/hooks/useSiteSettings";

function PromiseIcon({ icon }: { icon: PrivacyPromiseIcon }) {
  if (icon === "user") return <RiUser3Line size={18} />;
  if (icon === "shield") return <RiShieldCheckLine size={18} />;
  if (icon === "clock") return <RiTimeLine size={18} />;
  return <RiLockLine size={18} />;
}

function SectionIcon({ icon }: { icon: PrivacySectionIcon }) {
  if (icon === "folder") return <RiArchiveLine size={18} />;
  if (icon === "check") return <RiCheckboxCircleLine size={18} />;
  if (icon === "cloud") return <RiCloudLine size={18} />;
  if (icon === "cookie") return <RiCookieLine size={18} />;
  if (icon === "archive") return <RiArchiveLine size={18} />;
  if (icon === "choice") return <RiUserHeartLine size={18} />;
  if (icon === "refresh") return <RiRefreshLine size={18} />;
  return <RiUser3Line size={18} />;
}

function CollectIcon({ icon }: { icon: PrivacyCollectIcon }) {
  if (icon === "news") return <RiNewspaperLine size={18} />;
  if (icon === "cv") return <RiFileUserLine size={18} />;
  if (icon === "chart") return <RiBarChartBoxLine size={18} />;
  return <RiMailLine size={18} />;
}

function withEmail(text: string) {
  const parts = text.split(/(hello@princeparfait\.com|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g);
  return parts.map((part, index) =>
    part.includes("@") ? (
      <a key={`${part}-${index}`} href={`mailto:${part}`}>
        {part}
      </a>
    ) : (
      <span key={`${part}-${index}`}>{part}</span>
    ),
  );
}

export default function PrivacyPageView({
  content: contentOverride,
  embedded = false,
}: {
  content?: PrivacyPageContent;
  embedded?: boolean;
}) {
  const settings = useSiteSettings();
  const content = contentOverride || privacyPageFrom(settings);
  const email = settings.contactEmail || siteConfig.contact.email;
  const Tag = embedded ? "div" : "article";

  return (
    <Tag className={embedded ? "privacy-page privacy-embedded" : "privacy-page"}>
      <div className="container privacy-shell">
        <header className="privacy-hero">
          <div className="privacy-hero-copy">
            <p className="section-label">{content.label}</p>
            <h1>{content.title}</h1>
            {content.subtitle ? <p className="privacy-subtitle">{content.subtitle}</p> : null}
            <p className="privacy-lead">{content.lead}</p>
            <p className="privacy-updated">
              <RiCalendarLine size={14} aria-hidden="true" />
              {content.updatedLabel} {content.updatedDate}
            </p>
          </div>
          <aside className="privacy-aside-card">
            <span className="privacy-aside-icon" aria-hidden="true">
              <RiShieldCheckLine size={22} />
            </span>
            <strong>{content.asideTitle}</strong>
            <p>{content.asideBody}</p>
          </aside>
        </header>

        {content.promises.length ? (
          <ul className="privacy-promises">
            {content.promises.map((item) => (
              <li key={item.text}>
                <span aria-hidden="true">
                  <PromiseIcon icon={item.icon} />
                </span>
                <p>{item.text}</p>
              </li>
            ))}
          </ul>
        ) : null}

        <div className="privacy-sections">
          {content.sections.map((section) => (
            <section key={section.n} className="privacy-block">
              <div className="privacy-block-head">
                <span className="privacy-block-n">{section.n}</span>
                <span className="privacy-block-icon" aria-hidden="true">
                  <SectionIcon icon={section.icon} />
                </span>
                <h2>{section.title}</h2>
              </div>

              {section.body ? (
                <p className="privacy-block-body">
                  {withEmail(section.body.replace(/hello@princeparfait\.com/g, email))}
                </p>
              ) : null}

              {section.collectCards?.length ? (
                <ul className="privacy-collect-grid">
                  {section.collectCards.map((card) => (
                    <li key={card.title}>
                      <span aria-hidden="true">
                        <CollectIcon icon={card.icon} />
                      </span>
                      <strong>{card.title}</strong>
                      <p>{card.body}</p>
                    </li>
                  ))}
                </ul>
              ) : null}

              {section.bullets?.length ? (
                <ul className="privacy-checks">
                  {section.bullets.map((item) => (
                    <li key={item}>
                      <RiCheckboxCircleLine size={16} aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : null}

              {section.pills?.length ? (
                <ul className="privacy-pills">
                  {section.pills.map((pill) => (
                    <li key={pill}>{pill}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </div>

        <div className="privacy-cta">
          <span className="privacy-cta-icon" aria-hidden="true">
            <RiMailLine size={28} />
          </span>
          <div>
            <p className="privacy-cta-eyebrow">{content.ctaEyebrow}</p>
            <h2>{content.ctaTitle}</h2>
            <p>{content.ctaBody}</p>
          </div>
          <Link href={content.ctaHref} className="btn btn-primary">
            {content.ctaLabel} <RiArrowRightLine size={16} />
          </Link>
        </div>
      </div>
    </Tag>
  );
}
