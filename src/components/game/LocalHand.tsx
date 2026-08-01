import { useState } from "react";
import type { Card, GameState } from "../../core/types.ts";
import { isCardLegal } from "../../core/suitFollow.ts";
import { getCurrentActorId } from "../../core/turnOrder.ts";
import { PirateCardFace } from "./PirateCardFace.tsx";
import { TigressModal } from "./TigressModal.tsx";
import type { SeatFacing } from "./seats.ts";

interface LocalHandProps {
  gameState: GameState;
  myPeerId: string | null;
  onPlayCard: (cardId: string, tigressChoice?: "escape" | "pirate") => void;
}

export function LocalHand({ gameState, myPeerId, onPlayCard }: LocalHandProps) {
  const [tigressId, setTigressId] = useState<string | null>(null);
  const me = gameState.players.find((p) => p.id === myPeerId);
  if (!me || me.hand.length === 0) return null;

  const currentTrick = gameState.round?.currentTrick;
  const isBidding = gameState.phase === "BIDDING";
  const isMyTurn =
    gameState.phase === "TRICK" && getCurrentActorId(gameState) === me.id;
  /** During bidding, hand stays bright so you can read cards before announcing plis. */
  const isBrowsing = isBidding;
  const hintsEnabled = gameState.config.suitFollowHints;
  const hand = me.hand;
  const n = hand.length;
  const spread = Math.min(n * 4.5, 36);
  const start = -spread / 2;
  const step = n > 1 ? spread / (n - 1) : 0;
  const spacing = Math.max(30, Math.min(68, 850 / Math.max(n, 1)));

  const clickCard = (card: Card) => {
    if (!isMyTurn) return;
    if (!isCardLegal(card, me.hand, currentTrick?.playedCards || [])) return;
    if (card.special === "tigress") setTigressId(card.id);
    else onPlayCard(card.id);
  };

  return (
    <>
      <div className={`hand-container ${isBrowsing ? "hand-browsing" : ""}`}>
        {hand.map((card, i) => {
          const rot = n > 1 ? start + i * step : 0;
          const x = (i - (n - 1) / 2) * spacing;
          const y = Math.pow(Math.abs(i - (n - 1) / 2), 1.8) * 1.5;
          const base = `translate(${x}px, ${y}px) rotate(${rot}deg)`;
          const legal = isCardLegal(
            card,
            me.hand,
            currentTrick?.playedCards || [],
          );
          const playable = isMyTurn && (!hintsEnabled || legal);
          const dimmed = !isBrowsing && !playable;

          return (
            <button
              key={card.id}
              type="button"
              className={`hand-card-item ${dimmed ? "disabled" : ""} ${isBrowsing ? "browsable" : ""}`}
              style={{ transform: base, zIndex: i + 1 }}
              disabled={!isBrowsing && !playable}
              aria-label={isBrowsing ? "Carte en main (enchères)" : undefined}
              onMouseEnter={(e) => {
                if (dimmed && !isBrowsing) return;
                e.currentTarget.style.transform = `translate(${x}px, -50px) rotate(0deg) scale(1.14)`;
                e.currentTarget.style.zIndex = "300";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = base;
                e.currentTarget.style.zIndex = String(i + 1);
              }}
              onClick={() => clickCard(card)}
            >
              <PirateCardFace card={card} />
            </button>
          );
        })}
      </div>

      <TigressModal
        isOpen={tigressId !== null}
        onConfirm={(choice) => {
          if (tigressId) onPlayCard(tigressId, choice);
          setTigressId(null);
        }}
        onCancel={() => setTigressId(null)}
      />
    </>
  );
}

export function MiniHand({
  count,
  facing = "south",
}: {
  count: number;
  facing?: SeatFacing;
}) {
  const n = Math.min(count, 10);
  const spread = Math.min(n * 5.5, 38);
  const start = -spread / 2;
  const step = n > 1 ? spread / (n - 1) : 0;
  const spacing = Math.max(7, Math.min(13, 140 / Math.max(n, 1)));

  if (count <= 0) return null;

  return (
    <div className={`mini-hand mini-hand-${facing}`}>
      {Array.from({ length: n }, (_, i) => {
        const rot = n > 1 ? start + i * step : 0;
        const x = (i - (n - 1) / 2) * spacing;
        return (
          <div
            key={i}
            className="mini-card-back"
            style={{ transform: `translateX(${x}px) rotate(${rot}deg)` }}
          />
        );
      })}
      {count > 10 && <span className="mini-more">+{count - 10}</span>}
    </div>
  );
}
