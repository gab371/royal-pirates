import type { PlayedCard } from "./types.ts";
import { getLeadSuit } from "./suitFollow.ts";

export interface TrickResult {
  winnerId: string;
  winnerCard: PlayedCard;
  capturedBonus: number;
}

export function resolveTrickWinner(
  playedCards: PlayedCard[],
  enableFourteenBonus = false,
): TrickResult {
  if (playedCards.length === 0) {
    throw new Error("Cannot resolve empty trick");
  }

  const effectiveCards = playedCards.map((pc) => {
    let type = pc.card.special;
    if (type === "tigress") {
      type = pc.tigressChoice || "escape";
    }
    return {
      playedCard: pc,
      type,
      suit: pc.card.suit,
      rank: pc.card.rank,
    };
  });

  const hasMermaid = effectiveCards.some((c) => c.type === "mermaid");
  const hasSkullKing = effectiveCards.some((c) => c.type === "skullKing");
  const pirates = effectiveCards.filter((c) => c.type === "pirate");
  const mermaids = effectiveCards.filter((c) => c.type === "mermaid");

  let winnerItem: (typeof effectiveCards)[0];
  let capturedBonus = 0;

  // Case 1: Mermaid AND Skull King present -> Mermaid wins!
  if (hasMermaid && hasSkullKing) {
    winnerItem = mermaids[0]; // First mermaid played wins
    capturedBonus += 40; // +40 for capturing Skull King
  }
  // Case 2: Skull King present (no Mermaid) -> Skull King wins!
  else if (hasSkullKing) {
    winnerItem = effectiveCards.find((c) => c.type === "skullKing")!;
    capturedBonus += pirates.length * 30; // +30 per Pirate captured
  }
  // Case 3: Pirates present (no Skull King) -> First Pirate wins!
  else if (pirates.length > 0) {
    winnerItem = pirates[0];
  }
  // Case 4: Mermaids present (no Skull King, no Pirates) -> First Mermaid wins!
  else if (mermaids.length > 0) {
    winnerItem = mermaids[0];
  }
  // Case 5: Black suit (Atout) present -> Highest Black rank wins!
  else {
    const blackCards = effectiveCards.filter((c) => c.suit === "black" && c.rank);
    if (blackCards.length > 0) {
      blackCards.sort((a, b) => b.rank! - a.rank!);
      winnerItem = blackCards[0];
    } else {
      // Case 6: Lead suit cards present -> Highest Lead suit rank wins!
      const leadSuit = getLeadSuit(playedCards);
      const leadCards = leadSuit
        ? effectiveCards.filter((c) => c.suit === leadSuit && c.rank)
        : [];

      if (leadCards.length > 0) {
        leadCards.sort((a, b) => b.rank! - a.rank!);
        winnerItem = leadCards[0];
      } else {
        // Case 7: All Escapes or off-suit without trump -> First card played wins!
        winnerItem = effectiveCards[0];
      }
    }
  }

  // Hook for bonus 14s if enabled in config
  if (enableFourteenBonus) {
    const fourteenCount = effectiveCards.filter((c) => c.rank === 14).length;
    capturedBonus += fourteenCount * 10;
  }

  return {
    winnerId: winnerItem.playedCard.playerId,
    winnerCard: winnerItem.playedCard,
    capturedBonus,
  };
}
