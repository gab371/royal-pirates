/**
 * Distinct pirate composition (sail + tricorne + eyepatch + anchor).
 * Canonical SVG: `src/assets/glyphs/pirate-jolly.svg`
 */
export function PirateGlyph() {
  return (
    <g transform="translate(120 150)">
      {/* Tattered black sail */}
      <path
        d="M-78 -90
           L72 -78
           L78 20
           C60 8 40 28 20 18
           C0 8 -20 30 -40 16
           C-58 4 -70 22 -78 10 Z"
        fill="#1A120C"
        stroke="#0C0A08"
        strokeWidth="3"
      />
      <path d="M-70 -70 L60 -60 L64 -20 L-66 -28 Z" fill="#2A1A10" opacity="0.55" />

      {/* Mast + rope */}
      <path d="M0 -95 V78" stroke="#5C3A1E" strokeWidth="7" strokeLinecap="round" />
      <path d="M0 -95 V78" stroke="#C9A227" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
      <path
        d="M4 -70 C28 -60 36 -40 28 -20 C20 0 8 10 4 18"
        fill="none"
        stroke="#D4A574"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Crossbones */}
      <g strokeLinecap="round">
        <path d="M-55 55 L55 20" stroke="#F5E6C8" strokeWidth="12" />
        <path d="M-55 20 L55 55" stroke="#F5E6C8" strokeWidth="12" />
        <path d="M-55 55 L55 20" stroke="#0C0A08" strokeWidth="3" fill="none" />
        <path d="M-55 20 L55 55" stroke="#0C0A08" strokeWidth="3" fill="none" />
        <circle cx="-55" cy="55" r="10" fill="#F5E6C8" stroke="#0C0A08" strokeWidth="3" />
        <circle cx="55" cy="20" r="10" fill="#F5E6C8" stroke="#0C0A08" strokeWidth="3" />
        <circle cx="-55" cy="20" r="10" fill="#F5E6C8" stroke="#0C0A08" strokeWidth="3" />
        <circle cx="55" cy="55" r="10" fill="#F5E6C8" stroke="#0C0A08" strokeWidth="3" />
      </g>

      {/* Skull */}
      <ellipse cx="0" cy="-22" rx="40" ry="38" fill="#F5E6C8" stroke="#0C0A08" strokeWidth="3.5" />
      <path
        d="M-20 12 Q-16 36 -6 40 L6 40 Q16 36 20 12 Z"
        fill="#F5E6C8"
        stroke="#0C0A08"
        strokeWidth="3"
      />

      {/* Tricorne */}
      <path
        d="M-48 -40
           C-40 -72 -10 -82 0 -84
           C10 -82 40 -72 48 -40
           C30 -52 10 -50 0 -48
           C-10 -50 -30 -52 -48 -40 Z"
        fill="#1A120C"
        stroke="#0C0A08"
        strokeWidth="3"
      />
      <path
        d="M-44 -42 C-30 -58 30 -58 44 -42"
        fill="none"
        stroke="#C9A227"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M30 -70 C48 -95 62 -88 58 -68 C52 -78 40 -76 30 -70 Z"
        fill="#B91C1C"
        stroke="#0C0A08"
        strokeWidth="2"
      />

      {/* Eye + eyepatch */}
      <circle cx="-13" cy="-24" r="10" fill="#1A120C" stroke="#0C0A08" strokeWidth="2" />
      <circle cx="-13" cy="-24" r="4" fill="#F59E0B" />
      <path d="M2 -36 L28 -18 L24 -12 L-2 -30 Z" fill="#1A120C" stroke="#0C0A08" strokeWidth="2" />
      <path d="M-36 -30 L30 -8" stroke="#0C0A08" strokeWidth="3.5" strokeLinecap="round" />

      <path d="M-5 -10 L5 -10 L0 4 Z" fill="#1A120C" />
      <path
        d="M-12 20 h6 M-3 20 h6 M6 20 h6"
        fill="none"
        stroke="#1A120C"
        strokeWidth="3.5"
        strokeLinecap="round"
      />

      {/* Anchor */}
      <g transform="translate(0 58)">
        <path d="M0 -8 V14" stroke="#C9A227" strokeWidth="4" strokeLinecap="round" />
        <circle cx="0" cy="-10" r="5" fill="none" stroke="#C9A227" strokeWidth="3" />
        <path
          d="M-14 10 C-8 20 8 20 14 10"
          fill="none"
          stroke="#C9A227"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path d="M-16 8 h6 M10 8 h6" stroke="#C9A227" strokeWidth="3.5" strokeLinecap="round" />
      </g>
    </g>
  );
}
