export function ProjectCardSkeleton({ stackIndex = 0 }: { stackIndex?: number }) {
  return (
    <article
      className="selected-card is-compact projects-skel-card"
      aria-hidden="true"
      style={{ ["--stack-i" as string]: stackIndex }}
    >
      <div className="selected-visual">
        <span className="projects-skel-shot" />
      </div>
      <div className="selected-copy">
        <span className="projects-skel-line is-kicker" />
        <span className="projects-skel-line is-title" />
        <span className="projects-skel-line" />
        <span className="projects-skel-line is-short" />
        <span className="projects-skel-pills">
          <i />
          <i />
          <i />
        </span>
      </div>
    </article>
  );
}

export function ProjectSkeletonRow({ count = 3 }: { count?: number }) {
  return (
    <div className="projects-skel-row projects-row is-even" aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <ProjectCardSkeleton key={index} stackIndex={index} />
      ))}
    </div>
  );
}
