import React from "react";
import type { GameState } from "../../core/types.ts";

interface ScoreboardProps {
  gameState: GameState;
  isHost: boolean;
  onAdvanceRound?: () => void;
  onRestartGame?: () => void;
}

export const Scoreboard: React.FC<ScoreboardProps> = ({
  gameState,
  isHost,
  onAdvanceRound,
  onRestartGame,
}) => {
  const lines = gameState.lastRoundScores;
  const winner = gameState.players.find((p) => p.id === gameState.winnerId);
  const isGameOver = gameState.phase === "GAME_OVER";
  const isScoring = gameState.phase === "SCORING";

  if (!isScoring && !isGameOver) return null;

  const rows =
    lines && lines.length > 0
      ? [...lines].sort((a, b) => b.totalScore - a.totalScore)
      : [...gameState.players]
          .filter((p) => p.isConnected)
          .sort((a, b) => b.score - a.score)
          .map((p) => ({
            playerId: p.id,
            name: p.name,
            bid: p.bid ?? 0,
            tricksWon: p.tricksWon,
            baseScore: 0,
            capturedBonus: 0,
            roundScore: 0,
            bidHit: false,
            totalScore: p.score,
          }));

  return (
    <div className="bg-slate-900/95 border border-amber-500/40 rounded-3xl p-6 max-w-xl mx-auto shadow-2xl animate-in zoom-in-95">
      <h3 className="text-xl font-black text-amber-400 text-center mb-1">
        {isGameOver ? "Fin de Partie" : "Scores de la Manche"}
      </h3>
      {isGameOver && winner && (
        <p className="text-center text-sm text-slate-300 mb-4">
          Capitaine {winner.avatar} <strong className="text-amber-300">{winner.name}</strong>{" "}
          l’emporte avec <strong className="text-amber-300">{winner.score}</strong> points !
        </p>
      )}
      {!isGameOver && (
        <p className="text-center text-xs text-slate-400 mb-4">
          Manche {gameState.round?.roundNumber ?? "?"} terminée
        </p>
      )}

      <div className="space-y-2 mb-6">
        {rows.map((line, idx) => (
          <div
            key={line.playerId}
            className={`flex items-center justify-between gap-3 px-3 py-2 rounded-xl border text-sm ${
              idx === 0
                ? "bg-amber-500/10 border-amber-500/40 text-amber-100"
                : "bg-slate-950/60 border-slate-800 text-slate-200"
            }`}
          >
            <div className="min-w-0">
              <div className="font-bold truncate">
                {idx + 1}. {line.name}
              </div>
              {lines && (
                <div className="text-[10px] text-slate-400">
                  Enchère {line.bid} · Plis {line.tricksWon}
                  {line.bidHit ? " · OK" : " · raté"}
                  {line.capturedBonus > 0 ? ` · +${line.capturedBonus} bonus` : ""}
                </div>
              )}
            </div>
            <div className="text-right shrink-0">
              {lines && (
                <div
                  className={`text-xs font-bold ${
                    line.roundScore >= 0 ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {line.roundScore >= 0 ? "+" : ""}
                  {line.roundScore}
                </div>
              )}
              <div className="text-base font-black text-amber-300">{line.totalScore}</div>
            </div>
          </div>
        ))}
      </div>

      {isScoring && isHost && onAdvanceRound && (
        <button
          type="button"
          onClick={onAdvanceRound}
          className="w-full py-3 bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 font-black rounded-2xl text-sm"
        >
          Manche suivante
        </button>
      )}

      {isGameOver && isHost && onRestartGame && (
        <button
          type="button"
          onClick={onRestartGame}
          className="w-full py-3 bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 font-black rounded-2xl text-sm"
        >
          Rejouer une partie
        </button>
      )}

      {(isScoring || isGameOver) && !isHost && (
        <p className="text-center text-xs text-slate-500">
          En attente du Capitaine…
        </p>
      )}
    </div>
  );
};
