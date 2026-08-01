import type { Card } from "../../core/types.ts";
import { SPECIAL, SUIT } from "./pirateCardTheme.ts";
import { SpecialGlyph, SuitMark } from "./pirateCardMarks.tsx";

interface PirateCardFaceProps {
  card: Card;
  tigressChoice?: "escape" | "pirate";
  className?: string;
}

function CardBack({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 240 360" className={`pirate-card-svg ${className}`} aria-hidden>
      <rect x="3" y="3" width="234" height="354" rx="16" fill="#1A120C" />
      <rect x="14" y="14" width="212" height="332" rx="12" fill="#0C1828" stroke="#C9A227" strokeWidth="3" />
      <rect
        x="28"
        y="28"
        width="184"
        height="304"
        rx="8"
        fill="none"
        stroke="#8B6914"
        strokeWidth="1.5"
        strokeDasharray="5 6"
        opacity="0.75"
      />
      <g transform="translate(120 155)">
        <ellipse cx="0" cy="0" rx="38" ry="34" fill="#C9A227" />
        <circle cx="-12" cy="-4" r="7" fill="#0C1828" />
        <circle cx="12" cy="-4" r="7" fill="#0C1828" />
        <path
          d="M-30 44 L30 44 M-22 58 L22 30 M-22 30 L22 58"
          stroke="#C9A227"
          strokeWidth="4.5"
          fill="none"
        />
      </g>
      <text
        x="120"
        y="260"
        textAnchor="middle"
        fill="#C9A227"
        fontFamily="Cinzel, Georgia, serif"
        fontWeight="900"
        fontSize="22"
        letterSpacing="4"
      >
        ROYAL
      </text>
      <text
        x="120"
        y="290"
        textAnchor="middle"
        fill="#E8D5A8"
        fontFamily="Cinzel, Georgia, serif"
        fontWeight="700"
        fontSize="16"
        letterSpacing="5"
      >
        PIRATES
      </text>
    </svg>
  );
}

/** Locked to after-or.png placement — do not nudge. */
function CornerIndex({
  rank,
  label,
  fill,
  flip,
}: {
  rank: string;
  label: string;
  fill: string;
  flip?: boolean;
}) {
  return (
    <g transform={flip ? "translate(210 322) rotate(180)" : "translate(30 48)"}>
      <text
        x={0}
        y={0}
        fill={fill}
        fontFamily="Cinzel, Georgia, serif"
        fontWeight="900"
        fontSize="32"
      >
        {rank}
      </text>
      <text
        x={0}
        y={18}
        fill={fill}
        fontFamily="Cinzel, Georgia, serif"
        fontWeight="700"
        fontSize={label.length > 4 ? 10 : 12}
        letterSpacing="1"
        opacity="0.92"
      >
        {label}
      </text>
    </g>
  );
}

function WhiteDisc() {
  return (
    <>
      <circle cx="120" cy="180" r="70" fill="#F7F0E4" />
      <circle cx="120" cy="180" r="70" fill="none" stroke="#12100C" strokeWidth="2.5" opacity="0.18" />
    </>
  );
}

function SuitCard({ card, className }: { card: Card; className: string }) {
  const suit = card.suit ?? "black";
  const meta = SUIT[suit];
  const rank = String(card.rank ?? "");
  const gid = `suit-${card.id}`;
  const medInk = meta.panelDark;

  return (
    <svg viewBox="0 0 240 360" className={`pirate-card-svg ${className}`} aria-hidden>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={meta.panel} />
          <stop offset="100%" stopColor={meta.panelDark} />
        </linearGradient>
      </defs>
      <rect x="3" y="3" width="234" height="354" rx="16" fill="#C9A227" />
      <rect x="10" y="10" width="220" height="340" rx="13" fill={`url(#${gid})`} />
      <WhiteDisc />
      {/* Mark drawn after disc so it can overflow; black outline keeps it readable */}
      <SuitMark mark={meta.mark} color={medInk} />
      <CornerIndex rank={rank} label={meta.label} fill={meta.ink} />
      <CornerIndex rank={rank} label={meta.label} fill={meta.ink} flip />
    </svg>
  );
}

function SpecialCard({
  card,
  tigressChoice,
  className,
}: {
  card: Card;
  tigressChoice?: "escape" | "pirate";
  className: string;
}) {
  const special = card.special!;
  const meta = SPECIAL[special];
  let title = meta.title;
  if (special === "tigress" && tigressChoice === "pirate") title = "TIG. PIRATE";
  if (special === "tigress" && tigressChoice === "escape") title = "TIG. FUITE";
  const gid = `sp-${card.id}`;

  return (
    <svg viewBox="0 0 240 360" className={`pirate-card-svg ${className}`} aria-hidden>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0.2" y2="1">
          <stop offset="0%" stopColor={meta.field} />
          <stop offset="100%" stopColor={meta.fieldDark} />
        </linearGradient>
      </defs>
      <rect x="3" y="3" width="234" height="354" rx="16" fill="#C9A227" />
      <rect x="10" y="10" width="220" height="340" rx="13" fill={`url(#${gid})`} />
      <rect
        x="20"
        y="20"
        width="200"
        height="320"
        rx="10"
        fill="none"
        stroke={meta.foil}
        strokeWidth="1.75"
        opacity="0.45"
      />
      <text
        x="120"
        y="48"
        textAnchor="middle"
        fill={meta.foil}
        fontFamily="Cinzel, Georgia, serif"
        fontWeight="800"
        fontSize="13"
        letterSpacing="3"
      >
        SPÉCIAL
      </text>
      <SpecialGlyph glyph={meta.glyph} foil={meta.foil} ink={meta.ink} />
      <rect x="28" y="286" width="184" height="44" rx="8" fill={meta.foil} stroke="#12100C" strokeWidth="2" />
      <text
        x="120"
        y="314"
        textAnchor="middle"
        fill={meta.fieldDark}
        fontFamily="Cinzel, Georgia, serif"
        fontWeight="900"
        fontSize={title.length > 12 ? 12 : 16}
        letterSpacing="1"
      >
        {title}
      </text>
    </svg>
  );
}

export function PirateCardFace({
  card,
  tigressChoice,
  className = "",
}: PirateCardFaceProps) {
  if (card.isMasked) return <CardBack className={className} />;
  if (card.special) {
    return <SpecialCard card={card} tigressChoice={tigressChoice} className={className} />;
  }
  return <SuitCard card={card} className={className} />;
}
