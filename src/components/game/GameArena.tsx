import type { GameState, PlayedCard } from "../../core/types.ts";
import { getLeadSuit } from "../../core/suitFollow.ts";
import { getCurrentActorId } from "../../core/turnOrder.ts";
import { assignSeats, SEAT_META, type SeatFacing, type SeatId } from "./seats.ts";
import { LocalHand, MiniHand } from "./LocalHand.tsx";
import { PirateCardFace } from "./PirateCardFace.tsx";
import { AuctionPanel } from "./AuctionPanel.tsx";
import { Scoreboard } from "./Scoreboard.tsx";

import { PiratePowerModal } from "./PiratePowerModal.tsx";

interface GameArenaProps {
  gameState: GameState;
  myPeerId: string | null;
  isHost: boolean;
  onPlayCard: (cardId: string, tigressChoice?: "escape" | "pirate") => void;
  onPlaceBid: (bid: number) => void;
  onAdvanceTrick: () => void;
  onAdvanceRound: () => void;
  onRestartGame: () => void;
  onUseRosie?: (targetPlayerId: string) => void;
  onUseWill?: (discardCardIds: string[]) => void;
  onUseRascal?: (bonusBet: 0 | 10 | 20) => void;
  onUseHarry?: (bidDelta: -1 | 0 | 1) => void;
}

function OpponentSeat({
  player,
  active,
  facing,
  className,
}: {
  player: GameState["players"][number];
  active: boolean;
  facing: SeatFacing;
  className: string;
}) {
  const bid = player.bid === null ? "—" : String(player.bid);

  return (
    <div className={`player-seat ${className} ${active ? "active-turn" : ""}`}>
      <div className="player-avatar">{player.avatar}</div>
      <div className="player-info">
        <span className="player-name">
          {player.name} ({player.score} pts)
        </span>
        <span className="player-meta">
          E:{bid} · P:{player.tricksWon} · {player.hand.length} carte
          {player.hand.length > 1 ? "s" : ""}
        </span>
      </div>
      <MiniHand count={player.hand.length} facing={facing} />
    </div>
  );
}

const SEAT_IDS = Object.keys(SEAT_META) as SeatId[];

export function GameArena({
  gameState,
  myPeerId,
  isHost,
  onPlayCard,
  onPlaceBid,
  onAdvanceTrick,
  onAdvanceRound,
  onRestartGame,
  onUseRosie,
  onUseWill,
  onUseRascal,
  onUseHarry,
}: GameArenaProps) {
  const me = gameState.players.find((p) => p.id === myPeerId);
  const activeId = getCurrentActorId(gameState);
  const isMyTurn = gameState.phase === "TRICK" && activeId === myPeerId;
  const seats = assignSeats(
    gameState.players.filter((p) => p.isConnected),
    myPeerId,
  );
  const currentTrick = gameState.round?.currentTrick;
  const played = currentTrick?.playedCards ?? [];
  const trickWinnerId = currentTrick?.winnerId;
  const trickResolved = Boolean(trickWinnerId);
  const leadSuit = trickResolved ? null : getLeadSuit(played);
  const activeName =
    gameState.players.find((p) => p.id === activeId)?.name ?? "…";
  const trickWinner = gameState.players.find((p) => p.id === trickWinnerId);
  const round = gameState.round;
  const roundDone =
    trickResolved &&
    (round?.trickHistory.length ?? 0) >= (round?.roundNumber ?? 0);

  const bidDisplay =
    me?.bid === null || me?.bid === undefined ? "—" : String(me.bid);

  const roundNum = round?.roundNumber ?? 1;
  const totalRounds = round?.totalRounds ?? 10;
  const dealer = gameState.players.find((p) => p.id === round?.dealerId);
  const phaseLabel =
    gameState.phase === "BIDDING"
      ? "Phase d'Enchères"
      : gameState.phase === "TRICK"
        ? trickResolved
          ? "Pli terminé"
          : "Phase de Plis"
        : gameState.phase === "SCORING"
          ? "Phase des Scores"
          : gameState.phase === "GAME_OVER"
            ? "Fin de Partie"
            : "";

  return (
    <div className="game-arena">
      <div className="table-felt">
        <div className="round-hud">
          <div className="round-hud-num">{roundNum}</div>
          <div>
            <div>
              <span className="round-hud-title">
                Manche {roundNum} / {totalRounds}
              </span>
              {phaseLabel && (
                <span className="round-hud-phase">{phaseLabel}</span>
              )}
            </div>
            {dealer && (
              <div className="round-hud-meta">
                Distributeur :{" "}
                <strong>
                  {dealer.avatar} {dealer.name}
                </strong>
              </div>
            )}
          </div>
        </div>

        {leadSuit && gameState.phase === "TRICK" && (
          <div className="lead-suit-badge">
            Couleur demandée :{" "}
            <strong>
              {leadSuit === "yellow" && "🟡 Jaune"}
              {leadSuit === "green" && "🟢 Vert"}
              {leadSuit === "blue" && "🔵 Bleu"}
              {leadSuit === "black" && "🖤 Atout"}
            </strong>
          </div>
        )}

        {SEAT_IDS.map((id) => {
          const player = seats[id];
          if (!player) return null;
          const meta = SEAT_META[id];
          return (
            <OpponentSeat
              key={player.id}
              player={player}
              active={player.id === activeId && gameState.phase === "TRICK"}
              facing={meta.facing}
              className={meta.className}
            />
          );
        })}

        <div className="center-play-zone">
          {gameState.phase === "BIDDING" && (
            <div className="arena-overlay">
              <AuctionPanel
                gameState={gameState}
                localPlayerId={myPeerId || ""}
                onPlaceBid={onPlaceBid}
              />
            </div>
          )}

          {(gameState.phase === "SCORING" ||
            gameState.phase === "GAME_OVER") && (
            <div className="arena-overlay">
              <Scoreboard
                gameState={gameState}
                isHost={isHost}
                onAdvanceRound={onAdvanceRound}
                onRestartGame={onRestartGame}
              />
            </div>
          )}

          {(gameState.phase === "TRICK" ||
            (gameState.phase === "BIDDING" && played.length > 0)) && (
            <div className="trick-cards">
              {played.length === 0 ? (
                <div className="text-center text-zinc-500">
                  <div className="mb-1 text-3xl opacity-40">⚓</div>
                  <p className="text-xs font-semibold">
                    En attente du premier coup…
                  </p>
                </div>
              ) : (
                played.map((pc: PlayedCard) => {
                  const owner = gameState.players.find(
                    (p) => p.id === pc.playerId,
                  );
                  return (
                    <div
                      key={`${pc.playerId}-${pc.card.id}`}
                      className="flex flex-col items-center gap-1"
                    >
                      <div className="h-36 w-24">
                        <PirateCardFace
                          card={pc.card}
                          tigressChoice={pc.tigressChoice}
                        />
                      </div>
                      <span className="max-w-[96px] truncate text-[11px] font-semibold text-zinc-300">
                        {owner?.avatar} {owner?.name}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {gameState.phase === "TRICK" && !trickResolved && (
            <div className="turn-banner">
              {isMyTurn ? "C'est TOI de jouer !" : `Tour de ${activeName}`}
            </div>
          )}

          {gameState.phase === "TRICK" && trickResolved && (
            <div className="trick-resolve-panel">
              <div className="turn-banner">
                Pli remporté par {trickWinner?.avatar}{" "}
                {trickWinner?.name ?? "…"}
                {currentTrick?.capturedBonus
                  ? ` (+${currentTrick.capturedBonus})`
                  : ""}
              </div>
              {isHost ? (
                <button
                  type="button"
                  className="trick-advance-btn"
                  onClick={onAdvanceTrick}
                >
                  {roundDone ? "Voir les scores" : "Pli suivant"}
                </button>
              ) : (
                <p className="trick-advance-wait">
                  En attente du capitaine…
                </p>
              )}
            </div>
          )}
        </div>

        <div
          className={`seat-bottom ${gameState.phase === "BIDDING" ? "seat-bottom-bidding" : ""}`}
        >
          <div
            className={`local-player-header ${isMyTurn ? "active-turn" : ""}`}
          >
            <div className="player-avatar">{me?.avatar ?? "🏴‍☠️"}</div>
            <span className="player-name">
              {me?.name ?? "Moi"} ({me?.score ?? 0} pts)
            </span>
            <span className="player-meta">
              E:{bidDisplay} · P:{me?.tricksWon ?? 0}
            </span>
          </div>

          {(gameState.phase === "TRICK" || gameState.phase === "BIDDING") && (
            <LocalHand
              gameState={gameState}
              myPeerId={myPeerId}
              onPlayCard={onPlayCard}
            />
          )}
        </div>
      </div>

      {me && (
        <PiratePowerModal
          me={me}
          players={gameState.players}
          onUseRosie={onUseRosie || (() => {})}
          onUseWill={onUseWill || (() => {})}
          onUseRascal={onUseRascal || (() => {})}
          onUseHarry={onUseHarry || (() => {})}
          onCloseJuanita={() => {
            me.unseenCardsViewed = undefined;
          }}
        />
      )}
    </div>
  );
}
