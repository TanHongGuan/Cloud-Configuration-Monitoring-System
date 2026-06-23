export default function DetailsSidebar({
  alert,
  currentView,
  isPrioritised,
  onClose,
  onTogglePrioritised,
}) {
  const isTechnician = currentView === "technician";
  const technicianSteps = Array.isArray(alert.technicianRecommendation)
    ? alert.technicianRecommendation
    : [alert.technicianRecommendation].filter(Boolean);

  return (
    <aside className="details-sidebar" aria-label="Alert details">
      <button className="close-sidebar" onClick={onClose}>
        &gt;&gt; Close
      </button>

      <div className="detail-block">
        <span className="detail-label">Severity</span>
        <strong className={`severity-value ${alert.severity.toLowerCase()}`}>{alert.severity}</strong>
      </div>

      <h2>{alert.title}</h2>

      {isTechnician ? (
        <>
          <div className="detail-block">
            <h3>Resource ID</h3>
            <p className="resource-id">{alert.resourceId}</p>
          </div>

          <div className="detail-block">
            <h3>Resource Type</h3>
            <p>{alert.resourceType}</p>
          </div>

          <div className="detail-block">
            <h3>Rule</h3>
            <p>{alert.rule}</p>
          </div>

          <div className="detail-block">
            <h3>Technical Reason</h3>
            <p>{alert.situation}</p>
          </div>

          <div className="detail-block">
            <h3>Technical Fix</h3>
            <ol className="technical-steps">
              {technicianSteps.map((step, index) => (
                <li key={`${alert.id}-step-${index}`}>{step}</li>
              ))}
            </ol>
          </div>
        </>
      ) : (
        <>
          <div className="detail-block">
            <h3>Situation</h3>
            <p>{alert.situation}</p>
          </div>

          <div className="detail-block">
            <h3>Risk</h3>
            <p>{alert.risk}</p>
          </div>

          <div className="detail-block">
            <h3>AWS Part to Fix</h3>
            <p>{alert.awsPart}</p>
          </div>

          <div className="detail-block">
            <h3>Recommended Action</h3>
            <p>{alert.recommendedAction}</p>
          </div>
        </>
      )}

      <button
        className={`prioritise-button ${isPrioritised ? "is-prioritised" : ""}`}
        onClick={onTogglePrioritised}
      >
        {isPrioritised ? "Unprioritise" : "Prioritise"}
      </button>
    </aside>
  );
}
