"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { RiArrowRightLine } from "react-icons/ri";
import { type Project } from "@/data/site-data";
import { imagesForStory, type HomepageContent, type WorkStory } from "@/lib/homepage";
import MediaPreview, { type PreviewItem } from "@/components/ui/MediaPreview";
import WorkProjectCard from "@/components/work/WorkProjectCard";
import { mediaForProject, projectCover, projectRelatedStills, projectStillCaption } from "@/components/work/work-media";
import { mergeProjectCatalog } from "@/lib/projects";

export default function SelectedWork({
  work,
  records,
  embedded = false,
}: {
  work: HomepageContent["work"];
  records?: Project[];
  embedded?: boolean;
}) {
  const stories = useMemo(() => orderSelectedStories(work.stories, records), [work.stories, records]);
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

function storyFromProject(project: Project): WorkStory {
  return {
    id: project.id,
    title: project.title,
    organization: project.organization || "",
    line: project.tagline || project.description,
    support: project.description,
    challenge: "",
    contribution: "",
    status: "",
    href: `/projects/${project.id}`,
    tags: (project.technologies || []).slice(0, 3),
    images: project.image ? [project.image] : [],
  };
}

/** Pin homepagePinned project first, then fill up to 4 from homepage stories. */
function orderSelectedStories(stories: WorkStory[], records?: Project[]) {
  const catalog = mergeProjectCatalog(records);
  const pinned = catalog.find((item) => item.homepagePinned && (item.visibility || "public") === "public");
  const byId = new Map(stories.map((story) => [story.id, story]));

  const leadStory = pinned ? byId.get(pinned.id) || storyFromProject(pinned) : stories[0];
  if (!leadStory) return [];

  const rest = stories.filter((story) => story.id !== leadStory.id).slice(0, 3);
  return [leadStory, ...rest].slice(0, 4).map((story, index) => ({
    story,
    index,
    project: catalog.find((item) => item.id === story.id),
  }));
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
