export default function ProjectCard({ project, counts, onSelect }) {
  return (
    <button className="project-card" onClick={onSelect}>
      <span className="project-name">{project.name}</span>
      <span className="project-meta">
        <span className="risk-count danger-count">
          <span className="triangle" aria-hidden="true" />
          {counts.danger} danger alerts
        </span>
        <span className="risk-count warning-count">
          <span className="triangle" aria-hidden="true" />
          {counts.warning} warning alerts
        </span>
        <span className="project-arrow" aria-hidden="true">
          &gt;
        </span>
      </span>
    </button>
  );
}
