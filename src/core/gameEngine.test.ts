import { describe, expect, it } from "vitest";
import { PiratesGameEngine } from "./gameEngine.ts";
import { getCurrentActorId } from "./turnOrder.ts";
import { createDeck } from "./decks.ts";

describe("PiratesGameEngine", () => {
  it("builds a 70-card deck", () => {
    expect(createDeck()).toHaveLength(70);
  });

  it("rejects out-of-range bids and out-of-turn plays", () => {
    const engine = new PiratesGameEngine();
    engine.addPlayer("p1", "A", "🏴‍☠️", true);
    engine.addPlayer("p2", "B", "👑", false);
    expect(engine.startGame()).toBe(true);
    expect(engine.state.phase).toBe("BIDDING");

    expect(engine.submitBid("p1", 99)).toBe(false);
    expect(engine.submitBid("p1", 0)).toBe(true);
    expect(engine.submitBid("p1", 1)).toBe(false); // already bid
    expect(engine.submitBid("p2", 1)).toBe(true);
    expect(engine.state.phase).toBe("TRICK");

    const actor = getCurrentActorId(engine.state)!;
    const other = actor === "p1" ? "p2" : "p1";
    const otherCard = engine.state.players.find((p) => p.id === other)!.hand[0];
    expect(engine.playCard(other, otherCard.id).ok).toBe(false);

    const actorCard = engine.state.players.find((p) => p.id === actor)!.hand[0];
    if (actorCard.special === "tigress") {
      expect(engine.playCard(actor, actorCard.id).ok).toBe(false);
      expect(engine.playCard(actor, actorCard.id, "pirate").ok).toBe(true);
    } else {
      expect(engine.playCard(actor, actorCard.id).ok).toBe(true);
    }
  });

  it("remaps round references on reconnect", () => {
    const engine = new PiratesGameEngine();
    engine.addPlayer("old", "A", "🏴‍☠️", true);
    engine.addPlayer("p2", "B", "👑", false);
    engine.startGame();
    engine.submitBid("old", 0);
    engine.submitBid("p2", 0);

    const lead = engine.state.round!.currentTrick.leadPlayerId;
    if (lead === "old") {
      expect(engine.remapPlayerId("old", "new")).toBe(true);
      expect(engine.state.round!.currentTrick.leadPlayerId).toBe("new");
      expect(engine.state.round!.bidsSubmitted.new).toBe(0);
      expect(engine.state.players.some((p) => p.id === "new")).toBe(true);
    } else {
      expect(engine.remapPlayerId("p2", "new2")).toBe(true);
      expect(engine.state.round!.currentTrick.leadPlayerId).toBe("new2");
    }
  });

  it("does not rename locked salon identity on rejoin", () => {
    const engine = new PiratesGameEngine();
    engine.addPlayer("p1", "Barbe", "🏴‍☠️", true);
    engine.addPlayer("p1", "Hackeur", "💀", true);
    expect(engine.state.players[0].name).toBe("Barbe");
  });

  it("plays with Ghost Pirate in 2-player mode when enabled", () => {
    const engine = new PiratesGameEngine({ enableGhostPirate: true });
    engine.addPlayer("p1", "A", "🏴‍☠️", true);
    engine.addPlayer("p2", "B", "👑", false);
    expect(engine.startGame()).toBe(true);

    // Ghost Pirate should be added automatically
    expect(engine.state.players).toHaveLength(3);
    const bot = engine.state.players.find((p) => p.isBot);
    expect(bot).toBeDefined();
    expect(bot?.id).toBe("ghost-pirate");
    expect(bot?.bid).toBe(0);

    // Submit bids for humans
    expect(engine.submitBid("p1", 1)).toBe(true);
    expect(engine.submitBid("p2", 0)).toBe(true);
    expect(engine.state.phase).toBe("TRICK");

    // Force deterministic hands for round 2 (2 tricks)
    engine.state.round!.roundNumber = 2;
    engine.state.round!.cardsInRound = 2;
    const p1 = engine.state.players.find((p) => p.id === "p1")!;
    const p2 = engine.state.players.find((p) => p.id === "p2")!;
    p1.hand = [
      { id: "yellow-5", suit: "yellow", rank: 5 },
      { id: "yellow-6", suit: "yellow", rank: 6 },
    ];
    p2.hand = [
      { id: "yellow-2", suit: "yellow", rank: 2 },
      { id: "yellow-3", suit: "yellow", rank: 3 },
    ];
    bot!.hand = [
      { id: "black-10", suit: "black", rank: 10 },
      { id: "black-11", suit: "black", rank: 11 },
    ];

    engine.state.round!.currentTrick.leadPlayerId = "p1";

    // P1 plays 1st
    expect(engine.playCard("p1", "yellow-5").ok).toBe(true);
    // Ghost Pirate auto-plays 2nd!
    expect(engine.state.round!.currentTrick.playedCards).toHaveLength(2);
    expect(engine.state.round!.currentTrick.playedCards[1].playerId).toBe("ghost-pirate");

    // P2 plays 3rd
    expect(engine.playCard("p2", "yellow-2").ok).toBe(true);
    expect(engine.state.round!.currentTrick.playedCards).toHaveLength(3);
    expect(engine.state.round!.currentTrick.winnerId).toBe("ghost-pirate");

    // Advance trick to trick 2: since Ghost Pirate won, next lead rotates to P2 (the other human)
    expect(engine.advanceTrick()).toBe(true);
    expect(engine.state.phase).toBe("TRICK");
    expect(engine.state.round!.currentTrick.leadPlayerId).toBe("p2");
  });

  it("can disable Ghost Pirate in 2-player mode via config", () => {
    const engine = new PiratesGameEngine({ enableGhostPirate: false });
    engine.addPlayer("p1", "A", "🏴‍☠️", true);
    engine.addPlayer("p2", "B", "👑", false);
    expect(engine.startGame()).toBe(true);

    expect(engine.state.players).toHaveLength(2);
    expect(engine.state.players.some((p) => p.isBot)).toBe(false);
  });

  it("handles Kraken destroying a trick and White Whale neutralizing special cards", () => {
    const engine = new PiratesGameEngine({
      enableGhostPirate: false,
      enableKrakenAndWhale: true,
    });
    engine.addPlayer("p1", "A", "🏴‍☠️", true);
    engine.addPlayer("p2", "B", "👑", false);
    engine.startGame();
    engine.state.round!.cardsInRound = 2;

    // 1. Test Kraken
    p1CardPlay(engine, { id: "kraken", special: "kraken" }, { id: "yellow-5", suit: "yellow", rank: 5 });
    expect(engine.state.round!.currentTrick.destroyedByKraken).toBe(true);
    expect(engine.state.round!.currentTrick.winnerId).toBeUndefined();

    // 2. Test White Whale
    expect(engine.advanceTrick()).toBe(true);
    p1CardPlay(
      engine,
      { id: "white-whale", special: "whiteWhale" },
      { id: "yellow-12", suit: "yellow", rank: 12 },
    );
    expect(engine.state.round!.currentTrick.winnerId).toBe("p2");
  });

  it("handles Pirate Powers (Rosie & Harry)", () => {
    const engine = new PiratesGameEngine({
      enableGhostPirate: false,
      enablePiratePowers: true,
    });
    engine.addPlayer("p1", "A", "🏴‍☠️", true);
    engine.addPlayer("p2", "B", "👑", false);
    engine.startGame();

    p1CardPlay(
      engine,
      { id: "pirate-1", special: "pirate", pirateName: "rosie" },
      { id: "yellow-2", suit: "yellow", rank: 2 },
    );

    expect(engine.state.players[0].piratePowerPending).toBe("rosie");
    expect(engine.useRosiePower("p1", "p2")).toBe(true);
    expect(engine.state.round!.currentTrick.leadPlayerId).toBe("p2");
  });

  it("calculates Rascal scoring correctly for direct hit and miss", () => {
    const engine = new PiratesGameEngine({
      enableGhostPirate: false,
      scoringMode: "RASCAL",
      rascalOption: "CHEVROTINE",
    });
    engine.addPlayer("p1", "A", "🏴‍☠️", true);
    engine.addPlayer("p2", "B", "👑", false);
    engine.startGame();

    // Force bids for 1-card round (potential 10 pts)
    // p1 bids 1 (and wins 1), p2 bids 1 (and wins 0 => off by 1)
    engine.submitBid("p1", 1);
    engine.submitBid("p2", 1);

    p1CardPlay(
      engine,
      { id: "yellow-5", suit: "yellow", rank: 5 },
      { id: "yellow-2", suit: "yellow", rank: 2 },
    );

    engine.advanceTrick();
    expect(engine.state.lastRoundScores).toBeDefined();
    const p1Score = engine.state.lastRoundScores!.find((s) => s.playerId === "p1")!;
    const p2Score = engine.state.lastRoundScores!.find((s) => s.playerId === "p2")!;

    expect(p1Score.roundScore).toBe(10); // 100% of 10 for direct hit
    expect(p2Score.roundScore).toBe(5);  // 50% of 10 for off-by-1
  });
});

function p1CardPlay(
  engine: PiratesGameEngine,
  cardP1: any,
  cardP2: any,
): void {
  const p1 = engine.state.players.find((p) => p.id === "p1")!;
  const p2 = engine.state.players.find((p) => p.id === "p2")!;
  p1.hand = [cardP1];
  p2.hand = [cardP2];
  engine.state.round!.currentTrick.leadPlayerId = "p1";
  if (engine.state.phase === "BIDDING") {
    engine.submitBid("p1", 0);
    engine.submitBid("p2", 0);
  }
  engine.playCard("p1", cardP1.id);
  engine.playCard("p2", cardP2.id);
}
