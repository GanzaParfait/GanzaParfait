"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { RiArrowRightLine } from "react-icons/ri";
import { type Project } from "@/data/site-data";
import {
  HOMEPAGE_WORK_SLOTS,
  imagesForStory,
  workStoryFromProject,
  type HomepageContent,
  type WorkStory,
} from "@/lib/homepage";
import MediaPreview, { type PreviewItem } from "@/components/ui/MediaPreview";
import WorkProjectCard from "@/components/work/WorkProjectCard";
import { mediaForProject, projectCover, projectRelatedStills, projectStillCaption } from "@/components/work/work-media";
import { listListedProjects } from "@/lib/projects";

export default function SelectedWork({
  work,
  records,
  embedded = false,
}: {
  work: HomepageContent["work"];
  records?: Project[];
  embedded?: boolean;
}) {
  const stories = useMemo(() => resolveSelectedWork(work, records), [work, records]);
  const featured = stories[0];
  const rest = stories.slice(1);
  const [preview, setPreview] = useState<{ title: string; items: PreviewItem[]; start: number } | null>(null);
  const Tag = embedded ? "div" : "section";

  const openPreview = (title: string, items: PreviewItem[]) => {
    setPreview({ title, items, start: 0 });
  };

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

        <div className="selected-stage">
          {featured ? (
            <div className="selected-featured">
              {(() => {
                const images = imagesForStory(featured.story, records);
                const items = mediaForProject(featured.project, images);
                const cover = featured.project ? projectCover(featured.project) || images[0] : images[0];
                const href = featured.story.href || `/projects/${featured.story.id}`;
                const fromStills = featured.project
                  ? projectRelatedStills(featured.project, cover, 2).map((src) => ({
                      src,
                      title: projectStillCaption(featured.project!, src),
                      href,
                    }))
                  : [];
                const fromNeighbors =
                  fromStills.length >= 2
                    ? []
                    : rest
                        .map(({ story, project }) => {
                          const neighborImages = imagesForStory(story, records);
                          const src = project ? projectCover(project) || neighborImages[0] : neighborImages[0];
                          if (!src) return null;
                          return {
                            src,
                            title: story.title || project?.title || "Project",
                            href: story.href || (project ? `/projects/${project.id}` : "/projects"),
                          };
                        })
                        .filter((item): item is { src: string; title: string; href: string } => Boolean(item));
                const related = [...fromStills, ...fromNeighbors].slice(0, 2);
                return (
                  <WorkProjectCard
                    project={featured.project}
                    number={1}
                    title={featured.story.title || featured.project?.title || "Project"}
                    line={featured.story.line}
                    body={featuredBody(featured.project, featured.story)}
                    href={featured.story.href || `/projects/${featured.story.id}`}
                    cover={cover}
                    related={related}
                    mediaCount={items.length}
                    wide
                    flourish={work.flourish}
                    onPreview={() =>
                      openPreview(featured.story.title || featured.project?.title || "Project", items)
                    }
                  />
                );
              })()}
            </div>
          ) : null}

          {rest.length ? (
            <div className="selected-rest">
              {rest.map(({ story, index, project }) => {
                const images = imagesForStory(story, records);
                const items = mediaForProject(project, images);
                return (
                  <WorkProjectCard
                    key={story.id}
                    project={project}
                    number={index + 1}
                    title={story.title || project?.title || "Project"}
                    line={story.line}
                    body={compactBody(project, story)}
                    href={story.href || `/projects/${story.id}`}
                    cover={project ? projectCover(project) || images[0] : images[0]}
                    mediaCount={items.length}
                    onPreview={() => openPreview(story.title || project?.title || "Project", items)}
                  />
                );
              })}
            </div>
          ) : null}
        </div>

        <div className="selected-foot-cta" aria-label="Browse all projects">
          <Link href="/projects" className="btn btn-outline">
            {work.cta} <RiArrowRightLine size={16} />
          </Link>
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

/**
 * The dashboard selection decides the order; the pinned project only leads when nothing selected is listed. Only listed projects appear
 * (archived, unlisted and draft are skipped); empty slots fill from featured, then other listed projects.
 */
export function resolveSelectedWork(work: Pick<HomepageContent["work"], "projectIds" | "stories">, records?: Project[]) {
  const listed = listListedProjects(records);
  const byId = new Map(listed.map((project) => [project.id, project]));
  const pinned = listed.find((project) => project.homepagePinned);

  const ids: string[] = [];
  const add = (id?: string) => {
    if (id && byId.has(id) && !ids.includes(id) && ids.length < HOMEPAGE_WORK_SLOTS) ids.push(id);
  };
  (work.projectIds || []).forEach(add);
  if (!ids.length) add(pinned?.id);
  listed.filter((project) => project.featured).forEach((project) => add(project.id));
  listed.forEach((project) => add(project.id));

  const storyById = new Map(work.stories.map((story) => [story.id, story]));
  return ids.map((id, index) => {
    const project = byId.get(id)!;
    return { story: storyById.get(id) || workStoryFromProject(project), index, project };
  });
}

function featuredBody(project: Project | undefined, story: WorkStory) {
  const role = project?.contributionSummary?.trim() || project?.myRole?.trim();
  if (role && role.length <= 160) return role;
  const text = (project?.description || story.support || "").trim();
  if (text.length <= 150) return text;
  const cut = text.slice(0, 147);
  const boundary = cut.lastIndexOf(" ");
  return `${(boundary > 80 ? cut.slice(0, boundary) : cut).trim()}…`;
}

function compactBody(project: Project | undefined, story: WorkStory) {
  const text = (project?.description || story.support || "").trim();
  if (text.length <= 120) return text;
  const cut = text.slice(0, 117);
  const boundary = cut.lastIndexOf(" ");
  return `${(boundary > 70 ? cut.slice(0, boundary) : cut).trim()}…`;
}
