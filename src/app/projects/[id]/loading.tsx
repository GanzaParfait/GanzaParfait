export default function ProjectLoading() {
  return (
    <div className="page-skel case-study" aria-busy="true" aria-live="polite">
      <div className="container">
        <span className="page-skel-line" />
        <div className="page-skel-hero-grid">
          <span className="page-skel-copy" />
          <span className="page-skel-visual" />
        </div>
        <span className="page-skel-meta" />
        <div className="case-shots">
          <span className="page-skel-line is-short" />
          <div className="projects-skel-row page-skel-media">
            <span />
            <span />
            <span />
            <span />
          </div>
        </div>
      </div>
    </div>
  );
}
