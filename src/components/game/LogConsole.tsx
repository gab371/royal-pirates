import React from "react";
import { JournalPanel } from "p2play-core/chat";
import type { LogEntry } from "../../core/types.ts";

interface LogConsoleProps {
  logs: LogEntry[];
}

export const LogConsole: React.FC<LogConsoleProps> = ({ logs }) => {
  const entries = (logs || []).map((log) => ({
    id: log.id,
    timestamp: new Date(log.timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    message: log.text,
    type: log.type || "info",
  }));

  return (
    <JournalPanel
      entries={entries}
      title="Journal de Bord"
      emptyLabel="L'histoire de la traversée reste à s'écrire..."
      className="bg-slate-900/80 backdrop-blur-md border border-amber-500/30 rounded-3xl p-5 shadow-xl flex flex-col h-full text-slate-100 text-xs overflow-hidden"
      maxHeight="220px"
      scrollbarAccent="amber"
    />
  );
};
