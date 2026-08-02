import React, { useState } from "react";
import { CopyRoomLinkButton } from "p2play-core";
import { LobbyHome } from "./LobbyHome.tsx";
import { SpectatorRolePanel } from "./SpectatorRolePanel.tsx";
import type { GameState, GameConfig } from "../../core/types.ts";

interface LobbyProps {
  myPeerId: string | null;
  hostPeerId: string | null;
  isHost: boolean;
  gameState: GameState;
  status: string;
  error: string | null;
  hostRoom: (name: string, avatar: string) => Promise<void>;
  joinRoom: (name: string, avatar: string, code: string) => Promise<void>;
  onToggleReady: (readyStatus?: boolean) => void;
  onStartGame: () => void;
  onDisconnect: () => void;
  onSetRole?: (peerId: string, role: "player" | "spectator") => void;
  onLockSpectator?: (peerId: string, locked: boolean) => void;
  onChangeConfig?: (config: Partial<GameConfig>) => void;
}

export const Lobby: React.FC<LobbyProps> = ({
  myPeerId,
  hostPeerId,
  isHost,
  gameState,
  status,
  error,
  hostRoom,
  joinRoom,
  onToggleReady,
  onStartGame,
  onDisconnect,
  onSetRole,
  onLockSpectator,
  onChangeConfig,
}) => {
  const [localReady, setLocalReady] = useState(false);

  const connectedPlayers = gameState?.players.filter((p) => p.isConnected) || [];
  const activeCount = connectedPlayers.length;
  const canStart =
    activeCount >= 2 && connectedPlayers.every((p) => p.isHost || p.isReady);
  const amPlayer = connectedPlayers.some((p) => p.id === myPeerId);

  const handleToggleReady = () => {
    const next = !localReady;
    setLocalReady(next);
    onToggleReady(next);
  };

  if (status === "CONNECTED" && myPeerId) {
    return (
      <div className="w-full max-w-2xl mx-auto p-6 bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-3xl shadow-2xl relative overflow-hidden text-zinc-100">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">
              Salon : {hostPeerId}
            </h1>
            {hostPeerId && (
              <CopyRoomLinkButton
                id="lobby-copy-btn"
                code={hostPeerId}
                className="bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300"
              />
            )}
          </div>
          <span className="text-xs px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full font-bold">
            {isHost ? "CAPITAINE" : "MARIN"}
          </span>
        </div>
        <p className="text-zinc-400 text-xs mb-6">
          Partagez ce code avec votre équipage pour lancer les enchères.
        </p>

        <div className="bg-zinc-950/60 border border-zinc-800 rounded-2xl p-4 mb-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3">
            Configuration de la Partie
          </h3>
          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between text-zinc-300 cursor-pointer">
              <div>
                <div className="font-bold">Indices de suivi de couleur</div>
                <div className="text-[10px] text-zinc-500">
                  Surbrillance des cartes légales à jouer
                </div>
              </div>
              <input
                type="checkbox"
                disabled={!isHost}
                checked={gameState?.config?.suitFollowHints ?? true}
                onChange={(e) =>
                  onChangeConfig?.({ suitFollowHints: e.target.checked })
                }
                className="w-4 h-4 rounded accent-amber-500 bg-zinc-800 border-zinc-700 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between text-zinc-300 cursor-pointer">
              <div>
                <div className="font-bold">Bonus carte 14 (+10 pts)</div>
                <div className="text-[10px] text-zinc-500">
                  Points additionnels si une carte 14 est capturée
                </div>
              </div>
              <input
                type="checkbox"
                disabled={!isHost}
                checked={gameState?.config?.enableFourteenBonus ?? false}
                onChange={(e) =>
                  onChangeConfig?.({ enableFourteenBonus: e.target.checked })
                }
                className="w-4 h-4 rounded accent-amber-500 bg-zinc-800 border-zinc-700 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between text-zinc-300 cursor-pointer">
              <div>
                <div className="font-bold">Ghost Pirate (Mode 2 Joueurs)</div>
                <div className="text-[10px] text-zinc-500">
                  Joueur virtuel en 2ᵉ position pour pimenter les duels 1v1
                </div>
              </div>
              <input
                type="checkbox"
                disabled={!isHost}
                checked={gameState?.config?.enableGhostPirate ?? true}
                onChange={(e) =>
                  onChangeConfig?.({ enableGhostPirate: e.target.checked })
                }
                className="w-4 h-4 rounded accent-amber-500 bg-zinc-800 border-zinc-700 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between text-zinc-300 cursor-pointer border-t border-zinc-800/80 pt-2">
              <div>
                <div className="font-bold text-rose-300">🐙 Léviathans (Kraken & Baleine Blanche)</div>
                <div className="text-[10px] text-zinc-500">
                  Kraken dévore les plis, Baleine Blanche détruit les pouvoirs
                </div>
              </div>
              <input
                type="checkbox"
                disabled={!isHost}
                checked={gameState?.config?.enableKrakenAndWhale ?? false}
                onChange={(e) =>
                  onChangeConfig?.({ enableKrakenAndWhale: e.target.checked })
                }
                className="w-4 h-4 rounded accent-rose-500 bg-zinc-800 border-zinc-700 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between text-zinc-300 cursor-pointer">
              <div>
                <div className="font-bold text-yellow-300">💰 Cartes Butin & Alliances (+20 pts)</div>
                <div className="text-[10px] text-zinc-500">
                  Alliances secrètes avec le gagnant du pli
                </div>
              </div>
              <input
                type="checkbox"
                disabled={!isHost}
                checked={gameState?.config?.enableLoot ?? false}
                onChange={(e) =>
                  onChangeConfig?.({ enableLoot: e.target.checked })
                }
                className="w-4 h-4 rounded accent-yellow-500 bg-zinc-800 border-zinc-700 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between text-zinc-300 cursor-pointer">
              <div>
                <div className="font-bold text-amber-300">⚔️ Pouvoirs Avancés des Pirates</div>
                <div className="text-[10px] text-zinc-500">
                  Rosie, Will, Rascal, Juanita et Harry débloquent leurs capacités
                </div>
              </div>
              <input
                type="checkbox"
                disabled={!isHost}
                checked={gameState?.config?.enablePiratePowers ?? false}
                onChange={(e) =>
                  onChangeConfig?.({ enablePiratePowers: e.target.checked })
                }
                className="w-4 h-4 rounded accent-amber-500 bg-zinc-800 border-zinc-700 cursor-pointer"
              />
            </label>

            <div className="flex items-center justify-between text-zinc-300 border-t border-zinc-800/80 pt-2">
              <div>
                <div className="font-bold">Système de Score</div>
                <div className="text-[10px] text-zinc-500">
                  {gameState?.config?.scoringMode === "RASCAL" ? "Potentiel fixe par manche" : "Classique Skull King"}
                </div>
              </div>
              <select
                disabled={!isHost}
                value={gameState?.config?.scoringMode ?? "CLASSIC"}
                onChange={(e) =>
                  onChangeConfig?.({ scoringMode: e.target.value as "CLASSIC" | "RASCAL" })
                }
                className="bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1 text-xs text-amber-300 cursor-pointer"
              >
                <option value="CLASSIC">Classique</option>
                <option value="RASCAL">Rascal (Potentiel Fixe)</option>
              </select>
            </div>

            {gameState?.config?.scoringMode === "RASCAL" && (
              <div className="flex items-center justify-between text-zinc-300 pl-3">
                <div>
                  <div className="font-bold text-sky-300">Option Rascal</div>
                  <div className="text-[10px] text-zinc-500">
                    {gameState?.config?.rascalOption === "BOULET_DE_CANON" ? "Poing fermé (15 pts/carte si exact, 0 si erreur)" : "Chevrotine (100%/50%/0%)"}
                  </div>
                </div>
                <select
                  disabled={!isHost}
                  value={gameState?.config?.rascalOption ?? "CHEVROTINE"}
                  onChange={(e) =>
                    onChangeConfig?.({ rascalOption: e.target.value as "CHEVROTINE" | "BOULET_DE_CANON" })
                  }
                  className="bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1 text-xs text-sky-300 cursor-pointer"
                >
                  <option value="CHEVROTINE">Chevrotine (Main ouverte)</option>
                  <option value="BOULET_DE_CANON">Boulet de Canon (Poing fermé)</option>
                </select>
              </div>
            )}

            <div className="flex items-center justify-between text-zinc-300 border-t border-zinc-800/80 pt-2">
              <div>
                <div className="font-bold">Structure des Manches</div>
                <div className="text-[10px] text-zinc-500">
                  Nombre et progression des cartes distribuées
                </div>
              </div>
              <select
                disabled={!isHost}
                value={gameState?.config?.roundStructure ?? "STANDARD"}
                onChange={(e) =>
                  onChangeConfig?.({ roundStructure: e.target.value as any })
                }
                className="bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1 text-xs text-amber-300 cursor-pointer"
              >
                <option value="STANDARD">Standard (10 manches : 1➔10 cartes)</option>
                <option value="EVEN_ONLY">Pas d'impair (5 manches : 2, 4, 6, 8, 10)</option>
                <option value="READY_FOR_BATTLE">Prêt au combat (5 manches : 6➔10)</option>
                <option value="LIGHTNING">Attaque éclair (5 manches de 5)</option>
                <option value="BARRAGE">Tir de barrage (10 manches de 10)</option>
                <option value="WHIRLWIND">Tourbillon (5 manches : 9, 7, 5, 3, 1)</option>
              </select>
            </div>
          </div>
        </div>

        <SpectatorRolePanel
          players={connectedPlayers}
          spectators={gameState?.spectators || []}
          spectatorLocks={gameState?.spectatorLocks || {}}
          myPeerId={myPeerId}
          isHost={isHost}
          onSetRole={onSetRole || (() => {})}
          onLockSpectator={onLockSpectator || (() => {})}
        />

        <div className="flex flex-col gap-3 mb-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
            Équipage connecté ({connectedPlayers.length})
            {(gameState?.spectators?.length ?? 0) > 0 && (
              <span className="text-sky-300/80 normal-case tracking-normal ml-2">
                · 👁 {gameState.spectators.length} spectateur(s)
              </span>
            )}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {connectedPlayers.map((player) => (
              <div
                key={player.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-zinc-950/80 border border-zinc-800"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{player.avatar}</span>
                  <div>
                    <span className="font-bold text-sm text-zinc-100">
                      {player.name}
                    </span>
                    {player.id === myPeerId && (
                      <span className="ml-2 text-xs text-amber-400">(Vous)</span>
                    )}
                  </div>
                </div>
                <span
                  className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase ${
                    player.isHost
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      : player.isReady
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                        : "bg-zinc-800 text-zinc-500"
                  }`}
                >
                  {player.isHost
                    ? "Capitaine"
                    : player.isReady
                      ? "Prêt"
                      : "En attente"}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-zinc-800">
          {!isHost && amPlayer && (
            <button
              type="button"
              onClick={handleToggleReady}
              className={`flex-1 py-3 px-6 rounded-2xl font-black text-sm uppercase tracking-wider transition ${
                localReady
                  ? "bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-lg shadow-amber-500/20"
                  : "bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
              }`}
            >
              {localReady ? "Pas Prêt" : "Je suis Prêt !"}
            </button>
          )}

          {isHost && (
            <button
              type="button"
              onClick={onStartGame}
              disabled={!canStart}
              className="flex-1 py-3 px-6 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-zinc-950 font-black text-sm uppercase tracking-wider disabled:opacity-40 shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              Lancer la partie ({activeCount} marin
              {activeCount > 1 ? "s" : ""})
            </button>
          )}

          <button
            type="button"
            onClick={onDisconnect}
            className="py-3 px-6 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs transition"
          >
            Quitter
          </button>
        </div>
      </div>
    );
  }

  return (
    <LobbyHome
      status={status}
      error={error}
      hostRoom={hostRoom}
      joinRoom={joinRoom}
    />
  );
};
