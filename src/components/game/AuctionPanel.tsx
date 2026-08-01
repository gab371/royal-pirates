import React, { useState } from "react";
import type { GameState } from "../../core/types.ts";

interface AuctionPanelProps {
  gameState: GameState;
  localPlayerId: string;
  onPlaceBid: (bid: number) => void;
}

export const AuctionPanel: React.FC<AuctionPanelProps> = ({
  gameState,
  localPlayerId,
  onPlaceBid,
}) => {
  const roundNum = gameState.round?.roundNumber || 1;
  const localPlayer =
    gameState.players.find((p) => p.id === localPlayerId) ||
    gameState.players.find((p) => p.isConnected) ||
    gameState.players[0];

  const [selectedBid, setSelectedBid] = useState<number>(0);

  if (gameState.phase !== "BIDDING" || !localPlayer) return null;

  const hasSubmittedBid = localPlayer.bid !== null;

  return (
    <div className="auction-panel">
      <h3 className="auction-panel-title">
        <span>🏴‍☠️</span> Annonce tes plis
      </h3>
      <p className="auction-panel-hint">
        Manche {roundNum} — regarde ta main en bas, puis choisis 0→{roundNum}
      </p>

      {hasSubmittedBid ? (
        <div className="auction-panel-waiting">
          <div className="auction-panel-bid-value">
            Enchère : {localPlayer.bid} pli{localPlayer.bid! > 1 ? "s" : ""}
          </div>
          <p className="auction-panel-waiting-text">En attente de l&apos;équipage…</p>
        </div>
      ) : (
        <>
          <div className="auction-panel-bids">
            {Array.from({ length: roundNum + 1 }, (_, i) => i).map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setSelectedBid(num)}
                className={`auction-bid-btn ${selectedBid === num ? "selected" : ""}`}
              >
                {num}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => onPlaceBid(selectedBid)}
            className="auction-confirm-btn"
          >
            Valider ({selectedBid} pli{selectedBid > 1 ? "s" : ""})
          </button>
        </>
      )}
    </div>
  );
};
