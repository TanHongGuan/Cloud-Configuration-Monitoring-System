import { useEffect, useMemo, useState } from "react";
import Header from "./components/Header.jsx";
import HomePage from "./components/HomePage.jsx";
import AlertsPage from "./components/AlertsPage.jsx";
import { alerts, projects } from "./data/mockData.js";

const STORAGE_KEY = "cloud-monitor-prioritised-alerts";

function readPrioritisedAlerts() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export default function App() {
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [currentView, setCurrentView] = useState("manager");
  const [selectedAlertId, setSelectedAlertId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [technicianTab, setTechnicianTab] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [serviceFilters, setServiceFilters] = useState([]);
  const [prioritisedAlertIds, setPrioritisedAlertIds] = useState(readPrioritisedAlerts);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prioritisedAlertIds));
  }, [prioritisedAlertIds]);

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedProjectId) ?? null,
    [selectedProjectId]
  );

  const selectedAlert = useMemo(
    () => alerts.find((alert) => alert.id === selectedAlertId) ?? null,
    [selectedAlertId]
  );

  function openProject(projectId) {
    setSelectedProjectId(projectId);
    setCurrentView("manager");
    setSelectedAlertId(null);
    setIsSidebarOpen(false);
    setTechnicianTab("all");
    setSeverityFilter("all");
    setServiceFilters([]);
  }

  function returnHome() {
    setSelectedProjectId(null);
    setSelectedAlertId(null);
    setIsSidebarOpen(false);
    setCurrentView("manager");
    setTechnicianTab("all");
    setSeverityFilter("all");
    setServiceFilters([]);
  }

  function openAlert(alertId) {
    setSelectedAlertId(alertId);
    setIsSidebarOpen(true);
  }

  function closeSidebar() {
    setIsSidebarOpen(false);
    setSelectedAlertId(null);
  }

  function togglePrioritised(alertId) {
    setPrioritisedAlertIds((currentIds) =>
      currentIds.includes(alertId)
        ? currentIds.filter((id) => id !== alertId)
        : [...currentIds, alertId]
    );
  }

  return (
    <main className="page-frame">
      <section className="app-shell" aria-label="Cloud Configuration Monitoring">
        <Header onHomeClick={returnHome} />
        {selectedProject ? (
          <AlertsPage
            alerts={alerts}
            currentView={currentView}
            isSidebarOpen={isSidebarOpen}
            onAlertOpen={openAlert}
            onBack={returnHome}
            onCloseSidebar={closeSidebar}
            onSeverityFilterChange={setSeverityFilter}
            onServiceFiltersChange={setServiceFilters}
            onTabChange={setTechnicianTab}
            onTogglePrioritised={togglePrioritised}
            onViewChange={setCurrentView}
            prioritisedAlertIds={prioritisedAlertIds}
            project={selectedProject}
            selectedAlert={selectedAlert}
            severityFilter={severityFilter}
            serviceFilters={serviceFilters}
            technicianTab={technicianTab}
          />
        ) : (
          <HomePage alerts={alerts} projects={projects} onProjectSelect={openProject} />
        )}
      </section>
    </main>
  );
}
