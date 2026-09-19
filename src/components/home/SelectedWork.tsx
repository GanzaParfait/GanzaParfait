"use client";

import { useState } from "react";
import Link from "next/link";
import { RiArrowRightLine } from "react-icons/ri";
import { projects, type Project } from "@/data/site-data";
import { imagesForStory, type HomepageContent } from "@/lib/homepage";
import MediaPreview, { type PreviewItem } from "@/components/ui/MediaPreview";
import WorkProjectCard from "@/components/work/WorkProjectCard";
import { mediaForProject } from "@/components/work/work-media";

export default function SelectedWork({
  work,
  records,
  embedded = false,
}: {
  work: HomepageContent["work"];
  records?: Project[];
  embedded?: boolean;
}) {
  const stories = work.stories.slice(0, 4).map((story, index) => ({
    story,
    index,
    project: matchProject(story.id, records),
  }));
  const [preview, setPreview] = useState<{ title: string; items: PreviewItem[]; start: number } | null>(null);
  const Tag = embedded ? "div" : "section";

  return (
    <Tag
      className={embedded ? "selected-work selected-work-embedded" : "selected-work"}
      id={embedded ? undefined : "work"}
      aria-label="Selected work"
      data-page-section={embedded ? undefined : true}
      data-section-label={embedded ? undefined : "Work"}
    >
      <div className="container">
        <header className="selected-head">
          <div>
            <p className="section-label">{work.label}</p>
            <h2>{work.title}</h2>
          </div>
          <div>
            <p>{work.intro}</p>
            <Link href="/projects" className="selected-all">
              {work.cta}{" "}
              <span aria-hidden="true">
                <RiArrowRightLine size={16} />
              </span>
            </Link>
          </div>
        </header>

        <div className="selected-board">
          {stories.map(({ story, index, project }) => {
            const images = imagesForStory(story, records);
            const items = mediaForProject(project, images);
            return (
              <WorkProjectCard
                key={story.id}
                project={project}
                number={index + 1}
                title={story.title}
                line={story.line}
                body={project?.description || story.support}
                href={story.href}
                cover={images[0]}
                mediaCount={items.length}
                wide={index === 0 || index === 3}
                flourish={index === 0 ? work.flourish : ""}
                onPreview={() => setPreview({ title: story.title, items, start: 0 })}
              />
            );
          })}
        </div>

        <div className="selected-more">
          <div>
            <p className="section-label">{work.moreLabel}</p>
            <h2>{work.moreTitle}</h2>
            <p>{work.moreBody}</p>
          </div>
          <Link href="/projects" className="btn btn-primary">
            {work.cta} <RiArrowRightLine size={16} />
          </Link>
          <ol aria-hidden="true">
            {work.rail.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </div>
      </div>

      {preview ? (
        <MediaPreview
          title={preview.title}
          items={preview.items}
          start={preview.start}
          onClose={() => setPreview(null)}
        />
      ) : null}
    </Tag>
  );
}

function matchProject(id: string, records?: Project[]) {
  const saved = records?.find((item) => item.id === id);
  const base = projects.find((item) => item.id === id);
  if (saved && base) return { ...base, ...saved, title: saved.title || base.title };
  return saved || base;
}
