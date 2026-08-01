/** Central marks — thick black outline so overflow past the white disc stays readable. */

import { MermaidGlyph } from "./glyphs/MermaidGlyph.tsx";
import { PirateGlyph } from "./glyphs/PirateGlyph.tsx";

const OUTLINE = "#0C0A08";

function outlinedFill(extra: Record<string, string | number> = {}) {
  return {
    stroke: OUTLINE,
    strokeWidth: 4,
    strokeLinejoin: "round" as const,
    strokeLinecap: "round" as const,
    paintOrder: "stroke fill" as const,
    ...extra,
  };
}

export function SuitMark({ mark, color }: { mark: string; color: string }) {
  if (mark === "doubloon") {
    return (
      <g transform="translate(120 180) scale(1.22)">
        <circle r="52" fill={color} {...outlinedFill({ strokeWidth: 5 })} />
        <circle r="40" fill="#F7F0E4" stroke={OUTLINE} strokeWidth="3.5" />
        <circle r="32" fill="none" stroke={color} strokeWidth="5" />
        <text
          y="16"
          textAnchor="middle"
          fill={color}
          stroke={OUTLINE}
          strokeWidth="3"
          paintOrder="stroke fill"
          fontFamily="Cinzel, Georgia, serif"
          fontWeight="900"
          fontSize="44"
        >
          $
        </text>
      </g>
    );
  }

  if (mark === "isle") {
    return (
      <g transform="translate(120 198) scale(1.1)">
        <ellipse cx="0" cy="52" rx="82" ry="16" fill={color} opacity="0.28" />
        <ellipse cx="0" cy="30" rx="64" ry="28" fill={color} {...outlinedFill()} />
        <path
          d="M-4 14 C0 -8 2 -48 4 -86"
          fill="none"
          stroke={OUTLINE}
          strokeWidth="16"
          strokeLinecap="round"
        />
        <path
          d="M-4 14 C0 -8 2 -48 4 -86"
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
        />
        <g fill={color} {...outlinedFill()}>
          <path d="M4 -86 C-24 -98 -58 -86 -70 -60 C-44 -74 -16 -78 4 -74 Z" />
          <path d="M4 -86 C-14 -112 -44 -118 -64 -104 C-36 -106 -8 -96 4 -86 Z" />
          <path d="M4 -86 C24 -116 56 -116 74 -98 C48 -104 18 -100 4 -86 Z" />
          <path d="M4 -86 C36 -96 68 -82 78 -54 C54 -72 24 -78 4 -74 Z" />
          <path d="M4 -86 C40 -68 64 -38 66 -12 C44 -36 20 -60 4 -70 Z" />
        </g>
      </g>
    );
  }

  if (mark === "wave") {
    // Symmetric arcs — keep within / just past the white disc (no right overflow).
    return (
      <g transform="translate(120 180) scale(1.02)" fill="none" strokeLinecap="round">
        {[
          { d: "M-52 -22 Q-18 -52 16 -22 T52 -22", o: 10, c: 6.5 },
          { d: "M-52 10 Q-18 -20 16 10 T52 10", o: 9.5, c: 6 },
          { d: "M-48 42 Q-14 14 20 42 T48 42", o: 9, c: 5.5 },
        ].map((w) => (
          <g key={w.d}>
            <path d={w.d} stroke={OUTLINE} strokeWidth={w.o} />
            <path d={w.d} stroke={color} strokeWidth={w.c} />
          </g>
        ))}
      </g>
    );
  }

  return (
    <g transform="translate(120 178) scale(1.08)" fill={color} {...outlinedFill()}>
      <ellipse cx="0" cy="-16" rx="42" ry="38" />
      <path d="M-20 14 Q-16 36 -6 40 L6 40 Q16 36 20 14 Z" />
      <circle cx="-14" cy="-18" r="10" fill="#F7F0E4" stroke={OUTLINE} strokeWidth="2.5" />
      <circle cx="14" cy="-18" r="10" fill="#F7F0E4" stroke={OUTLINE} strokeWidth="2.5" />
      <path d="M-12 28 h8 M0 28 h8 M12 28 h8" stroke="#F7F0E4" strokeWidth="3.5" fill="none" />
    </g>
  );
}

export function SpecialGlyph({
  glyph,
  foil,
  ink,
}: {
  glyph: string;
  foil: string;
  ink: string;
}) {
  if (glyph === "jolly") return <PirateGlyph />;
  if (glyph === "mermaid") return <MermaidGlyph />;

  if (glyph === "crown") {
    return (
      <g transform="translate(120 168) scale(1.1)">
        <path
          d="M-56 34 L-48 -8 L-28 18 L0 -42 L28 18 L48 -8 L56 34 Z"
          fill={foil}
          {...outlinedFill()}
        />
        <circle cx="0" cy="-42" r="8" fill={ink} stroke={OUTLINE} strokeWidth="2.5" />
        <circle cx="-48" cy="-4" r="6" fill={ink} stroke={OUTLINE} strokeWidth="2" />
        <circle cx="48" cy="-4" r="6" fill={ink} stroke={OUTLINE} strokeWidth="2" />
        <rect x="-56" y="34" width="112" height="18" rx="4" fill={ink} {...outlinedFill()} />
        <rect x="-48" y="38" width="96" height="8" rx="2" fill={foil} />
      </g>
    );
  }

  if (glyph === "paw") {
    return (
      <g transform="translate(120 168) scale(1.12)" fill={foil} {...outlinedFill()}>
        <ellipse cx="0" cy="22" rx="30" ry="26" />
        <circle cx="-34" cy="-8" r="14" />
        <circle cx="34" cy="-8" r="14" />
        <circle cx="-12" cy="-32" r="13" />
        <circle cx="12" cy="-32" r="13" />
      </g>
    );
  }

  return (
    <g transform="translate(120 165) scale(1.08)">
      <path d="M-36 -74 V78" stroke={OUTLINE} strokeWidth="14" strokeLinecap="round" />
      <path d="M-36 -74 V78" stroke={ink} strokeWidth="8" strokeLinecap="round" />
      <path d="M-28 -68 L62 -26 L-28 18 Z" fill={foil} {...outlinedFill()} />
    </g>
  );
}
