import type { PeerManagerLike } from "p2play-core";
import type { GameState } from "../core/types.ts";
import {
  sanitizeGameState,
  sanitizeGameStateForSpectator,
} from "../network/protocol.ts";

function resolvePeerConnection(
  peerManager: PeerManagerLike<GameState>,
  id: string,
) {
  if (!id) return undefined;
  let conn = peerManager.connections.get(id);
  if (!conn) {
    for (const [peerId, connection] of peerManager.connections.entries()) {
      if (!peerId) continue;
      if (peerId.endsWith(id) || id.endsWith(peerId)) {
        conn = connection;
        break;
      }
    }
  }
  return conn;
}

export function broadcastSanitizedStates(
  peerManager: PeerManagerLike<GameState>,
  engineState: GameState,
  activePeerId: string,
): void {
  for (const p of engineState.players) {
    peerManager.registerPeerProfile?.(p.id, {
      username: p.name,
      avatar: p.avatar,
    });
  }
  for (const s of engineState.spectators) {
    peerManager.registerPeerProfile?.(s.id, {
      username: s.name,
      avatar: s.avatar,
    });
  }

  peerManager.onStateReceived?.(
    JSON.parse(JSON.stringify(sanitizeGameState(engineState, activePeerId))),
  );

  engineState.players.forEach((p) => {
    if (p.id === activePeerId) return;
    const conn = resolvePeerConnection(peerManager, p.id);
    if (conn?.open) {
      conn.send({
        type: "STATE_UPDATE",
        state: sanitizeGameState(engineState, p.id),
      });
    }
  });

  const spectatorView = sanitizeGameStateForSpectator(engineState);
  engineState.spectators.forEach((s) => {
    const conn = resolvePeerConnection(peerManager, s.id);
    if (conn?.open) {
      conn.send({
        type: "STATE_UPDATE",
        state: JSON.parse(JSON.stringify(spectatorView)),
      });
    }
  });
}
