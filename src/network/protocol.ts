import type { GameConfig } from "../core/types.ts";

export {
  sanitizeGameState,
  sanitizeGameStateForSpectator,
  sanitizeForViewer,
  createMaskedCard,
} from "../core/sanitize.ts";

export type MessageType =
  | "JOIN_GAME"
  | "STATE_UPDATE"
  | "ACTION"
  | "CHAT"
  | "AUDIO_EVENT";

export interface NetworkMessage {
  type: MessageType;
  [key: string]: unknown;
}

export type ClientActionType =
  | "JOIN_GAME"
  | "TOGGLE_READY"
  | "START_GAME"
  | "CHANGE_CONFIG"
  | "SET_ROLE"
  | "LOCK_SPECTATOR"
  | "PLACE_BID"
  | "PLAY_CARD"
  | "ADVANCE_TRICK"
  | "ADVANCE_ROUND"
  | "RESTART_GAME";

export interface ActionMessage extends NetworkMessage {
  type: "ACTION";
  actionName: ClientActionType;
  playerId: string;
  payload: {
    bid?: number;
    cardId?: string;
    tigressChoice?: "escape" | "pirate";
    config?: Partial<GameConfig>;
    readyStatus?: boolean;
    role?: "player" | "spectator";
    locked?: boolean;
    peerId?: string;
    name?: string;
    avatar?: string;
    turnNonce?: number;
    [key: string]: unknown;
  };
}
