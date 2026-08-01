import type { PiratesGameEngine } from "../core/gameEngine.ts";
import type { ActionMessage } from "../network/protocol.ts";

export function handleHostAction(
  engine: PiratesGameEngine,
  myPeerId: string | null,
  msg: ActionMessage,
  playSfx: (soundName: string) => void,
  getSeatEngine: () => import("p2play-core/presence").GameSeatEngine,
  helpers: {
    handleJoinGameSeat: typeof import("p2play-core/presence").handleJoinGameSeat;
    getTrustedUsername?: (peerId: string) => string | undefined;
  },
): void {
  const { actionName, playerId, payload } = msg;
  const isHostSender = playerId === myPeerId;

  switch (actionName) {
    case "JOIN_GAME": {
      const trustedName = helpers.getTrustedUsername?.(playerId);
      helpers.handleJoinGameSeat({
        engine: getSeatEngine(),
        playerId,
        payload: {
          name: trustedName || payload?.name,
          avatar: payload?.avatar,
        },
        isHostPlayer: playerId === myPeerId,
        addPlayer: (id, name, avatar, isHost) =>
          engine.addPlayer(id, name, avatar, isHost),
        addSpectator: (id, name, avatar) => engine.addSpectator(id, name, avatar),
      });
      break;
    }

    case "TOGGLE_READY":
      engine.toggleReady(playerId, payload?.readyStatus);
      playSfx("click");
      break;

    case "START_GAME":
      if (isHostSender && engine.startGame()) {
        playSfx("click");
      }
      break;

    case "CHANGE_CONFIG":
      if (isHostSender && payload?.config) {
        engine.updateConfig(payload.config);
      }
      break;

    case "SET_ROLE": {
      const targetId = payload?.peerId as string;
      const nextRole = payload?.role as "player" | "spectator" | undefined;
      if (!targetId || !nextRole) break;
      // Self: both directions. Host on others: only force spectator.
      const allowed =
        targetId === playerId || (isHostSender && nextRole === "spectator");
      if (allowed) engine.setRole(targetId, nextRole);
      break;
    }

    case "LOCK_SPECTATOR": {
      if (!isHostSender) break;
      const targetId = payload?.peerId as string;
      if (targetId && payload?.locked !== undefined) {
        engine.setSpectatorLock(targetId, !!payload.locked);
      }
      break;
    }

    case "PLACE_BID":
      if (typeof payload?.bid === "number" && engine.submitBid(playerId, payload.bid)) {
        playSfx("bid");
      }
      break;

    case "PLAY_CARD": {
      if (!payload?.cardId) break;
      const oldPhase = engine.state.phase;
      const result = engine.playCard(
        playerId,
        payload.cardId,
        payload.tigressChoice,
      );
      if (!result.ok) break;

      playSfx("card");
      if (result.specialPlayed) playSfx("special");
      if (result.trickComplete) playSfx("trickWin");
      if (engine.state.phase === "GAME_OVER" && oldPhase !== "GAME_OVER") {
        playSfx("victory");
      }
      break;
    }

    case "ADVANCE_ROUND":
      if (isHostSender && engine.advanceFromScoring()) {
        playSfx("click");
      }
      break;

    case "RESTART_GAME":
      if (isHostSender) {
        engine.restartGame();
        playSfx("click");
      }
      break;
  }
}
