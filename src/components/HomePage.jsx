import { useMemo, useState } from "react";
import ProjectCard from "./ProjectCard.jsx";

function getCounts(projectId, alerts) {
  return alerts
    .filter((alert) => alert.projectId === projectId)
    .reduce(
      (counts, alert) => ({
        danger: counts.danger + (alert.severity === "Danger" ? 1 : 0),
        warning: counts.warning + (alert.severity === "Warning" ? 1 : 0),
      }),
      { danger: 0, warning: 0 }
    );
}

export default function HomePage({ alerts, lastUpdated, projects, onProjectSelect }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortByName, setSortByName] = useState(false);
  const [showDangerOnly, setShowDangerOnly] = useState(false);
  const [showWarningOnly, setShowWarningOnly] = useState(false);
  const lastUpdatedLabel = lastUpdated.toLocaleString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const projectsWithCounts = useMemo(
    () =>
      projects.map((project) => ({
        ...project,
        counts: getCounts(project.id, alerts),
      })),
    [alerts, projects]
  );

  const visibleProjects = useMemo(() => {
    const filtered = projectsWithCounts.filter((project) => {
      const matchesSearch = project.name.toLowerCase().includes(searchTerm.trim().toLowerCase());
      const matchesDanger = !showDangerOnly || project.counts.danger > 0;
      const matchesWarning = !showWarningOnly || project.counts.warning > 0;
      return matchesSearch && matchesDanger && matchesWarning;
    });

    return sortByName
      ? [...filtered].sort((a, b) => a.name.localeCompare(b.name))
      : filtered;
  }, [projectsWithCounts, searchTerm, showDangerOnly, showWarningOnly, sortByName]);

  return (
    <div className="home-page">
      <h1>Overview of Projects</h1>
      <div className="home-layout">
        <div className="service-filter-column">
          <p className="last-updated">Last updated: {lastUpdatedLabel}</p>
          <aside className="filter-panel" aria-label="Project filters">
            <div className="filter-group">
              <h2>Search</h2>
              <input
                type="search"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>

            <div className="filter-group">
              <h2>Sort By</h2>
              <label>
                <input
                  type="checkbox"
                  checked={sortByName}
                  onChange={(event) => setSortByName(event.target.checked)}
                />
                Name
              </label>
            </div>

            <hr />

            <div className="filter-group">
              <h2>Risk Level</h2>
              <label>
                <input
                  type="checkbox"
                  checked={showDangerOnly}
                  onChange={(event) => setShowDangerOnly(event.target.checked)}
                />
                Danger
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={showWarningOnly}
                  onChange={(event) => setShowWarningOnly(event.target.checked)}
                />
                Warning
              </label>
            </div>
          </aside>
        </div>

        <section className="project-list" aria-label="Projects">
          {visibleProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              counts={project.counts}
              onSelect={() => onProjectSelect(project.id)}
            />
          ))}
          {visibleProjects.length === 0 && <p className="empty-state">No projects found.</p>}
        </section>
      </div>
    </div>
  );
}
