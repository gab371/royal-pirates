export type Suit = "yellow" | "green" | "blue" | "black";
export type SpecialType = "escape" | "pirate" | "mermaid" | "skullKing" | "tigress";

export interface Card {
  id: string;
  suit?: Suit;
  rank?: number;
  special?: SpecialType;
  isMasked?: boolean;
}

export type Phase = "LOBBY" | "BIDDING" | "TRICK" | "SCORING" | "GAME_OVER";

export interface GameConfig {
  suitFollowHints: boolean;
  enableFourteenBonus: boolean;
  enableGhostPirate?: boolean;
}

export interface Player {
  id: string;
  name: string;
  avatar: string;
  score: number;
  bid: number | null;
  bidsRevealed: boolean;
  tricksWon: number;
  hand: Card[];
  capturedBonus: number;
  isConnected: boolean;
  isReady: boolean;
  isHost: boolean;
  isBot?: boolean;
}

export interface Spectator {
  id: string;
  name: string;
  avatar: string;
}

export type SpectatorLock = Record<string, boolean>;

export interface PlayedCard {
  playerId: string;
  card: Card;
  tigressChoice?: "escape" | "pirate";
}

export interface Trick {
  leadPlayerId: string;
  playedCards: PlayedCard[];
  winnerId?: string;
  capturedBonus?: number;
}

export interface RoundState {
  roundNumber: number;
  totalRounds: number;
  dealerId: string;
  currentTrick: Trick;
  trickHistory: Trick[];
  bidsSubmitted: Record<string, number>;
}

export interface LogEntry {
  id: string;
  text: string;
  timestamp: number;
  type?: string;
}

export interface RoundScoreLine {
  playerId: string;
  name: string;
  bid: number;
  tricksWon: number;
  baseScore: number;
  capturedBonus: number;
  roundScore: number;
  bidHit: boolean;
  totalScore: number;
}

export interface GameState {
  phase: Phase;
  config: GameConfig;
  players: Player[];
  spectators: Spectator[];
  spectatorLocks: SpectatorLock;
  round: RoundState | null;
  lastRoundScores: RoundScoreLine[] | null;
  winnerId?: string;
  turnNonce: number;
  logs: LogEntry[];
}
