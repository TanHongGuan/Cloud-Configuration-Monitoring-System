export default function AlertCard({ alert, onOpen }) {
  const severityClass = alert.severity.toLowerCase();

  return (
    <article className={`alert-card ${severityClass}`}>
      <h3>{alert.title}</h3>
      <button onClick={onOpen}>View more details &gt;&gt;</button>
    </article>
  );
}
