import type { PlayedCard } from "./types.ts";
import { getLeadSuit } from "./suitFollow.ts";

export interface TrickResult {
  winnerId: string;
  winnerCard: PlayedCard;
  capturedBonus: number;
}

export interface TrickResult {
  winnerId: string;
  winnerCard: PlayedCard;
  capturedBonus: number;
  destroyedByKraken?: boolean;
  destroyedByWhale?: boolean;
  leadForNextTrickId?: string;
  alliancesFormed?: { player1Id: string; player2Id: string }[];
}

export function resolveTrickWinner(
  playedCards: PlayedCard[],
  enableFourteenBonus = false,
): TrickResult {
  if (playedCards.length === 0) {
    throw new Error("Cannot resolve empty trick");
  }

  const krakenIndex = playedCards.findIndex((pc) => pc.card.special === "kraken");
  const whaleIndex = playedCards.findIndex((pc) => pc.card.special === "whiteWhale");

  const hasKraken = krakenIndex !== -1;
  const hasWhale = whaleIndex !== -1;

  // Eaux Agitées: Both Kraken and White Whale played -> 2nd creature played wins battle!
  let activeCreature: "kraken" | "whiteWhale" | null = null;
  if (hasKraken && hasWhale) {
    activeCreature = krakenIndex > whaleIndex ? "kraken" : "whiteWhale";
  } else if (hasKraken) {
    activeCreature = "kraken";
  } else if (hasWhale) {
    activeCreature = "whiteWhale";
  }

  // 1. KRAKEN MODE: Trick is destroyed entirely!
  if (activeCreature === "kraken") {
    const krakenCard = playedCards[krakenIndex];
    // Determine virtual winner (who would win without kraken) for next lead
    const remainingWithoutKraken = playedCards.filter(
      (pc) => pc.card.special !== "kraken",
    );
    const virtualRes =
      remainingWithoutKraken.length > 0
        ? resolveTrickWinner(remainingWithoutKraken, enableFourteenBonus)
        : null;

    const leadForNextTrickId =
      virtualRes?.winnerId || krakenCard.playerId;

    return {
      winnerId: "",
      winnerCard: krakenCard,
      capturedBonus: 0,
      destroyedByKraken: true,
      leadForNextTrickId,
    };
  }

  // 2. WHITE WHALE MODE: Special cards destroyed, numbered cards pale to raw ranks!
  if (activeCreature === "whiteWhale") {
    const whaleCard = playedCards[whaleIndex];
    const numberedCards = playedCards.filter(
      (pc) => !pc.card.special && pc.card.rank !== undefined,
    );

    if (numberedCards.length === 0) {
      // Only special cards in trick -> trick is discarded like kraken!
      return {
        winnerId: "",
        winnerCard: whaleCard,
        capturedBonus: 0,
        destroyedByWhale: true,
        leadForNextTrickId: whaleCard.playerId,
      };
    }

    // Highest rank wins, tie goes to first played
    let best = numberedCards[0];
    for (let i = 1; i < numberedCards.length; i++) {
      if (numberedCards[i].card.rank! > best.card.rank!) {
        best = numberedCards[i];
      }
    }

    return {
      winnerId: best.playerId,
      winnerCard: best,
      capturedBonus: 0,
      destroyedByWhale: false,
    };
  }

  // 3. NORMAL SKULL KING TRICK RESOLUTION
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

  // Special rule: Loot leads, and all following are Escapes -> Loot wins!
  const firstCard = effectiveCards[0];
  if (
    firstCard.type === "loot" &&
    effectiveCards.slice(1).every((c) => c.type === "escape" || c.type === "loot")
  ) {
    return {
      winnerId: firstCard.playedCard.playerId,
      winnerCard: firstCard.playedCard,
      capturedBonus: 0,
    };
  }

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
        // Case 7: All Escapes / Loots or off-suit without trump -> First card played wins!
        winnerItem = effectiveCards[0];
      }
    }
  }

  // Hook for bonus 14s if enabled in config
  if (enableFourteenBonus) {
    const fourteenCount = effectiveCards.filter((c) => c.rank === 14).length;
    capturedBonus += fourteenCount * 10;
  }

  // Detect Loot Alliances
  const alliancesFormed: { player1Id: string; player2Id: string }[] = [];
  effectiveCards.forEach((c) => {
    if (c.type === "loot" && c.playedCard.playerId !== winnerItem.playedCard.playerId) {
      alliancesFormed.push({
        player1Id: c.playedCard.playerId,
        player2Id: winnerItem.playedCard.playerId,
      });
    }
  });

  return {
    winnerId: winnerItem.playedCard.playerId,
    winnerCard: winnerItem.playedCard,
    capturedBonus,
    alliancesFormed,
  };
}
