import type { GameState, Spectator } from "./types.ts";

function remapRecordKey(
  record: Record<string, unknown>,
  oldId: string,
  newId: string,
): void {
  if (!(oldId in record) || oldId === newId) return;
  record[newId] = record[oldId];
  delete record[oldId];
}

export function addPlayerToState(
  state: GameState,
  id: string,
  name: string,
  avatar: string,
  isHost = false,
): boolean {
  const existing = state.players.find((p) => p.id === id);
  if (existing) {
    existing.isConnected = true;
    if (!existing.avatar && avatar) existing.avatar = avatar;
    return true;
  }

  if (state.players.length >= 6) return false;

  state.players.push({
    id,
    name,
    avatar,
    score: 0,
    bid: null,
    bidsRevealed: false,
    tricksWon: 0,
    hand: [],
    capturedBonus: 0,
    isConnected: true,
    isReady: isHost,
    isHost,
  });
  return true;
}

export function addSpectatorToState(
  state: GameState,
  id: string,
  name: string,
  avatar: string,
): void {
  if (!state.spectators.some((s) => s.id === id)) {
    state.spectators.push({ id, name, avatar });
  }
}

export function setRoleOnState(
  state: GameState,
  id: string,
  role: "player" | "spectator",
): boolean {
  if (state.phase !== "LOBBY") return false;

  if (role === "spectator") {
    const p = state.players.find((pl) => pl.id === id);
    if (!p || p.isHost) return false;
    state.players = state.players.filter((pl) => pl.id !== id);
    addSpectatorToState(state, id, p.name, p.avatar);
    return true;
  }

  if (state.spectatorLocks[id]) return false;
  const s = state.spectators.find((sp) => sp.id === id);
  if (!s) return false;
  state.spectators = state.spectators.filter((sp) => sp.id !== id);
  addPlayerToState(state, id, s.name, s.avatar);
  return true;
}

export function setSpectatorLockOnState(
  state: GameState,
  id: string,
  locked: boolean,
): void {
  const target = state.players.find((p) => p.id === id);
  if (target?.isHost) return;

  if (locked) {
    setRoleOnState(state, id, "spectator");
  }
  state.spectatorLocks[id] = locked;
}

export function remapPlayerIdOnState(
  state: GameState,
  oldId: string,
  newId: string,
): boolean {
  if (!oldId || !newId || oldId === newId) return false;

  const p = state.players.find((pl) => pl.id === oldId);
  if (p) {
    p.id = newId;
    p.isConnected = true;
  }

  const s = state.spectators.find((sp: Spectator) => sp.id === oldId);
  if (s) s.id = newId;

  if (!p && !s) return false;

  remapRecordKey(state.spectatorLocks as Record<string, unknown>, oldId, newId);

  if (state.winnerId === oldId) state.winnerId = newId;

  const round = state.round;
  if (round) {
    if (round.dealerId === oldId) round.dealerId = newId;
    if (round.currentTrick.leadPlayerId === oldId) {
      round.currentTrick.leadPlayerId = newId;
    }
    if (round.currentTrick.winnerId === oldId) {
      round.currentTrick.winnerId = newId;
    }
    for (const pc of round.currentTrick.playedCards) {
      if (pc.playerId === oldId) pc.playerId = newId;
    }
    for (const trick of round.trickHistory) {
      if (trick.leadPlayerId === oldId) trick.leadPlayerId = newId;
      if (trick.winnerId === oldId) trick.winnerId = newId;
      for (const pc of trick.playedCards) {
        if (pc.playerId === oldId) pc.playerId = newId;
      }
    }
    remapRecordKey(round.bidsSubmitted as Record<string, unknown>, oldId, newId);
  }

  if (state.lastRoundScores) {
    for (const line of state.lastRoundScores) {
      if (line.playerId === oldId) line.playerId = newId;
    }
  }

  return true;
}
