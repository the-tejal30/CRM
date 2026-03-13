export default function AIIcon({ className = '', size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 3l1.5 4.5H18l-3.75 2.75 1.5 4.5L12 12l-3.75 2.75 1.5-4.5L6 7.5h4.5L12 3z" />
      <path d="M5 17.5l.5 1.5 1.5.5-1.5.5-.5 1.5-.5-1.5L3 19l1.5-.5.5-1.5z" />
      <path d="M19 4l.4 1.1 1.1.4-1.1.4L19 7l-.4-1.1L17.5 5.5l1.1-.4L19 4z" />
    </svg>
  );
}
