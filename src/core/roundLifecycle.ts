import type { GameState, RoundScoreLine } from "./types.ts";
import { createDeck, shuffleDeck } from "./decks.ts";
import { calculatePlayerRoundScore } from "./scoring.ts";
import { getActivePlayers } from "./turnOrder.ts";

type LogFn = (text: string, type?: string) => void;

export function dealRound(
  state: GameState,
  roundNumber: number,
  dealerIdx: number,
  addLog: LogFn,
): void {
  const deck = shuffleDeck(createDeck());
  const activePlayers = getActivePlayers(state);

  let cardOffset = 0;
  state.players.forEach((player) => {
    if (!player.isConnected) {
      player.hand = [];
      return;
    }
    const hand = deck.slice(cardOffset, cardOffset + roundNumber);
    cardOffset += roundNumber;

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
  });

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

  state.round = {
    roundNumber,
    totalRounds: 10,
    dealerId,
    currentTrick: { leadPlayerId: firstLeadId, playedCards: [] },
    trickHistory: [],
    bidsSubmitted,
  };

  state.phase = "BIDDING";
  state.lastRoundScores = null;
  addLog(`--- Manche ${roundNumber} / 10 ---`);
}

export function applyRoundScoring(
  state: GameState,
  roundNum: number,
  addLog: LogFn,
): void {
  const lines: RoundScoreLine[] = [];

  state.players.forEach((p) => {
    if (!p.isConnected) return;
    if (p.isBot) {
      p.bid = 0;
      p.tricksWon = 0;
      p.capturedBonus = 0;
      return;
    }
    const scoreRes = calculatePlayerRoundScore(
      p.bid ?? 0,
      p.tricksWon,
      p.capturedBonus,
      roundNum,
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

  if (roundNum >= 10) {
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
