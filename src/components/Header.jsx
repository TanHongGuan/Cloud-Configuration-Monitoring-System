export default function Header({ onHomeClick }) {
  return (
    <header className="top-header">
      <button className="brand-button" onClick={onHomeClick} aria-label="Back to projects">
        <svg viewBox="0 0 24 24" aria-hidden="true" className="home-icon">
          <path d="M4 11.5 12 5l8 6.5V20a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1v-8.5Z" />
        </svg>
        <span>Cloud Configuration Monitoring</span>
      </button>
    </header>
  );
}
