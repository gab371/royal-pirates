import React, { useState } from "react";
import type { PeerManagerLike } from "p2play-core";
import { RoomCodeBadge } from "p2play-core";
import { SoundToggle } from "p2play-core/ui";
import { FileText, Maximize2, Minimize2, Skull } from "lucide-react";
import { useGame } from "./hooks/useGame.ts";
import { useBoardExpand } from "./hooks/useBoardExpand.ts";
import { Lobby } from "./components/game/Lobby.tsx";
import { GameArena } from "./components/game/GameArena.tsx";
import { SideChrome } from "./components/game/SideChrome.tsx";
import { RulesModal } from "./components/game/RulesModal.tsx";
import { DebugPanel } from "./components/game/DebugPanel.tsx";
import { soundFX } from "./core/soundFX.ts";

declare const __APP_VERSION__: string;

export interface AppProps {
  isEmbedded?: boolean;
  externalPeerManager?: PeerManagerLike;
  onExit?: () => void;
  playerName?: string;
  playerAvatar?: string;
  isHost?: boolean;
  lateJoin?: boolean;
  gameConfig?: unknown;
  hubPhase?: string;
}

export const App: React.FC<AppProps> = ({
  isEmbedded = false,
  externalPeerManager,
  onExit,
  playerName = "Capitaine",
  playerAvatar = "🏴‍☠️",
  isHost = false,
  lateJoin = false,
  gameConfig,
  hubPhase,
}) => {
  const {
    gameState,
    isHost: activeHost,
    myPeerId,
    hostPeerId,
    status,
    error,
    chatMessages,
    hostRoom,
    joinRoom,
    toggleReady,
    startGame,
    changeConfig,
    placeBid,
    playCard,
    advanceTrick,
    advanceRound,
    restartGame,
    setRole,
    lockSpectator,
    sendChatMessage,
    disconnect,
    debugMode,
    debugGiveAllTypes,
    debugAddSuit,
    debugAddSpecial,
    debugClearHand,
  } = useGame({
    externalPeerManager,
    playerName,
    playerAvatar,
    isEmbedded,
    isHost,
    lateJoin,
    gameConfig,
    hubPhase,
  });

  const [showRules, setShowRules] = useState(false);
  const showLobby = !gameState || gameState.phase === "LOBBY";
  const { expanded: boardExpanded, toggle: toggleExpand } =
    useBoardExpand(showLobby);

  const exitFn = isEmbedded && onExit ? onExit : disconnect;
  const leaveGame = () => {
    if (isEmbedded && onExit) onExit();
    else disconnect();
  };

  const formattedChatMessages = (chatMessages || []).map((msg) => ({
    ...msg,
    type: "CHAT" as const,
  }));

  return (
    <div
      className={
        showLobby
          ? "relative flex min-h-screen flex-col justify-between bg-[radial-gradient(ellipse_at_center,#1b160a_0%,#09090b_100%)] px-4 py-8 font-sans text-slate-100 sm:px-6 lg:px-8"
          : "relative flex h-screen flex-col overflow-hidden bg-[radial-gradient(ellipse_at_center,#1b160a_0%,#09090b_100%)] px-4 py-3 font-sans text-slate-100 sm:px-6 lg:px-8"
      }
    >
      {!boardExpanded && (
        <header className="mx-auto mb-3 flex w-full max-w-7xl shrink-0 items-center justify-between border-b border-slate-900 pb-3">
          <div className="flex items-center gap-2">
            <Skull className="h-6 w-6 animate-pulse text-amber-500" />
            <span className="bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-xl font-serif font-black tracking-tight text-transparent whitespace-nowrap">
              ROYAL PIRATES
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowRules(true)}
              className="flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-300 transition-all hover:bg-slate-800 hover:text-slate-100"
              title="Règles du jeu"
            >
              <FileText className="h-3.5 w-3.5 text-amber-400" />
              <span>Règles</span>
            </button>

            <SoundToggle
              soundManager={soundFX}
              className="border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800"
            />

            {gameState && gameState.phase !== "LOBBY" && (
              <>
                {hostPeerId && (
                  <RoomCodeBadge
                    code={hostPeerId}
                    accentClassName="text-amber-400"
                  />
                )}
                <button
                  type="button"
                  onClick={leaveGame}
                  className="rounded-xl border border-rose-900/30 bg-rose-950/20 px-2.5 py-1.5 text-xs font-bold text-rose-400 transition-all hover:bg-rose-900/20"
                >
                  {isEmbedded ? (activeHost ? "← Hub" : "Quitter") : "Quitter"}
                </button>
              </>
            )}
          </div>
        </header>
      )}

      <main className="mx-auto flex w-full max-w-7xl min-h-0 flex-1 flex-col">
        {showLobby ? (
          <div className="flex min-h-[70vh] items-center justify-center">
            <Lobby
              myPeerId={myPeerId}
              hostPeerId={hostPeerId}
              isHost={activeHost}
              gameState={gameState}
              status={status}
              error={error}
              hostRoom={hostRoom}
              joinRoom={joinRoom}
              onToggleReady={toggleReady}
              onStartGame={startGame}
              onDisconnect={exitFn}
              onSetRole={setRole}
              onLockSpectator={lockSpectator}
              onChangeConfig={changeConfig}
            />
          </div>
        ) : (
          <div
            className={
              boardExpanded
                ? "board-stage board-stage-expanded"
                : "board-stage"
            }
          >
            <button
              type="button"
              className="board-expand-btn"
              title={
                boardExpanded
                  ? "Réduire la zone de jeu (Échap)"
                  : "Agrandir la zone de jeu"
              }
              aria-pressed={boardExpanded}
              onClick={toggleExpand}
            >
              {boardExpanded ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </button>

            <GameArena
              gameState={gameState!}
              myPeerId={myPeerId}
              isHost={activeHost}
              onPlayCard={playCard}
              onPlaceBid={placeBid}
              onAdvanceTrick={advanceTrick}
              onAdvanceRound={advanceRound}
              onRestartGame={restartGame}
            />

            <SideChrome
              logs={gameState!.logs || []}
              chatMessages={formattedChatMessages}
              onSend={sendChatMessage}
            />
          </div>
        )}
      </main>

      {!boardExpanded && (
        <footer className="mx-auto mt-2 flex w-full max-w-7xl shrink-0 items-center justify-between border-t border-slate-900 py-2 text-center text-[10px] text-slate-600">
          <div>
            Royal Pirates - Peer-to-Peer - v
            {typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "0.1.0"}
          </div>
          <span>P2Play Ecosystem</span>
        </footer>
      )}

      {showRules && <RulesModal onClose={() => setShowRules(false)} />}

      {debugMode && !showLobby && (
        <DebugPanel
          onGiveAllTypes={debugGiveAllTypes}
          onAddSuit={debugAddSuit}
          onAddSpecial={debugAddSpecial}
          onClearHand={debugClearHand}
        />
      )}
    </div>
  );
};

export default App;
