import type { Card, Suit } from "./types.ts";

export const DEFAULT_SUITS: Suit[] = ["yellow", "green", "blue", "black"];

export function createDeck(): Card[] {
  const cards: Card[] = [];

  // 1. Suited cards: 4 suits x 13 ranks (1-13) = 52 cards
  for (const suit of DEFAULT_SUITS) {
    for (let rank = 1; rank <= 13; rank++) {
      cards.push({
        id: `${suit}-${rank}`,
        suit,
        rank,
      });
    }
  }

  // 2. Special cards: 5 Escapes
  for (let i = 1; i <= 5; i++) {
    cards.push({
      id: `escape-${i}`,
      special: "escape",
    });
  }

  // 3. Special cards: 5 Pirates
  for (let i = 1; i <= 5; i++) {
    cards.push({
      id: `pirate-${i}`,
      special: "pirate",
    });
  }

  // 4. Special cards: 2 Mermaids
  for (let i = 1; i <= 2; i++) {
    cards.push({
      id: `mermaid-${i}`,
      special: "mermaid",
    });
  }

  // 5. Special cards: 1 Skull King
  cards.push({
    id: "skull-king",
    special: "skullKing",
  });

  // 6. Special cards: 1 Tigress
  cards.push({
    id: "tigress",
    special: "tigress",
  });

  return cards;
}

export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function getCardName(card: Card, tigressChoice?: "escape" | "pirate"): string {
  if (card.isMasked) return "Card Masked 🏴‍☠️";
  if (card.special === "escape") return "Fuite";
  if (card.special === "pirate") return "Pirate";
  if (card.special === "mermaid") return "Sirène";
  if (card.special === "skullKing") return "Roi des Crânes";
  if (card.special === "tigress") {
    if (tigressChoice === "pirate") return "Tigresse (Pirate)";
    if (tigressChoice === "escape") return "Tigresse (Fuite)";
    return "Tigresse";
  }

  const suitNames: Record<Suit, string> = {
    yellow: "Jaune",
    green: "Vert",
    blue: "Bleu",
    black: "Atout Noir",
  };

  return `${suitNames[card.suit!]} ${card.rank}`;
}

export function getSuitEmoji(card: Card): string {
  if (card.isMasked) return "🏴‍☠️";
  if (card.special === "escape") return "🏳️";
  if (card.special === "pirate") return "🏴‍☠️";
  if (card.special === "mermaid") return "🧜‍♀️";
  if (card.special === "skullKing") return "👑";
  if (card.special === "tigress") return "🐯";
  if (card.suit === "yellow") return "🟡";
  if (card.suit === "green") return "🟢";
  if (card.suit === "blue") return "🔵";
  if (card.suit === "black") return "🖤";
  return "❓";
}

export function getSuitColor(card: Card): string {
  if (card.isMasked) return "text-amber-500/80 bg-slate-900 border-amber-900/60";
  if (card.special === "escape") return "text-slate-300 bg-slate-900 border-slate-700";
  if (card.special === "pirate") return "text-amber-400 bg-amber-950/80 border-amber-500/80";
  if (card.special === "mermaid") return "text-cyan-300 bg-cyan-950/80 border-cyan-500/80";
  if (card.special === "skullKing") return "text-purple-300 bg-purple-950/90 border-purple-500/90 ring-2 ring-purple-500/50";
  if (card.special === "tigress") return "text-orange-400 bg-orange-950/80 border-orange-500/80";

  if (card.suit === "yellow") return "text-amber-300 bg-amber-950/60 border-amber-500/60";
  if (card.suit === "green") return "text-emerald-300 bg-emerald-950/60 border-emerald-500/60";
  if (card.suit === "blue") return "text-sky-300 bg-sky-950/60 border-sky-500/60";
  if (card.suit === "black") return "text-slate-100 bg-slate-900 border-slate-600 shadow-md";
  return "text-slate-300 bg-slate-900 border-slate-700";
}
