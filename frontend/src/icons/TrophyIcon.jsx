export default function TrophyIcon({ className = '', size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="8 21 12 21 16 21" />
      <line x1="12" y1="17" x2="12" y2="21" />
      <path d="M7 4h10v8a5 5 0 01-10 0V4z" />
      <path d="M7 8H3a2 2 0 000 4 5 5 0 004 4.9M17 8h4a2 2 0 010 4 5 5 0 01-4 4.9" />
    </svg>
  );
}
