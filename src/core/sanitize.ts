import type { Card, GameState, Player } from "./types.ts";

export function createMaskedCard(id: string): Card {
  return {
    id,
    special: "escape",
    isMasked: true,
  };
}

function sanitizePlayer(
  player: Player,
  isSelf: boolean,
  phase: GameState["phase"],
): Player {
  const hand = isSelf
    ? player.hand.map((card) => ({ ...card }))
    : player.hand.map((_, i) => createMaskedCard(`hidden-${player.id}-${i}`));

  let bid = player.bid;
  if (phase === "BIDDING" && !player.bidsRevealed && !isSelf) {
    bid = player.bid !== null ? -1 : null;
  }

  return { ...player, hand, bid };
}

/** Sanitize GameState for a seated player (own hand visible). */
export function sanitizeGameState(
  state: GameState,
  targetPlayerId: string,
): GameState {
  return {
    ...state,
    players: state.players.map((p) =>
      sanitizePlayer(p, p.id === targetPlayerId, state.phase),
    ),
  };
}

/** Sanitize GameState for a spectator (all hands masked). */
export function sanitizeGameStateForSpectator(state: GameState): GameState {
  return {
    ...state,
    players: state.players.map((p) => sanitizePlayer(p, false, state.phase)),
  };
}

/** Adapter matching p2play-core spectator naming. */
export function sanitizeForViewer(
  state: GameState,
  viewerPeerId: string | null,
): GameState {
  if (!viewerPeerId || state.spectators.some((s) => s.id === viewerPeerId)) {
    return sanitizeGameStateForSpectator(state);
  }
  return sanitizeGameState(state, viewerPeerId);
}
