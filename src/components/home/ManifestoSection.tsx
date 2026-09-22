import Image from "next/image";
import { RiArrowRightLine, RiBarChartBoxLine, RiLightbulbFlashLine, RiSettings3Line } from "react-icons/ri";
import type { HomepageContent } from "@/lib/homepage";
import ManifestoStepDeck from "@/components/home/ManifestoStepDeck";
import { siteConfig } from "@/data/site-data";

const ICONS = [RiLightbulbFlashLine, RiSettings3Line, RiBarChartBoxLine];

export default function ManifestoSection({ manifesto, embedded = false }: { manifesto: HomepageContent["manifesto"]; embedded?: boolean }) {
  const Tag = embedded ? "div" : "section";
  const portraitLocal = Boolean(manifesto.image?.startsWith("/") && !manifesto.image.startsWith("//"));

  return (
    <Tag className={embedded ? "manifesto manifesto-embedded" : "manifesto"} id={embedded ? undefined : "manifesto"} aria-label="Opening statement" data-page-section={embedded ? undefined : true} data-section-label={embedded ? undefined : "Manifesto"}>
      <div className="container manifesto-stage">
        <div className="manifesto-intro">
          <p className="section-label">{manifesto.label}</p>
          <h2>{manifesto.title}</h2>
          <p>{manifesto.body}</p>
        </div>
        <div className="manifesto-figure">
          <div className="manifesto-portrait">
            <div className="manifesto-halo" aria-hidden="true" />
            {manifesto.image ? (
              portraitLocal ? (
                <Image
                  src={manifesto.image}
                  alt={siteConfig.portraitAlt}
                  className="manifesto-photo"
                  width={800}
                  height={1200}
                  sizes="(max-width: 767px) 88vw, 312px"
                  loading="lazy"
                />
              ) : (
                <img
                  src={manifesto.image}
                  alt={siteConfig.portraitAlt}
                  className="manifesto-photo"
                  width={800}
                  height={1200}
                  loading="lazy"
                  decoding="async"
                />
              )
            ) : null}
            {manifesto.chip ? (
              <p className="manifesto-chip">
                <span className="manifesto-chip-text">
                  {manifesto.chip.split("·").map((part) => part.trim()).filter(Boolean).map((part) => (
                    <span key={part}>{part}</span>
                  ))}
                </span>
                <span className="manifesto-chip-mark" aria-hidden="true">
                  <Image
                    src="/brand/icons/favicon/mark-64.webp"
                    alt=""
                    width={40}
                    height={40}
                    loading="lazy"
                  />
                </span>
              </p>
            ) : null}
          </div>
          <div className="manifesto-aside">
            {manifesto.rail.length ? (
              <ol className="manifesto-rail">
                {manifesto.rail.map((item) => <li key={item}>{item}</li>)}
              </ol>
            ) : null}
            {manifesto.script ? <p className="manifesto-script">{manifesto.script}</p> : null}
          </div>
        </div>
        <ol className="manifesto-steps">
          {manifesto.points.map((point, index) => {
            const Icon = ICONS[index % ICONS.length];
            return (
              <li key={`${point.title}-${index}`}>
                {index > 0 ? <span className="manifesto-arrow" aria-hidden="true"><RiArrowRightLine size={14} /></span> : null}
                <article className="manifesto-card">
                  <div>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <span><Icon size={18} /></span>
                  </div>
                  <strong>{point.title}</strong>
                  <p>{point.body}</p>
                  {point.tag ? <small>{point.tag}</small> : null}
                </article>
              </li>
            );
          })}
        </ol>
        <ManifestoStepDeck points={manifesto.points} />
        <div className="manifesto-foot">
          {manifesto.quote ? <blockquote>{manifesto.quote}</blockquote> : null}
          <div className="manifesto-sign">
            <span aria-hidden="true" />
            <div>
              <strong>{manifesto.attribution}</strong>
              <p>{manifesto.roles}</p>
            </div>
          </div>
        </div>
      </div>
    </Tag>
  );
}
