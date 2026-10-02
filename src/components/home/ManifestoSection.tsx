"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { RiArrowRightLine, RiBarChartBoxLine, RiLightbulbFlashLine, RiSettings3Line, RiVolumeMuteLine, RiVolumeUpLine } from "react-icons/ri";
import type { HomepageContent } from "@/lib/homepage";
import ManifestoStepDeck from "@/components/home/ManifestoStepDeck";
import ResilientCover from "@/components/work/ResilientCover";
import { siteConfig } from "@/data/site-data";
import { isVideoUrl } from "@/lib/projects";
import { cloudinaryVideoDeliveryUrl, cloudinaryVideoPosterUrl } from "@/lib/cloudinary-url";

const ICONS = [RiLightbulbFlashLine, RiSettings3Line, RiBarChartBoxLine];

export default function ManifestoSection({ manifesto, embedded = false }: { manifesto: HomepageContent["manifesto"]; embedded?: boolean }) {
  const Tag = embedded ? "div" : "section";
  const video = isVideoUrl(manifesto.image);
  const preferMuted = manifesto.videoMuted !== false;
  const [muted, setMuted] = useState(preferMuted);
  const [ready, setReady] = useState(false);
  const [posterOk, setPosterOk] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const delivery = video ? cloudinaryVideoDeliveryUrl(manifesto.image, { width: 720 }) : manifesto.image;
  const poster = video ? cloudinaryVideoPosterUrl(manifesto.image, { width: 720 }) : undefined;

  useEffect(() => {
    setMuted(preferMuted);
    setReady(false);
    setPosterOk(true);
  }, [preferMuted, manifesto.image]);

  useEffect(() => {
    if (!video || !videoRef.current) return;
    const node = videoRef.current;
    node.muted = muted;
    const reduce = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      node.pause();
      return;
    }
    void node.play().catch(() => {});
  }, [video, delivery, muted]);

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
              video ? (
                <>
                  {poster && posterOk ? (
                    <img
                      src={poster}
                      alt=""
                      className="manifesto-photo"
                      aria-hidden="true"
                      onError={() => setPosterOk(false)}
                      style={{ position: "absolute", inset: 0, opacity: ready ? 0 : 1, transition: "opacity 0.35s ease", objectFit: "contain", objectPosition: "center bottom" }}
                    />
                  ) : null}
                  <video
                    ref={videoRef}
                    className="manifesto-photo"
                    src={delivery}
                    muted={muted}
                    autoPlay
                    loop
                    playsInline
                    preload="auto"
                    aria-label={siteConfig.portraitAlt}
                    onLoadedData={() => setReady(true)}
                    onPlaying={() => setReady(true)}
                    style={{ opacity: ready || !poster || !posterOk ? 1 : 0, transition: "opacity 0.35s ease" }}
                  />
                  <button
                    type="button"
                    className="manifesto-video-sound"
                    onClick={() => {
                      const next = !muted;
                      setMuted(next);
                      if (videoRef.current) {
                        videoRef.current.muted = next;
                        if (!next) void videoRef.current.play().catch(() => {});
                      }
                    }}
                    aria-pressed={!muted}
                    aria-label={muted ? "Unmute video" : "Mute video"}
                  >
                    {muted ? <RiVolumeMuteLine size={15} /> : <RiVolumeUpLine size={15} />}
                    <span>{muted ? "Muted" : "Sound"}</span>
                  </button>
                </>
              ) : (
                <ResilientCover
                  src={manifesto.image}
                  alt={siteConfig.portraitAlt}
                  className="manifesto-photo"
                  sizes="(max-width: 767px) 88vw, 312px"
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
