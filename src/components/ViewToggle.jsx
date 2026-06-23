export default function ViewToggle({ currentView, onViewChange }) {
  return (
    <div className="view-toggle" aria-label="View toggle">
      <button
        className={currentView === "technician" ? "active" : ""}
        onClick={() => onViewChange("technician")}
      >
        Technician
      </button>
      <button
        className={currentView === "manager" ? "active" : ""}
        onClick={() => onViewChange("manager")}
      >
        Manager
      </button>
    </div>
  );
}
