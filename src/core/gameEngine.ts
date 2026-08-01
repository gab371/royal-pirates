import type { GameConfig, GameState } from "./types.ts";
import { resolveTrickWinner } from "./trickResolution.ts";
import { isCardLegal } from "./suitFollow.ts";
import {
  getActivePlayers,
  getCurrentActorId,
  hasAlreadyPlayed,
} from "./turnOrder.ts";
import {
  addPlayerToState,
  addSpectatorToState,
  remapPlayerIdOnState,
  setRoleOnState,
  setSpectatorLockOnState,
} from "./seating.ts";
import { applyRoundScoring, dealRound } from "./roundLifecycle.ts";

export interface PlayCardResult {
  ok: boolean;
  trickComplete?: boolean;
  capturedBonus?: number;
  specialPlayed?: boolean;
  roundEnded?: boolean;
}

export class PiratesGameEngine {
  public state: GameState;

  constructor(config?: Partial<GameConfig>) {
    this.state = {
      phase: "LOBBY",
      config: {
        suitFollowHints: true,
        enableFourteenBonus: false,
        ...config,
      },
      players: [],
      spectators: [],
      spectatorLocks: {},
      round: null,
      lastRoundScores: null,
      turnNonce: 0,
      logs: [
        {
          id: "init",
          text: "Bienvenue dans le salon de Royal Pirates !",
          timestamp: Date.now(),
        },
      ],
    };
  }

  public addPlayer(id: string, name: string, avatar: string, isHost = false): boolean {
    const ok = addPlayerToState(this.state, id, name, avatar, isHost);
    if (ok) this.bumpNonce();
    return ok;
  }

  public removePlayer(id: string): void {
    this.state.players = this.state.players.filter((p) => p.id !== id);
    this.bumpNonce();
  }

  public markDisconnected(id: string): void {
    const p = this.state.players.find((pl) => pl.id === id);
    if (p) p.isConnected = false;
    this.bumpNonce();
  }

  public isDisconnected(id: string): boolean {
    const p = this.state.players.find((pl) => pl.id === id);
    return Boolean(p && !p.isConnected);
  }

  public remapPlayerId(oldId: string, newId: string): boolean {
    const ok = remapPlayerIdOnState(this.state, oldId, newId);
    if (ok) this.bumpNonce();
    return ok;
  }

  public addSpectator(id: string, name: string, avatar: string): void {
    addSpectatorToState(this.state, id, name, avatar);
    this.bumpNonce();
  }

  public setRole(id: string, role: "player" | "spectator"): boolean {
    const ok = setRoleOnState(this.state, id, role);
    if (ok) this.bumpNonce();
    return ok;
  }

  public setSpectatorLock(id: string, locked: boolean): void {
    setSpectatorLockOnState(this.state, id, locked);
    this.bumpNonce();
  }

  public toggleReady(id: string, readyStatus?: boolean): void {
    const p = this.state.players.find((pl) => pl.id === id);
    if (!p) return;
    p.isReady = readyStatus !== undefined ? readyStatus : !p.isReady;
    this.bumpNonce();
  }

  public updateConfig(newConfig: Partial<GameConfig>): void {
    if (this.state.phase !== "LOBBY") return;
    this.state.config = { ...this.state.config, ...newConfig };
    this.bumpNonce();
  }

  public startGame(): boolean {
    if (getActivePlayers(this.state).length < 2) return false;
    this.state.lastRoundScores = null;
    this.startRound(1, 0);
    return true;
  }

  public startRound(roundNumber: number, dealerIdx: number): void {
    dealRound(this.state, roundNumber, dealerIdx, (t, ty) => this.addLog(t, ty));
    this.bumpNonce();
  }

  public submitBid(playerId: string, bid: number): boolean {
    if (this.state.phase !== "BIDDING" || !this.state.round) return false;

    const player = this.state.players.find((p) => p.id === playerId);
    if (!player || !player.isConnected || player.bid !== null) return false;

    const maxBid = this.state.round.roundNumber;
    if (!Number.isInteger(bid) || bid < 0 || bid > maxBid) return false;

    player.bid = bid;
    this.state.round.bidsSubmitted[playerId] = bid;

    if (getActivePlayers(this.state).every((p) => p.bid !== null)) {
      this.state.players.forEach((p) => {
        if (p.isConnected) p.bidsRevealed = true;
      });
      this.state.phase = "TRICK";
      this.addLog("Toutes les enchères ont été révélées !");
    }

    this.bumpNonce();
    return true;
  }

  public playCard(
    playerId: string,
    cardId: string,
    tigressChoice?: "escape" | "pirate",
  ): PlayCardResult {
    if (this.state.phase !== "TRICK" || !this.state.round) return { ok: false };

    const player = this.state.players.find((p) => p.id === playerId);
    if (!player || !player.isConnected) return { ok: false };
    if (getCurrentActorId(this.state) !== playerId) return { ok: false };
    if (hasAlreadyPlayed(this.state, playerId)) return { ok: false };

    const card = player.hand.find((c) => c.id === cardId);
    if (!card) return { ok: false };
    if (
      card.special === "tigress" &&
      tigressChoice !== "escape" &&
      tigressChoice !== "pirate"
    ) {
      return { ok: false };
    }

    const currentTrick = this.state.round.currentTrick;
    if (!isCardLegal(card, player.hand, currentTrick.playedCards)) {
      return { ok: false };
    }

    player.hand = player.hand.filter((c) => c.id !== cardId);
    const playedCards = [
      ...currentTrick.playedCards,
      { playerId, card, tigressChoice },
    ];
    const specialPlayed = Boolean(card.special && card.special !== "escape");
    const activePlayers = getActivePlayers(this.state);

    if (playedCards.length < activePlayers.length) {
      this.state.round.currentTrick.playedCards = playedCards;
      this.bumpNonce();
      return { ok: true, trickComplete: false, specialPlayed };
    }

    const res = resolveTrickWinner(
      playedCards,
      this.state.config.enableFourteenBonus,
    );
    const winnerPlayer = this.state.players.find((p) => p.id === res.winnerId);
    if (winnerPlayer) {
      winnerPlayer.tricksWon += 1;
      winnerPlayer.capturedBonus += res.capturedBonus;
    }

    this.state.round.trickHistory.push({
      ...currentTrick,
      playedCards,
      winnerId: res.winnerId,
      capturedBonus: res.capturedBonus,
    });
    this.addLog(
      `Pli remporté par ${winnerPlayer?.name || "un pirate"}${
        res.capturedBonus ? ` (+${res.capturedBonus} bonus)` : ""
      }`,
    );

    const roundNum = this.state.round.roundNumber;
    if (this.state.round.trickHistory.length < roundNum) {
      this.state.round.currentTrick = {
        leadPlayerId: res.winnerId,
        playedCards: [],
      };
      this.bumpNonce();
      return {
        ok: true,
        trickComplete: true,
        capturedBonus: res.capturedBonus,
        specialPlayed,
        roundEnded: false,
      };
    }

    applyRoundScoring(this.state, roundNum, (t, ty) => this.addLog(t, ty));
    this.bumpNonce();
    return {
      ok: true,
      trickComplete: true,
      capturedBonus: res.capturedBonus,
      specialPlayed,
      roundEnded: true,
    };
  }

  public advanceFromScoring(): boolean {
    if (this.state.phase !== "SCORING" || !this.state.round) return false;
    const roundNum = this.state.round.roundNumber;
    const activePlayers = getActivePlayers(this.state);
    const currentDealerIdx = activePlayers.findIndex(
      (p) => p.id === this.state.round?.dealerId,
    );
    this.startRound(roundNum + 1, Math.max(0, currentDealerIdx) + 1);
    return true;
  }

  public restartGame(): void {
    this.state.players.forEach((p) => {
      p.score = 0;
      p.bid = null;
      p.bidsRevealed = false;
      p.tricksWon = 0;
      p.hand = [];
      p.capturedBonus = 0;
      p.isReady = p.isHost;
    });
    this.state.phase = "LOBBY";
    this.state.round = null;
    this.state.lastRoundScores = null;
    this.state.winnerId = undefined;
    this.addLog("Nouvelle partie démarrée dans le salon.");
    this.bumpNonce();
  }

  private bumpNonce(): void {
    this.state.turnNonce += 1;
  }

  private addLog(text: string, type = "info"): void {
    this.state.logs = [
      {
        id: `log-${Date.now()}-${Math.random()}`,
        text,
        timestamp: Date.now(),
        type,
      },
      ...this.state.logs,
    ].slice(0, 80);
  }
}
