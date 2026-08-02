import type { GameState, RoundScoreLine, RoundStructure } from "./types.ts";
import { createDeck, shuffleDeck } from "./decks.ts";
import { calculatePlayerRoundScore } from "./scoring.ts";
import { getActivePlayers } from "./turnOrder.ts";

type LogFn = (text: string, type?: string) => void;

export function getCardsForRound(structure: RoundStructure | undefined, roundNumber: number): number {
  switch (structure) {
    case "EVEN_ONLY":
      return Math.min(10, roundNumber * 2);
    case "READY_FOR_BATTLE":
      return Math.min(10, roundNumber + 5);
    case "LIGHTNING":
      return 5;
    case "BARRAGE":
      return 10;
    case "WHIRLWIND":
      return Math.max(1, 11 - roundNumber * 2);
    case "STANDARD":
    default:
      return roundNumber;
  }
}

export function getTotalRounds(structure: RoundStructure | undefined): number {
  switch (structure) {
    case "EVEN_ONLY":
    case "READY_FOR_BATTLE":
    case "LIGHTNING":
    case "WHIRLWIND":
      return 5;
    case "BARRAGE":
    case "STANDARD":
    default:
      return 10;
  }
}

export function dealRound(
  state: GameState,
  roundNumber: number,
  dealerIdx: number,
  addLog: LogFn,
): void {
  const deck = shuffleDeck(createDeck(state.config));
  const activePlayers = getActivePlayers(state);
  const cardsToDeal = getCardsForRound(state.config.roundStructure, roundNumber);

  let cardOffset = 0;
  state.players.forEach((player) => {
    if (!player.isConnected) {
      player.hand = [];
      return;
    }
    const hand = deck.slice(cardOffset, cardOffset + cardsToDeal);
    cardOffset += cardsToDeal;

    hand.sort((a, b) => {
      if (a.special && !b.special) return 1;
      if (!a.special && b.special) return -1;
      if (a.suit !== b.suit) return (a.suit || "").localeCompare(b.suit || "");
      return (b.rank || 0) - (a.rank || 0);
    });

    player.hand = hand;
    player.bid = player.isBot ? 0 : null;
    player.bidsRevealed = Boolean(player.isBot);
    player.tricksWon = 0;
    player.capturedBonus = 0;
    player.piratePowerPending = undefined;
    player.unseenCardsViewed = undefined;
    player.rascalBonusBet = undefined;
  });

  const remainingDeck = deck.slice(cardOffset);

  const humanPlayers = activePlayers.filter((p) => !p.isBot);
  const dealerId =
    humanPlayers[dealerIdx % humanPlayers.length]?.id ||
    activePlayers[dealerIdx % activePlayers.length]?.id ||
    activePlayers[0].id;
  const firstLeadId =
    humanPlayers[(dealerIdx + 1) % humanPlayers.length]?.id ||
    activePlayers[(dealerIdx + 1) % activePlayers.length]?.id ||
    activePlayers[0].id;

  const bidsSubmitted: Record<string, number> = {};
  state.players.forEach((p) => {
    if (p.isBot && p.isConnected) {
      bidsSubmitted[p.id] = 0;
    }
  });

  const totalRounds = getTotalRounds(state.config.roundStructure);

  state.round = {
    roundNumber,
    totalRounds,
    cardsInRound: cardsToDeal,
    dealerId,
    currentTrick: { leadPlayerId: firstLeadId, playedCards: [] },
    trickHistory: [],
    bidsSubmitted,
    alliances: [],
    deckRemainder: remainingDeck,
  };

  state.phase = "BIDDING";
  state.lastRoundScores = null;
  addLog(`--- Manche ${roundNumber} / ${totalRounds} (${cardsToDeal} cartes) ---`);
}

export function applyRoundScoring(
  state: GameState,
  roundNum: number,
  addLog: LogFn,
): void {
  const lines: RoundScoreLine[] = [];
  const cardsInRound = state.round?.cardsInRound ?? roundNum;

  // 1. Pre-calculate bidHits for all players
  const playerBidHits: Record<string, boolean> = {};
  state.players.forEach((p) => {
    if (!p.isConnected || p.isBot) return;
    const diff = Math.abs(p.tricksWon - (p.bid ?? 0));
    playerBidHits[p.id] = diff === 0;
  });

  // 2. Resolve Loot Alliances bonus (+20 pts each if both allies hit their bid)
  const allianceBonusMap: Record<string, number> = {};
  state.round?.alliances?.forEach(({ player1Id, player2Id }) => {
    if (playerBidHits[player1Id] && playerBidHits[player2Id]) {
      allianceBonusMap[player1Id] = (allianceBonusMap[player1Id] || 0) + 20;
      allianceBonusMap[player2Id] = (allianceBonusMap[player2Id] || 0) + 20;
      const p1 = state.players.find((p) => p.id === player1Id);
      const p2 = state.players.find((p) => p.id === player2Id);
      addLog(
        `💰 Alliance Butin réussie entre ${p1?.name} et ${p2?.name} (+20 pts bonus chacun) !`,
        "score",
      );
    }
  });

  state.players.forEach((p) => {
    if (!p.isConnected) return;
    if (p.isBot) {
      p.bid = 0;
      p.tricksWon = 0;
      p.capturedBonus = 0;
      return;
    }

    let bonus = p.capturedBonus + (allianceBonusMap[p.id] || 0);

    // Apply Rascal Pirate Power bonus bet if set
    if (p.rascalBonusBet) {
      if (playerBidHits[p.id]) {
        bonus += p.rascalBonusBet;
        addLog(`🎲 Pari Rascal réussi pour ${p.name} (+${p.rascalBonusBet} pts) !`, "score");
      } else {
        bonus -= p.rascalBonusBet;
        addLog(`🎲 Pari Rascal raté pour ${p.name} (-${p.rascalBonusBet} pts) !`, "score");
      }
    }

    const scoreRes = calculatePlayerRoundScore(
      p.bid ?? 0,
      p.tricksWon,
      bonus,
      roundNum,
      state.config.scoringMode ?? "CLASSIC",
      state.config.rascalOption ?? "CHEVROTINE",
      cardsInRound,
    );

    p.score += scoreRes.roundScore;
    lines.push({
      playerId: p.id,
      name: p.name,
      bid: p.bid ?? 0,
      tricksWon: p.tricksWon,
      baseScore: scoreRes.baseScore,
      capturedBonus: scoreRes.capturedBonus,
      roundScore: scoreRes.roundScore,
      bidHit: scoreRes.bidHit,
      totalScore: p.score,
    });
    addLog(
      `${p.name}: enchère ${p.bid ?? 0}, plis ${p.tricksWon} → ${
        scoreRes.roundScore >= 0 ? "+" : ""
      }${scoreRes.roundScore} (total ${p.score})`,
      "score",
    );
  });

  state.lastRoundScores = lines;
  const totalRounds = getTotalRounds(state.config.roundStructure);

  if (roundNum >= totalRounds) {
    const sorted = [...getActivePlayers(state)]
      .filter((p) => !p.isBot)
      .sort((a, b) => b.score - a.score);
    state.phase = "GAME_OVER";
    state.winnerId = sorted[0]?.id;
    addLog(
      `Victoire de ${sorted[0]?.name} avec ${sorted[0]?.score} points !`,
      "victory",
    );
  } else {
    state.phase = "SCORING";
    addLog(`Scores de la manche ${roundNum} — en attente du Capitaine.`);
  }
}
