import AlertCard from "./AlertCard.jsx";
import DetailsSidebar from "./DetailsSidebar.jsx";
import TechnicianTabs from "./TechnicianTabs.jsx";
import ViewToggle from "./ViewToggle.jsx";

function TaskSection({ title, alerts, emptyMessage, onAlertOpen }) {
  return (
    <section className="task-section">
      <h2>{title}</h2>
      {alerts.length > 0 ? (
        <div className="alert-list">
          {alerts.map((alert) => (
            <AlertCard key={alert.id} alert={alert} onOpen={() => onAlertOpen(alert.id)} />
          ))}
        </div>
      ) : (
        emptyMessage && <p className="section-empty-message">{emptyMessage}</p>
      )}
    </section>
  );
}

export default function AlertsPage({
  alerts,
  currentView,
  isSidebarOpen,
  onAlertOpen,
  onBack,
  onCloseSidebar,
  onSeverityFilterChange,
  onServiceFiltersChange,
  onTabChange,
  onTogglePrioritised,
  onViewChange,
  prioritisedAlertIds,
  project,
  selectedAlert,
  lastUpdated,
  severityFilter,
  serviceFilters,
  technicianTab,
}) {
  const projectAlerts = alerts.filter((alert) => alert.projectId === project.id);
  const availableServices = [...new Set(projectAlerts.map((alert) => alert.service))].sort();
  const severityMatches = (alert) =>
    severityFilter === "all" || alert.severity.toLowerCase() === severityFilter;
  const serviceMatches = (alert) =>
    serviceFilters.length === 0 || serviceFilters.includes(alert.service);
  const filteredProjectAlerts = projectAlerts.filter(
    (alert) => severityMatches(alert) && serviceMatches(alert)
  );
  const prioritisedAlerts = filteredProjectAlerts.filter((alert) =>
    prioritisedAlertIds.includes(alert.id)
  );
  const otherAlerts = filteredProjectAlerts.filter(
    (alert) => !prioritisedAlertIds.includes(alert.id)
  );
  const managerAlerts =
    technicianTab === "prioritised"
      ? prioritisedAlerts
      : technicianTab === "other"
        ? otherAlerts
        : filteredProjectAlerts;
  const isTechnician = currentView === "technician";
  const severityTabs = [
    { id: "all", label: "All" },
    { id: "danger", label: "Danger" },
    { id: "warning", label: "Warning" },
  ];
  const lastUpdatedLabel = lastUpdated.toLocaleString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className={`alerts-page ${isSidebarOpen ? "has-sidebar" : ""}`}>
      <div className="alerts-toolbar">
        <h1>Project - {project.name}</h1>
        <ViewToggle currentView={currentView} onViewChange={onViewChange} />
      </div>

      <div className={`alerts-layout ${isSidebarOpen ? "sidebar-open" : ""}`}>
        <section className={`alerts-main ${isTechnician ? "technician-main" : ""}`}>
          <div className="project-workspace">
            <div className="service-filter-column">
              <p className="last-updated">Last updated: {lastUpdatedLabel}</p>
              <aside className="filter-panel service-filter-panel" aria-label="AWS service filters">
                <div className="filter-group">
                  <h2>AWS Services</h2>
                  <label>
                    <input
                      type="checkbox"
                      checked={serviceFilters.length === 0}
                      onChange={() => onServiceFiltersChange([])}
                    />
                    All
                  </label>
                  {availableServices.length > 0 ? (
                    availableServices.map((service) => (
                      <label key={service}>
                        <input
                          type="checkbox"
                          checked={serviceFilters.includes(service)}
                          onChange={(event) => {
                            onServiceFiltersChange(
                              event.target.checked
                                ? [...serviceFilters, service]
                                : serviceFilters.filter((selectedService) => selectedService !== service)
                            );
                          }}
                        />
                        {service}
                      </label>
                    ))
                  ) : (
                    <p className="filter-note">No services found.</p>
                  )}
                </div>
              </aside>
            </div>

            <div className="tasks-area">
              <div className="filter-tabs">
                <TechnicianTabs activeTab={technicianTab} onTabChange={onTabChange} />
                <TechnicianTabs
                  activeTab={severityFilter}
                  ariaLabel="Severity filters"
                  onTabChange={onSeverityFilterChange}
                  tabs={severityTabs}
                />
              </div>

              {isTechnician ? (
                <>
                  {(technicianTab === "all" || technicianTab === "prioritised") && (
                    <TaskSection
                      title="Prioritised Tasks"
                      alerts={prioritisedAlerts}
                      emptyMessage="No Prioritised Task for now"
                      onAlertOpen={onAlertOpen}
                    />
                  )}

                  {(technicianTab === "all" || technicianTab === "other") && (
                    <TaskSection title="Other Tasks" alerts={otherAlerts} onAlertOpen={onAlertOpen} />
                  )}
                </>
              ) : (
                <div className="alert-list manager-list">
                  {managerAlerts.map((alert) => (
                    <AlertCard key={alert.id} alert={alert} onOpen={() => onAlertOpen(alert.id)} />
                  ))}
                </div>
              )}

              {projectAlerts.length === 0 && (
                <p className="empty-standard">-- Everything is up to standard --</p>
              )}
              {projectAlerts.length > 0 && filteredProjectAlerts.length === 0 && (
                <p className="empty-standard">-- No alerts match these filters --</p>
              )}
              {projectAlerts.length > 0 && filteredProjectAlerts.length > 0 && (
                <p className="standard-message">-- Everything else is up to standard --</p>
              )}
            </div>
          </div>
        </section>

        {isSidebarOpen && selectedAlert && (
          <DetailsSidebar
            alert={selectedAlert}
            currentView={currentView}
            isPrioritised={prioritisedAlertIds.includes(selectedAlert.id)}
            onClose={onCloseSidebar}
            onTogglePrioritised={() => onTogglePrioritised(selectedAlert.id)}
          />
        )}
      </div>
    </div>
  );
}
