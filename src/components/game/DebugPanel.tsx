import { useState } from "react";
import { Bug, ChevronDown, ChevronUp } from "lucide-react";
import {
  DEBUG_SPECIAL_BUTTONS,
  DEBUG_SUIT_BUTTONS,
} from "../../lib/debugCards.ts";
import type { SpecialType, Suit } from "../../core/types.ts";

interface DebugPanelProps {
  onGiveAllTypes: () => void;
  onAddSuit: (suit: Suit) => void;
  onAddSpecial: (special: SpecialType) => void;
  onClearHand: () => void;
}

export function DebugPanel({
  onGiveAllTypes,
  onAddSuit,
  onAddSpecial,
  onClearHand,
}: DebugPanelProps) {
  const [open, setOpen] = useState(true);

  return (
    <div className="fixed bottom-3 left-3 z-[80] max-w-[280px] rounded-xl border border-amber-700/50 bg-zinc-950/95 text-amber-50 shadow-2xl backdrop-blur-md">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-xs font-bold uppercase tracking-wider text-amber-400"
      >
        <span className="flex items-center gap-1.5">
          <Bug className="h-3.5 w-3.5" />
          Debug cartes
        </span>
        {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
      </button>

      {open && (
        <div className="space-y-2 border-t border-amber-900/40 px-3 py-2.5">
          <button
            type="button"
            onClick={onGiveAllTypes}
            className="w-full rounded-lg bg-amber-500 px-2 py-1.5 text-[11px] font-bold text-zinc-950 hover:bg-amber-400"
          >
            Toutes couleurs + spéciaux
          </button>

          <div>
            <p className="mb-1 text-[9px] font-bold uppercase tracking-widest text-zinc-500">
              Couleur (rang 7)
            </p>
            <div className="flex flex-wrap gap-1">
              {DEBUG_SUIT_BUTTONS.map(({ suit, label }) => (
                <button
                  key={suit}
                  type="button"
                  onClick={() => onAddSuit(suit)}
                  className="rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-[10px] font-bold text-zinc-200 hover:border-amber-500/50 hover:text-amber-200"
                >
                  + {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-1 text-[9px] font-bold uppercase tracking-widest text-zinc-500">
              Spécial
            </p>
            <div className="flex flex-wrap gap-1">
              {DEBUG_SPECIAL_BUTTONS.map(({ special, label }) => (
                <button
                  key={special}
                  type="button"
                  onClick={() => onAddSpecial(special)}
                  className="rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-[10px] font-bold text-zinc-200 hover:border-amber-500/50 hover:text-amber-200"
                >
                  + {label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={onClearHand}
            className="w-full rounded-lg border border-rose-900/50 px-2 py-1 text-[10px] font-bold text-rose-400 hover:bg-rose-950/40"
          >
            Vider ma main
          </button>
        </div>
      )}
    </div>
  );
}
