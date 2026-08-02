import React, { useState } from "react";
import type { Card, Player } from "../../core/types.ts";
import { getCardName, getSuitEmoji } from "../../core/decks.ts";

interface PiratePowerModalProps {
  me: Player;
  players: Player[];
  onUseRosie: (targetPlayerId: string) => void;
  onUseWill: (discardCardIds: string[]) => void;
  onUseRascal: (bonusBet: 0 | 10 | 20) => void;
  onUseHarry: (bidDelta: -1 | 0 | 1) => void;
  onCloseJuanita: () => void;
}

export const PiratePowerModal: React.FC<PiratePowerModalProps> = ({
  me,
  players,
  onUseRosie,
  onUseWill,
  onUseRascal,
  onUseHarry,
  onCloseJuanita,
}) => {
  const [selectedDiscards, setSelectedDiscards] = useState<string[]>([]);
  const pendingPower = me.piratePowerPending;

  if (!pendingPower && !me.unseenCardsViewed) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-zinc-900 border border-amber-500/50 rounded-3xl p-6 shadow-2xl text-zinc-100 relative">
        {pendingPower === "rosie" && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">🌹</span>
              <div>
                <h3 className="text-lg font-black text-amber-400">Pouvoir de Rosie la Douce</h3>
                <p className="text-xs text-zinc-400">
                  Choisissez le pirate qui entamera le prochain pli !
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-2 mb-4">
              {players
                .filter((p) => p.isConnected)
                .map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => onUseRosie(p.id)}
                    className="flex items-center justify-between p-3 rounded-2xl bg-zinc-800 hover:bg-amber-600/30 border border-zinc-700 hover:border-amber-500 text-left transition"
                  >
                    <span className="font-bold text-sm">
                      {p.avatar} {p.name} {p.id === me.id ? "(Vous)" : ""}
                    </span>
                    <span className="text-xs text-amber-400 font-semibold">Entamer ➔</span>
                  </button>
                ))}
            </div>
          </div>
        )}

        {pendingPower === "will" && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">🏴‍☠️</span>
              <div>
                <h3 className="text-lg font-black text-amber-400">Pouvoir de Will le Bandit</h3>
                <p className="text-xs text-zinc-400">
                  Vous avez pioché 2 cartes. Sélectionnez **2 cartes** de votre main à défausser ({selectedDiscards.length}/2).
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto mb-4 p-1">
              {me.hand.map((card: Card) => {
                const isSelected = selectedDiscards.includes(card.id);
                return (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setSelectedDiscards(selectedDiscards.filter((id) => id !== card.id));
                      } else if (selectedDiscards.length < 2) {
                        setSelectedDiscards([...selectedDiscards, card.id]);
                      }
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition ${
                      isSelected
                        ? "bg-rose-950/80 border-rose-500 text-rose-200 ring-2 ring-rose-500"
                        : "bg-zinc-800 border-zinc-700 text-zinc-200 hover:border-zinc-500"
                    }`}
                  >
                    <span>{getSuitEmoji(card)}</span>
                    <span className="truncate">{getCardName(card)}</span>
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              disabled={selectedDiscards.length !== 2}
              onClick={() => onUseWill(selectedDiscards)}
              className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-zinc-950 font-black text-sm uppercase tracking-wider transition"
            >
              Défausser les 2 cartes
            </button>
          </div>
        )}

        {pendingPower === "rascal" && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">🎲</span>
              <div>
                <h3 className="text-lg font-black text-amber-400">Pouvoir de Rascal le Flambeur</h3>
                <p className="text-xs text-zinc-400">
                  Parier un bonus secret. Gagné si votre mise est exacte en fin de manche, perdu sinon !
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[0, 10, 20].map((bet) => (
                <button
                  key={bet}
                  type="button"
                  onClick={() => onUseRascal(bet as 0 | 10 | 20)}
                  className="py-4 px-3 rounded-2xl bg-zinc-800 hover:bg-amber-500 hover:text-zinc-950 border border-zinc-700 font-black text-base text-center transition"
                >
                  +{bet} pts
                </button>
              ))}
            </div>
          </div>
        )}

        {pendingPower === "juanita" && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">🔮</span>
              <div>
                <h3 className="text-lg font-black text-cyan-300">Vision de Juanita Jade</h3>
                <p className="text-xs text-zinc-400">
                  Cartes restées cachées dans le talon pour cette manche ({me.unseenCardsViewed?.length || 0}) :
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-60 overflow-y-auto mb-4 p-1">
              {me.unseenCardsViewed?.map((card: Card) => (
                <div
                  key={card.id}
                  className="p-2 rounded-xl bg-zinc-950 border border-cyan-500/40 text-xs font-bold flex items-center gap-1.5 text-cyan-200"
                >
                  <span>{getSuitEmoji(card)}</span>
                  <span className="truncate">{getCardName(card)}</span>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={onCloseJuanita}
              className="w-full py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-black text-sm uppercase tracking-wider transition"
            >
              Compris !
            </button>
          </div>
        )}

        {pendingPower === "harry" && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">💪</span>
              <div>
                <h3 className="text-lg font-black text-amber-400">Pouvoir d'Harry le Géant</h3>
                <p className="text-xs text-zinc-400">
                  Modifiez votre mise de la manche (+1 ou -1) ! (Mise actuelle : {me.bid ?? 0})
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <button
                type="button"
                onClick={() => onUseHarry(-1)}
                className="py-3 px-2 rounded-2xl bg-zinc-800 hover:bg-rose-600 text-zinc-100 border border-zinc-700 font-black text-sm text-center transition"
              >
                -1 à la mise
              </button>
              <button
                type="button"
                onClick={() => onUseHarry(0)}
                className="py-3 px-2 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700 font-black text-sm text-center transition"
              >
                Inchangée (0)
              </button>
              <button
                type="button"
                onClick={() => onUseHarry(1)}
                className="py-3 px-2 rounded-2xl bg-zinc-800 hover:bg-emerald-600 text-zinc-100 border border-zinc-700 font-black text-sm text-center transition"
              >
                +1 à la mise
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
