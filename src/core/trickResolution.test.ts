import { describe, it, expect } from "vitest";
import { resolveTrickWinner } from "./trickResolution.ts";
import { getLegalCards, getLeadSuit } from "./suitFollow.ts";
import type { PlayedCard, Card } from "./types.ts";

describe("suitFollow", () => {
  it("determines lead suit correctly", () => {
    const trick1: PlayedCard[] = [
      { playerId: "p1", card: { id: "escape-1", special: "escape" } },
      { playerId: "p2", card: { id: "yellow-5", suit: "yellow", rank: 5 } },
    ];
    expect(getLeadSuit(trick1)).toBe("yellow");

    const trick2: PlayedCard[] = [
      { playerId: "p1", card: { id: "escape-1", special: "escape" } },
      { playerId: "p2", card: { id: "pirate-1", special: "pirate" } },
    ];
    expect(getLeadSuit(trick2)).toBeNull();
  });

  it("restricts non-matching suited cards when player has lead suit", () => {
    const hand: Card[] = [
      { id: "yellow-10", suit: "yellow", rank: 10 },
      { id: "green-5", suit: "green", rank: 5 },
      { id: "black-2", suit: "black", rank: 2 },
      { id: "escape-1", special: "escape" },
    ];

    const trickCards: PlayedCard[] = [
      { playerId: "p1", card: { id: "yellow-3", suit: "yellow", rank: 3 } },
    ];

    const legal = getLegalCards(hand, trickCards);
    const legalIds = legal.map((c) => c.id);

    expect(legalIds).toContain("yellow-10");
    expect(legalIds).toContain("black-2");
    expect(legalIds).toContain("escape-1");
    expect(legalIds).not.toContain("green-5");
  });
});

describe("trickResolution", () => {
  it("resolves basic suit ranking", () => {
    const trick: PlayedCard[] = [
      { playerId: "p1", card: { id: "yellow-3", suit: "yellow", rank: 3 } },
      { playerId: "p2", card: { id: "yellow-10", suit: "yellow", rank: 10 } },
      { playerId: "p3", card: { id: "yellow-7", suit: "yellow", rank: 7 } },
    ];
    const res = resolveTrickWinner(trick);
    expect(res.winnerId).toBe("p2");
    expect(res.capturedBonus).toBe(0);
  });

  it("resolves black atout trumping normal suit", () => {
    const trick: PlayedCard[] = [
      { playerId: "p1", card: { id: "yellow-12", suit: "yellow", rank: 12 } },
      { playerId: "p2", card: { id: "black-2", suit: "black", rank: 2 } },
      { playerId: "p3", card: { id: "blue-13", suit: "blue", rank: 13 } },
    ];
    const res = resolveTrickWinner(trick);
    expect(res.winnerId).toBe("p2");
  });

  it("resolves pirate beating atout and suits", () => {
    const trick: PlayedCard[] = [
      { playerId: "p1", card: { id: "black-13", suit: "black", rank: 13 } },
      { playerId: "p2", card: { id: "pirate-1", special: "pirate" } },
      { playerId: "p3", card: { id: "yellow-10", suit: "yellow", rank: 10 } },
    ];
    const res = resolveTrickWinner(trick);
    expect(res.winnerId).toBe("p2");
  });

  it("resolves Skull King beating Pirates and awards +30 per Pirate", () => {
    const trick: PlayedCard[] = [
      { playerId: "p1", card: { id: "pirate-1", special: "pirate" } },
      { playerId: "p2", card: { id: "pirate-2", special: "pirate" } },
      { playerId: "p3", card: { id: "skull-king", special: "skullKing" } },
    ];
    const res = resolveTrickWinner(trick);
    expect(res.winnerId).toBe("p3");
    expect(res.capturedBonus).toBe(60); // 2 Pirates captured
  });

  it("resolves Mermaid beating Skull King and awards +40 for SK capture", () => {
    const trick: PlayedCard[] = [
      { playerId: "p1", card: { id: "pirate-1", special: "pirate" } },
      { playerId: "p2", card: { id: "skull-king", special: "skullKing" } },
      { playerId: "p3", card: { id: "mermaid-1", special: "mermaid" } },
    ];
    const res = resolveTrickWinner(trick);
    expect(res.winnerId).toBe("p3");
    expect(res.capturedBonus).toBe(40);
  });

  it("resolves Pirate beating Mermaid when no Skull King is present", () => {
    const trick: PlayedCard[] = [
      { playerId: "p1", card: { id: "mermaid-1", special: "mermaid" } },
      { playerId: "p2", card: { id: "pirate-1", special: "pirate" } },
    ];
    const res = resolveTrickWinner(trick);
    expect(res.winnerId).toBe("p2");
  });

  it("resolves Tigress choice correctly (as escape vs as pirate)", () => {
    const trickEscape: PlayedCard[] = [
      { playerId: "p1", card: { id: "tigress", special: "tigress" }, tigressChoice: "escape" },
      { playerId: "p2", card: { id: "yellow-2", suit: "yellow", rank: 2 } },
    ];
    expect(resolveTrickWinner(trickEscape).winnerId).toBe("p2");

    const trickPirate: PlayedCard[] = [
      { playerId: "p1", card: { id: "tigress", special: "tigress" }, tigressChoice: "pirate" },
      { playerId: "p2", card: { id: "black-13", suit: "black", rank: 13 } },
    ];
    expect(resolveTrickWinner(trickPirate).winnerId).toBe("p1");
  });

  it("resolves all Escapes to the first card played", () => {
    const trick: PlayedCard[] = [
      { playerId: "p1", card: { id: "escape-1", special: "escape" } },
      { playerId: "p2", card: { id: "escape-2", special: "escape" } },
    ];
    expect(resolveTrickWinner(trick).winnerId).toBe("p1");
  });
});
