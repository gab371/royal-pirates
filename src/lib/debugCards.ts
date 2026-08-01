import type { Card, SpecialType, Suit } from "../core/types.ts";

let debugSeq = 0;
function uid(prefix: string): string {
  debugSeq += 1;
  return `debug-${prefix}-${Date.now()}-${debugSeq}`;
}

export function makeSuitCard(suit: Suit, rank = 7): Card {
  return { id: uid(`${suit}-${rank}`), suit, rank };
}

export function makeSpecialCard(special: SpecialType): Card {
  return { id: uid(special), special };
}

/** One of each suit + one of each special — handy visual QA set. */
export function buildAllTypesSample(): Card[] {
  const suits: Suit[] = ["yellow", "green", "blue", "black"];
  const specials: SpecialType[] = [
    "escape",
    "pirate",
    "mermaid",
    "skullKing",
    "tigress",
  ];
  return [
    ...suits.map((s) => makeSuitCard(s, 7)),
    ...specials.map((sp) => makeSpecialCard(sp)),
  ];
}

export const DEBUG_SUIT_BUTTONS: { suit: Suit; label: string }[] = [
  { suit: "yellow", label: "Or" },
  { suit: "green", label: "Île" },
  { suit: "blue", label: "Mer" },
  { suit: "black", label: "Atout" },
];

export const DEBUG_SPECIAL_BUTTONS: { special: SpecialType; label: string }[] = [
  { special: "escape", label: "Fuite" },
  { special: "pirate", label: "Pirate" },
  { special: "mermaid", label: "Sirène" },
  { special: "skullKing", label: "Roi" },
  { special: "tigress", label: "Tigresse" },
];
