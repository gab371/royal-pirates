import type { GameState, Player } from "./types.ts";

/** Connected players in seat order (engine array order). */
export function getActivePlayers(state: GameState): Player[] {
  return state.players.filter((p) => p.isConnected);
}

/**
 * Who must play next in the current trick.
 * Seat order from leadPlayerId, skipping players who already played.
 */
export function getCurrentActorId(state: GameState): string | null {
  if (state.phase !== "TRICK" || !state.round) return null;

  const active = getActivePlayers(state);
  if (active.length === 0) return null;

  const { leadPlayerId, playedCards } = state.round.currentTrick;
  const leadIdx = active.findIndex((p) => p.id === leadPlayerId);
  if (leadIdx < 0) return active[0]?.id ?? null;

  const alreadyPlayed = new Set(playedCards.map((pc) => pc.playerId));
  for (let i = 0; i < active.length; i++) {
    const candidate = active[(leadIdx + i) % active.length];
    if (!alreadyPlayed.has(candidate.id)) return candidate.id;
  }
  return null;
}

export function hasAlreadyPlayed(state: GameState, playerId: string): boolean {
  return Boolean(
    state.round?.currentTrick.playedCards.some((pc) => pc.playerId === playerId),
  );
}
