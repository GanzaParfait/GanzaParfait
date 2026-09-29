import { ProjectSkeletonRow } from "@/components/work/ProjectCardSkeleton";

export default function ProjectsLoading() {
  return (
    <div className="page-skel projects-page" aria-hidden="true">
      <div className="container">
        <span className="projects-skel-line is-hero" />
        <span className="projects-skel-line is-lede" />
        <ProjectSkeletonRow />
      </div>
    </div>
  );
}
