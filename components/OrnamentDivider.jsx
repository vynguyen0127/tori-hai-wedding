/**
 * OrnamentDivider
 * A botanical SVG divider with leaf sprigs flanking a centre diamond.
 * Used on the home hero between the couple's names and the wedding date.
 */
export default function OrnamentDivider({ className = '' }) {
  const blue = '#7db5d4';
  return (
    <svg
      className={className}
      viewBox="0 0 280 28"
      width="280"
      height="28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* ── Horizontal rules ─────────────────────────────────────────────── */}
      <line x1="0"   y1="14" x2="123" y2="14" stroke={blue} strokeWidth="0.7" opacity="0.55" />
      <line x1="157" y1="14" x2="280" y2="14" stroke={blue} strokeWidth="0.7" opacity="0.55" />

      {/* ── Centre diamond ────────────────────────────────────────────────── */}
      <path d="M140 5 L149 14 L140 23 L131 14 Z" fill={blue} />

      {/* ── Left leaf pair 1 (≈x 108) ────────────────────────────────────── */}
      <path d="M112 14 C109 8 101 6 98 9 C102 7 109 11 112 14Z" fill={blue} opacity="0.9" />
      <path d="M112 14 C109 20 101 22 98 19 C102 21 109 17 112 14Z" fill={blue} opacity="0.9" />

      {/* ── Left leaf pair 2 (≈x 80) ─────────────────────────────────────── */}
      <path d="M84 14 C81 8 73 6 70 9 C74 7 81 11 84 14Z" fill={blue} opacity="0.65" />
      <path d="M84 14 C81 20 73 22 70 19 C74 21 81 17 84 14Z" fill={blue} opacity="0.65" />

      {/* ── Left accent dots ─────────────────────────────────────────────── */}
      <circle cx="52" cy="14" r="1.8" fill={blue} opacity="0.38" />
      <circle cx="30" cy="14" r="1.1" fill={blue} opacity="0.22" />

      {/* ── Right leaf pair 1 (≈x 168) ───────────────────────────────────── */}
      <path d="M168 14 C171 8 179 6 182 9 C178 7 171 11 168 14Z" fill={blue} opacity="0.9" />
      <path d="M168 14 C171 20 179 22 182 19 C178 21 171 17 168 14Z" fill={blue} opacity="0.9" />

      {/* ── Right leaf pair 2 (≈x 196) ───────────────────────────────────── */}
      <path d="M196 14 C199 8 207 6 210 9 C206 7 199 11 196 14Z" fill={blue} opacity="0.65" />
      <path d="M196 14 C199 20 207 22 210 19 C206 21 199 17 196 14Z" fill={blue} opacity="0.65" />

      {/* ── Right accent dots ─────────────────────────────────────────────── */}
      <circle cx="228" cy="14" r="1.8" fill={blue} opacity="0.38" />
      <circle cx="250" cy="14" r="1.1" fill={blue} opacity="0.22" />
    </svg>
  );
}
