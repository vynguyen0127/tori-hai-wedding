/**
 * PageOrnament
 * Smaller botanical SVG ornament used below headings on interior pages.
 */
export default function PageOrnament({ className = '' }) {
  const blue = '#7db5d4';
  return (
    <svg
      className={className}
      viewBox="0 0 180 22"
      width="180"
      height="22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* ── Horizontal rules ─────────────────────────────────────────────── */}
      <line x1="0"   y1="11" x2="81"  y2="11" stroke={blue} strokeWidth="0.7" opacity="0.55" />
      <line x1="99"  y1="11" x2="180" y2="11" stroke={blue} strokeWidth="0.7" opacity="0.55" />

      {/* ── Centre diamond ────────────────────────────────────────────────── */}
      <path d="M90 3 L97 11 L90 19 L83 11 Z" fill={blue} />

      {/* ── Left leaf pair ───────────────────────────────────────────────── */}
      <path d="M68 11 C65 6 58 4 56 7 C59 5 66 9 68 11Z" fill={blue} opacity="0.85" />
      <path d="M68 11 C65 16 58 18 56 15 C59 17 66 13 68 11Z" fill={blue} opacity="0.85" />

      {/* ── Right leaf pair ──────────────────────────────────────────────── */}
      <path d="M112 11 C115 6 122 4 124 7 C121 5 114 9 112 11Z" fill={blue} opacity="0.85" />
      <path d="M112 11 C115 16 122 18 124 15 C121 17 114 13 112 11Z" fill={blue} opacity="0.85" />

      {/* ── Accent dots ──────────────────────────────────────────────────── */}
      <circle cx="38" cy="11" r="1.4" fill={blue} opacity="0.35" />
      <circle cx="142" cy="11" r="1.4" fill={blue} opacity="0.35" />
    </svg>
  );
}
