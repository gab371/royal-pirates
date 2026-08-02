import { useEffect, useRef, useState, useCallback } from "react";
import {
  attachPresenceHandlers,
  createSeatEngine,
  handleJoinGameSeat,
} from "p2play-core/presence";
import { usePeer } from "./usePeer.ts";
import { handleHostAction } from "./hostActions.ts";
import { broadcastSanitizedStates } from "./broadcastState.ts";
import { installTestHooks } from "./testHooks.ts";
import { PiratesGameEngine } from "../core/gameEngine.ts";
import type { ActionMessage, ClientActionType } from "../network/protocol.ts";
import type { Card, GameConfig, GameState, SpecialType, Suit } from "../core/types.ts";
import { isDebugModeAllowed } from "../lib/debugMode.ts";
import {
  buildAllTypesSample,
  makeSpecialCard,
  makeSuitCard,
} from "../lib/debugCards.ts";

export interface UseGameOptions {
  externalPeerManager?: import("p2play-core").PeerManagerLike;
  playerName?: string;
  playerAvatar?: string;
  isEmbedded?: boolean;
  isHost?: boolean;
  lateJoin?: boolean;
  gameConfig?: unknown;
  hubPhase?: string;
}

const DEFAULT_GAME_STATE: GameState = {
  phase: "LOBBY",
  config: { suitFollowHints: true, enableFourteenBonus: false },
  players: [],
  spectators: [],
  spectatorLocks: {},
  round: null,
  lastRoundScores: null,
  turnNonce: 0,
  logs: [],
};

export function useGame(options?: UseGameOptions) {
  const p2p = usePeer(options);
  const {
    isHost,
    myPeerId,
    peerManager,
    playSfx,
    hostGame,
    joinGame,
    sendAction,
    sendChat,
    gameState: guestState,
    status,
    error,
    chatMessages,
    disconnect,
  } = p2p;

  const gameEngineRef = useRef<PiratesGameEngine | null>(null);
  const [localPlayerName, setLocalPlayerName] = useState(options?.playerName || "");
  const [localPlayerAvatar, setLocalPlayerAvatar] = useState(
    options?.playerAvatar || "🏴‍☠️",
  );
  const [, setTick] = useState(0);
  const forceRender = useCallback(() => setTick((t) => t + 1), []);

  const broadcast = useCallback(
    (engineState: GameState, overridePeerId?: string) => {
      const activePeerId = overridePeerId || myPeerId;
      if (!activePeerId) return;
      broadcastSanitizedStates(peerManager, engineState, activePeerId);
      forceRender();
    },
    [myPeerId, peerManager, forceRender],
  );

  useEffect(() => {
    if (!isHost) {
      gameEngineRef.current = null;
      return;
    }
    if (!gameEngineRef.current) gameEngineRef.current = new PiratesGameEngine();
    const engine = gameEngineRef.current;

    if (
      options?.isEmbedded &&
      options?.externalPeerManager &&
      engine.state.phase === "LOBBY"
    ) {
      setTimeout(() => {
        engine.state.players = [];
        engine.addPlayer(
          myPeerId!,
          options.playerName || "Capitaine",
          options.playerAvatar || "🏴‍☠️",
          true,
        );
        peerManager.lobbyPlayers?.forEach((p) => {
          if (p.peerId && p.peerId !== myPeerId) {
            engine.addPlayer(
              p.peerId,
              p.username || `Pirate ${p.peerId.slice(0, 4)}`,
              p.avatar || "👤",
              false,
            );
          }
        });
        broadcast(engine.state);
      }, 0);
    }

    const getSeatEngine = () =>
      createSeatEngine({
        getPhase: () => engine.state.phase,
        getPlayers: () => engine.state.players,
        getSpectators: () => engine.state.spectators,
        markDisconnected: (id) => engine.markDisconnected(id),
        isDisconnected: (id) => engine.isDisconnected(id),
        remapPlayerId: (o, n) => engine.remapPlayerId(o, n),
        removePlayer: (id) => engine.removePlayer(id),
      });

    const presence = attachPresenceHandlers({
      peerManager,
      getEngine: getSeatEngine,
      onBroadcast: () => broadcast(engine.state),
      onHostAction: (senderPeerId, actionMsg) => {
        const raw = actionMsg as ActionMessage;
        const msg =
          raw.type === "ACTION"
            ? ({ ...raw, playerId: senderPeerId } as ActionMessage)
            : raw;

        handleHostAction(engine, myPeerId, msg, playSfx, getSeatEngine, {
          handleJoinGameSeat,
          getTrustedUsername: (id) => peerManager.getTrustedUsername?.(id),
        });
        broadcast(engine.state);
      },
    });

    return () => presence.dispose();
  }, [
    isHost,
    myPeerId,
    peerManager,
    playSfx,
    broadcast,
    options?.isEmbedded,
    options?.externalPeerManager,
    options?.playerName,
    options?.playerAvatar,
  ]);

  useEffect(() => {
    if (!options?.isEmbedded || isHost || !myPeerId) return;
    const name = options.playerName || localPlayerName || "Pirate";
    const avatar = options.playerAvatar || localPlayerAvatar || "🏴‍☠️";
    const sendJoin = () => {
      peerManager.sendToHost("ACTION", {
        actionName: "JOIN_GAME",
        playerId: myPeerId,
        payload: { name, avatar },
      });
    };
    const timers = [250, 1000, 2500].map((ms) => window.setTimeout(sendJoin, ms));
    return () => timers.forEach(clearTimeout);
  }, [
    options?.isEmbedded,
    options?.playerName,
    options?.playerAvatar,
    isHost,
    myPeerId,
    localPlayerName,
    localPlayerAvatar,
    peerManager,
  ]);

  const activeGameState: GameState =
    (isHost
      ? gameEngineRef.current?.state
      : (guestState as GameState | null)) ||
    gameEngineRef.current?.state ||
    DEFAULT_GAME_STATE;

  useEffect(() => {
    return installTestHooks({
      getEngine: () => gameEngineRef.current,
      getGuestState: () => guestState as GameState | null,
      getFallbackState: () => activeGameState,
      broadcast,
    });
  }, [activeGameState, broadcast, guestState]);

  const mutateMyHand = useCallback(
    (mutator: (hand: Card[]) => Card[]) => {
      const engine = gameEngineRef.current;
      if (!isHost || !engine || !myPeerId || !isDebugModeAllowed()) return;
      const player = engine.state.players.find((p) => p.id === myPeerId);
      if (!player) return;
      player.hand = mutator([...player.hand]);
      broadcast(engine.state);
    },
    [isHost, myPeerId, broadcast],
  );

  const debugGiveAllTypes = useCallback(() => {
    mutateMyHand(() => buildAllTypesSample());
  }, [mutateMyHand]);

  const debugAddSuit = useCallback(
    (suit: Suit) => {
      mutateMyHand((hand) => [...hand, makeSuitCard(suit)]);
    },
    [mutateMyHand],
  );

  const debugAddSpecial = useCallback(
    (special: SpecialType) => {
      mutateMyHand((hand) => [...hand, makeSpecialCard(special)]);
    },
    [mutateMyHand],
  );

  const debugClearHand = useCallback(() => {
    mutateMyHand(() => []);
  }, [mutateMyHand]);

  /** Host-only console helpers: `window.__PIRATES_DEBUG__` (like Uno `__P2UNO_DEBUG__`). */
  useEffect(() => {
    if (!isHost || !isDebugModeAllowed()) {
      delete (window as unknown as { __PIRATES_DEBUG__?: unknown }).__PIRATES_DEBUG__;
      return;
    }
    (window as unknown as {
      __PIRATES_DEBUG__: Record<string, unknown>;
    }).__PIRATES_DEBUG__ = {
      get engine() {
        return gameEngineRef.current;
      },
      myPeerId,
      sync: () => {
        const eng = gameEngineRef.current;
        if (eng) broadcast(eng.state);
      },
      giveAllTypes: debugGiveAllTypes,
      addSuit: debugAddSuit,
      addSpecial: debugAddSpecial,
      clearHand: debugClearHand,
    };
    return () => {
      delete (window as unknown as { __PIRATES_DEBUG__?: unknown }).__PIRATES_DEBUG__;
    };
  }, [
    isHost,
    myPeerId,
    broadcast,
    debugGiveAllTypes,
    debugAddSuit,
    debugAddSpecial,
    debugClearHand,
  ]);

  const hostRoom = useCallback(
    async (name: string, avatar: string) => {
      setLocalPlayerName(name);
      setLocalPlayerAvatar(avatar);
      const roomId = await hostGame(undefined, { username: name, avatar });
      const engine = new PiratesGameEngine();
      gameEngineRef.current = engine;
      engine.addPlayer(roomId, name, avatar, true);
      broadcast(engine.state, roomId);
    },
    [hostGame, broadcast],
  );

  const joinRoom = useCallback(
    async (name: string, avatar: string, roomId: string) => {
      setLocalPlayerName(name);
      setLocalPlayerAvatar(avatar);
      const { peerId } = await joinGame(roomId, { username: name, avatar });
      setTimeout(() => {
        peerManager.sendToHost("ACTION", {
          actionName: "JOIN_GAME",
          playerId: peerId,
          payload: { name, avatar },
        });
      }, 1000);
    },
    [joinGame, peerManager],
  );

  const dispatchAction = useCallback(
    (actionName: ClientActionType, payload: Record<string, unknown> = {}) => {
      sendAction(actionName, {
        ...payload,
        turnNonce: activeGameState.turnNonce ?? -1,
      });
    },
    [sendAction, activeGameState.turnNonce],
  );

  return {
    isHost,
    myPeerId,
    hostPeerId: p2p.hostPeerId,
    connectedPeers: p2p.connectedPeers,
    chatMessages,
    gameState: activeGameState,
    status,
    error,
    hostRoom,
    joinRoom,
    toggleReady: (readyStatus?: boolean) =>
      dispatchAction("TOGGLE_READY", { readyStatus }),
    startGame: () => dispatchAction("START_GAME"),
    changeConfig: (config: Partial<GameConfig>) =>
      dispatchAction("CHANGE_CONFIG", { config }),
    setRole: (peerId: string, role: "player" | "spectator") =>
      dispatchAction("SET_ROLE", { peerId, role }),
    lockSpectator: (peerId: string, locked: boolean) =>
      dispatchAction("LOCK_SPECTATOR", { peerId, locked }),
    placeBid: (bid: number) => dispatchAction("PLACE_BID", { bid }),
    playCard: (cardId: string, tigressChoice?: "escape" | "pirate") =>
      dispatchAction("PLAY_CARD", { cardId, tigressChoice }),
    advanceTrick: () => dispatchAction("ADVANCE_TRICK"),
    advanceRound: () => dispatchAction("ADVANCE_ROUND"),
    restartGame: () => dispatchAction("RESTART_GAME"),
    useRosiePower: (targetPlayerId: string) =>
      dispatchAction("USE_ROSIE_POWER", { targetPlayerId }),
    useWillPower: (discardCardIds: string[]) =>
      dispatchAction("USE_WILL_POWER", { discardCardIds }),
    useRascalPower: (bonusBet: 0 | 10 | 20) =>
      dispatchAction("USE_RASCAL_POWER", { bonusBet }),
    useHarryPower: (bidDelta: -1 | 0 | 1) =>
      dispatchAction("USE_HARRY_POWER", { bidDelta }),
    sendChatMessage: (text: string) =>
      sendChat(localPlayerName || "Pirate", text),
    disconnect,
    localPlayerName,
    localPlayerAvatar,
    debugMode: isHost && isDebugModeAllowed(),
    debugGiveAllTypes,
    debugAddSuit,
    debugAddSpecial,
    debugClearHand,
  };
}
