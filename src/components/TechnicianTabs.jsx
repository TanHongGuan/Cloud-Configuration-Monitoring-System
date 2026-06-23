const defaultTabs = [
  { id: "all", label: "All" },
  { id: "prioritised", label: "Prioritised" },
  { id: "other", label: "Other" },
];

export default function TechnicianTabs({
  activeTab,
  ariaLabel = "Task filters",
  onTabChange,
  tabs = defaultTabs,
}) {
  return (
    <div className="technician-tabs" role="tablist" aria-label={ariaLabel}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={activeTab === tab.id ? "active" : ""}
          onClick={() => onTabChange(tab.id)}
          role="tab"
          aria-selected={activeTab === tab.id}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
