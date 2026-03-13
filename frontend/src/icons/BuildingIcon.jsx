export default function BuildingIcon({ className = '', size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="3" y1="22" x2="21" y2="22" />
      <polyline points="3 22 3 7 13 2 21 7 21 22" />
      <line x1="13" y1="2" x2="13" y2="22" />
      <rect x="5" y="11" width="3" height="4" />
      <rect x="15" y="11" width="3" height="4" />
      <rect x="10" y="15" width="6" height="7" />
      <path d="M5 7h2M17 7h2" />
    </svg>
  );
}
