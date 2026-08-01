import type { Card, PlayedCard, Suit } from "./types.ts";

/**
 * Returns the lead suit of the trick.
 * The lead suit is determined by the first suited card (yellow, green, blue, black) played.
 * Special cards (escape, pirate, mermaid, skullKing, tigress) do NOT establish a lead suit.
 */
export function getLeadSuit(trickCards: PlayedCard[]): Suit | null {
  for (const pc of trickCards) {
    if (pc.card.suit) {
      return pc.card.suit;
    }
  }
  return null;
}

/**
 * Returns the array of legal cards from the player's hand given the current trick cards.
 */
export function getLegalCards(
  hand: Card[],
  trickCards: PlayedCard[],
  hintsEnabled = true,
): Card[] {
  if (!hintsEnabled || trickCards.length === 0) {
    return hand;
  }

  const leadSuit = getLeadSuit(trickCards);
  if (!leadSuit) {
    return hand;
  }

  const hasLeadSuitCard = hand.some((c) => c.suit === leadSuit);
  if (!hasLeadSuitCard) {
    return hand;
  }

  // If player has lead suit, they can play:
  // - Cards of leadSuit
  // - Black suit cards (atouts)
  // - Any special cards (escape, pirate, mermaid, skullKing, tigress)
  return hand.filter(
    (c) => Boolean(c.special) || c.suit === "black" || c.suit === leadSuit,
  );
}

export function isCardLegal(
  card: Card,
  hand: Card[],
  trickCards: PlayedCard[],
): boolean {
  const legal = getLegalCards(hand, trickCards, true);
  return legal.some((c) => c.id === card.id);
}
