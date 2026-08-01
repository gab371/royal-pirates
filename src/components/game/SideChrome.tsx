import { useState } from "react";
import { MessageSquare, ScrollText, X } from "lucide-react";
import { TextChatPanel } from "p2play-core/chat";
import type { ChatMessage } from "p2play-core";
import type { LogEntry } from "../../core/types.ts";
import { LogConsole } from "./LogConsole.tsx";

interface SideChromeProps {
  logs: LogEntry[];
  chatMessages: ChatMessage[];
  onSend: (text: string) => void;
}

export function SideChrome({ logs, chatMessages, onSend }: SideChromeProps) {
  const [showJournal, setShowJournal] = useState(false);
  const [showChat, setShowChat] = useState(false);

  return (
    <div className="side-chrome">
      {showJournal && (
        <div className="side-panel">
          <div className="side-panel-head">
            <span>Journal</span>
            <button
              type="button"
              className="side-panel-close"
              onClick={() => setShowJournal(false)}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="h-[280px]">
            <LogConsole logs={logs} />
          </div>
        </div>
      )}

      {showChat && (
        <div className="side-panel">
          <div className="side-panel-head">
            <span>Chat</span>
            <button
              type="button"
              className="side-panel-close"
              onClick={() => setShowChat(false)}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <TextChatPanel
            messages={chatMessages}
            onSend={onSend}
            title=""
            placeholder="Écrire un message…"
            emptyLabel="Aucun message pour le moment."
            className="flex h-[280px] flex-col rounded-2xl border border-amber-500/25 bg-zinc-900/85 p-4 text-xs text-zinc-100 shadow-xl backdrop-blur-md"
            scrollbarAccent="amber"
          />
        </div>
      )}

      <div className="side-chrome-fabs">
        <button
          type="button"
          className={`side-fab ${showJournal ? "active" : ""}`}
          title="Journal"
          aria-pressed={showJournal}
          onClick={() => {
            setShowJournal((v) => !v);
            if (!showJournal) setShowChat(false);
          }}
        >
          <ScrollText className="h-4 w-4" />
        </button>
        <button
          type="button"
          className={`side-fab ${showChat ? "active" : ""}`}
          title="Chat"
          aria-pressed={showChat}
          onClick={() => {
            setShowChat((v) => !v);
            if (!showChat) setShowJournal(false);
          }}
        >
          <MessageSquare className="h-4 w-4" />
          {chatMessages.length > 0 && !showChat && (
            <span className="side-fab-dot" />
          )}
        </button>
      </div>
    </div>
  );
}
