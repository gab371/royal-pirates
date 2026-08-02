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

export const GHOST_PIRATE_ID = "ghost-pirate";

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
        enableGhostPirate: true,
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
    const activeHumans = getActivePlayers(this.state).filter((p) => !p.isBot);
    if (activeHumans.length < 2) return false;

    if (activeHumans.length === 2 && this.state.config.enableGhostPirate !== false) {
      this.ensureGhostPirate();
    } else {
      this.removeGhostPirate();
    }

    this.state.lastRoundScores = null;
    this.startRound(1, 0);
    return true;
  }

  public startRound(roundNumber: number, dealerIdx: number): void {
    dealRound(this.state, roundNumber, dealerIdx, (t, ty) => this.addLog(t, ty));
    this.bumpNonce();
    this.autoPlayGhostPirateIfNeeded();
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
      this.autoPlayGhostPirateIfNeeded();
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
      this.autoPlayGhostPirateIfNeeded();
      return { ok: true, trickComplete: false, specialPlayed };
    }

    // Last card: resolve winner but keep cards on the table until host advances.
    const res = resolveTrickWinner(
      playedCards,
      this.state.config.enableFourteenBonus,
    );
    const winnerPlayer = this.state.players.find((p) => p.id === res.winnerId);
    if (winnerPlayer) {
      winnerPlayer.tricksWon += 1;
      winnerPlayer.capturedBonus += res.capturedBonus;

      // Check Pirate Powers
      if (this.state.config.enablePiratePowers && res.winnerCard.card.special === "pirate" && res.winnerCard.playerId === res.winnerId) {
        const pirateName = res.winnerCard.card.pirateName;
        if (pirateName) {
          winnerPlayer.piratePowerPending = pirateName;
          if (pirateName === "will" && this.state.round?.deckRemainder) {
            const drawn = this.state.round.deckRemainder.splice(0, 2);
            winnerPlayer.hand.push(...drawn);
            this.addLog(`Will le Bandit fait piocher 2 cartes à ${winnerPlayer.name}. Choisissez 2 cartes à défausser.`, "power");
          } else if (pirateName === "juanita" && this.state.round?.deckRemainder) {
            winnerPlayer.unseenCardsViewed = [...this.state.round.deckRemainder];
            this.addLog(`Juanita Jade révèle ${this.state.round.deckRemainder.length} cartes du talon à ${winnerPlayer.name} !`, "power");
          } else if (pirateName === "rosie") {
            this.addLog(`Rosie la Douce permet à ${winnerPlayer.name} de choisir qui entame le pli suivant !`, "power");
          } else if (pirateName === "rascal") {
            this.addLog(`Rascal le Flambeur permet à ${winnerPlayer.name} de parier des points bonus !`, "power");
          } else if (pirateName === "harry") {
            this.addLog(`Harry le Géant permet à ${winnerPlayer.name} d'ajuster sa mise de +1 ou -1 !`, "power");
          }
        }
      }
    }

    if (res.alliancesFormed && this.state.round) {
      this.state.round.alliances.push(...res.alliancesFormed);
    }

    const resolvedTrick = {
      ...currentTrick,
      playedCards,
      winnerId: res.winnerId || undefined,
      capturedBonus: res.capturedBonus,
      destroyedByKraken: res.destroyedByKraken,
      destroyedByWhale: res.destroyedByWhale,
      alliancesFormed: res.alliancesFormed,
    };
    this.state.round.currentTrick = resolvedTrick;
    this.state.round.trickHistory.push(resolvedTrick);

    if (res.destroyedByKraken) {
      this.addLog("🐙 Le Kraken a dévoré le pli ! Aucune personne ne marque ce pli.", "warning");
    } else if (res.destroyedByWhale) {
      this.addLog("🐳 La Baleine Blanche a détruit toutes les cartes spéciales ! Le pli est défaussé.", "warning");
    } else {
      this.addLog(
        `Pli remporté par ${winnerPlayer?.name || "un pirate"}${
          res.capturedBonus ? ` (+${res.capturedBonus} bonus)` : ""
        }`,
      );
    }

    const roundEnded =
      this.state.round.trickHistory.length >= this.state.round.cardsInRound;
    this.bumpNonce();
    return {
      ok: true,
      trickComplete: true,
      capturedBonus: res.capturedBonus,
      specialPlayed,
      roundEnded,
    };
  }

  /** Host-only: clear resolved trick → next trick, or scoring if round is done. */
  public advanceTrick(): boolean {
    if (this.state.phase !== "TRICK" || !this.state.round) return false;
    const trick = this.state.round.currentTrick;
    if (!trick.winnerId && !trick.destroyedByKraken && !trick.destroyedByWhale) return false;

    const roundNum = this.state.round.roundNumber;
    if (this.state.round.trickHistory.length < this.state.round.cardsInRound) {
      let nextLeadId = trick.winnerId;

      // Handle Kraken / Whale next lead override if set
      const lastRes = resolveTrickWinner(
        trick.playedCards,
        this.state.config.enableFourteenBonus,
      );
      if (lastRes.leadForNextTrickId) {
        nextLeadId = lastRes.leadForNextTrickId;
      }

      if (nextLeadId === GHOST_PIRATE_ID) {
        const humanPlayers = getActivePlayers(this.state).filter((p) => !p.isBot);
        const prevLeadIdx = humanPlayers.findIndex(
          (p) => p.id === trick.leadPlayerId,
        );
        const nextHumanIdx = (prevLeadIdx + 1) % Math.max(1, humanPlayers.length);
        nextLeadId =
          humanPlayers[nextHumanIdx]?.id ||
          humanPlayers[0]?.id ||
          trick.leadPlayerId;
      }

      this.state.round.currentTrick = {
        leadPlayerId: nextLeadId || trick.leadPlayerId,
        playedCards: [],
      };
      this.bumpNonce();
      this.autoPlayGhostPirateIfNeeded();
      return true;
    }

    applyRoundScoring(this.state, roundNum, (t, ty) => this.addLog(t, ty));
    this.bumpNonce();
    return true;
  }

  public useRosiePower(playerId: string, targetPlayerId: string): boolean {
    const player = this.state.players.find((p) => p.id === playerId);
    if (!player || player.piratePowerPending !== "rosie") return false;
    if (!this.state.players.some((p) => p.id === targetPlayerId)) return false;

    if (this.state.round) {
      this.state.round.currentTrick.leadPlayerId = targetPlayerId;
    }
    player.piratePowerPending = undefined;
    const target = this.state.players.find((p) => p.id === targetPlayerId);
    this.addLog(`🌹 ${player.name} a désigné ${target?.name} pour lancer le prochain pli.`, "power");
    this.bumpNonce();
    return true;
  }

  public useWillPower(playerId: string, discardCardIds: string[]): boolean {
    const player = this.state.players.find((p) => p.id === playerId);
    if (!player || player.piratePowerPending !== "will") return false;
    if (discardCardIds.length !== 2) return false;

    player.hand = player.hand.filter((c) => !discardCardIds.includes(c.id));
    player.piratePowerPending = undefined;
    this.addLog(`🏴‍☠️ ${player.name} a défaussé 2 cartes suite au pouvoir de Will le Bandit.`, "power");
    this.bumpNonce();
    return true;
  }

  public useRascalPower(playerId: string, bonusBet: 0 | 10 | 20): boolean {
    const player = this.state.players.find((p) => p.id === playerId);
    if (!player || player.piratePowerPending !== "rascal") return false;

    player.rascalBonusBet = bonusBet;
    player.piratePowerPending = undefined;
    this.addLog(`🎲 ${player.name} a parié ${bonusBet} pts bonus avec Rascal le Flambeur !`, "power");
    this.bumpNonce();
    return true;
  }

  public useHarryPower(playerId: string, bidDelta: -1 | 0 | 1): boolean {
    const player = this.state.players.find((p) => p.id === playerId);
    if (!player || player.piratePowerPending !== "harry") return false;

    const oldBid = player.bid ?? 0;
    const newBid = Math.max(0, oldBid + bidDelta);
    player.bid = newBid;
    if (this.state.round) {
      this.state.round.bidsSubmitted[playerId] = newBid;
    }
    player.piratePowerPending = undefined;
    this.addLog(
      `💪 ${player.name} a ajusté sa mise à ${newBid} (${bidDelta >= 0 ? "+" : ""}${bidDelta}) grâce à Harry le Géant !`,
      "power",
    );
    this.bumpNonce();
    return true;
  }

  public autoPlayGhostPirateIfNeeded(): void {
    if (this.state.phase !== "TRICK" || !this.state.round) return;
    const currentActorId = getCurrentActorId(this.state);
    if (currentActorId !== GHOST_PIRATE_ID) return;

    const botPlayer = this.state.players.find((p) => p.id === GHOST_PIRATE_ID);
    if (!botPlayer || botPlayer.hand.length === 0) return;

    const topCard = botPlayer.hand[0];
    const tigressChoice = topCard.special === "tigress" ? "escape" : undefined;
    this.playCard(GHOST_PIRATE_ID, topCard.id, tigressChoice);
  }

  private ensureGhostPirate(): void {
    if (!this.state.players.some((p) => p.id === GHOST_PIRATE_ID)) {
      this.state.players.push({
        id: GHOST_PIRATE_ID,
        name: "Ghost Pirate",
        avatar: "🏴‍☠️",
        score: 0,
        bid: 0,
        bidsRevealed: true,
        tricksWon: 0,
        hand: [],
        capturedBonus: 0,
        isConnected: true,
        isReady: true,
        isHost: false,
        isBot: true,
      });
    }
  }

  private removeGhostPirate(): void {
    this.state.players = this.state.players.filter((p) => !p.isBot);
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
