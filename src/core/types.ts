export type Suit = "yellow" | "green" | "blue" | "black";
export type SpecialType =
  | "escape"
  | "pirate"
  | "mermaid"
  | "skullKing"
  | "tigress"
  | "kraken"
  | "whiteWhale"
  | "loot";

export interface Card {
  id: string;
  suit?: Suit;
  rank?: number;
  special?: SpecialType;
  pirateName?: "rosie" | "will" | "rascal" | "juanita" | "harry";
  isMasked?: boolean;
}

export type Phase = "LOBBY" | "BIDDING" | "TRICK" | "SCORING" | "GAME_OVER";

export type ScoringMode = "CLASSIC" | "RASCAL";
export type RascalOption = "CHEVROTINE" | "BOULET_DE_CANON";
export type RoundStructure =
  | "STANDARD"
  | "EVEN_ONLY"
  | "READY_FOR_BATTLE"
  | "LIGHTNING"
  | "BARRAGE"
  | "WHIRLWIND";

export interface GameConfig {
  suitFollowHints: boolean;
  enableFourteenBonus: boolean;
  enableGhostPirate?: boolean;
  enableKrakenAndWhale?: boolean;
  enableLoot?: boolean;
  enablePiratePowers?: boolean;
  scoringMode?: ScoringMode;
  rascalOption?: RascalOption;
  roundStructure?: RoundStructure;
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
  piratePowerPending?: "rosie" | "will" | "rascal" | "juanita" | "harry";
  unseenCardsViewed?: Card[];
  rascalBonusBet?: 0 | 10 | 20;
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
  destroyedByKraken?: boolean;
  destroyedByWhale?: boolean;
  alliancesFormed?: { player1Id: string; player2Id: string }[];
}

export interface RoundState {
  roundNumber: number;
  totalRounds: number;
  cardsInRound: number;
  dealerId: string;
  currentTrick: Trick;
  trickHistory: Trick[];
  bidsSubmitted: Record<string, number>;
  alliances: { player1Id: string; player2Id: string }[];
  deckRemainder: Card[];
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
