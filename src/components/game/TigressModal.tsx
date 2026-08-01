import { createPortal } from "react-dom";

interface TigressModalProps {
  isOpen: boolean;
  onConfirm: (choice: "escape" | "pirate") => void;
  onCancel: () => void;
}

export function TigressModal({
  isOpen,
  onConfirm,
  onCancel,
}: TigressModalProps) {
  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
      style={{ pointerEvents: "auto" }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="tigress-modal-title"
    >
      <div className="w-full max-w-sm rounded-3xl border border-orange-500/50 bg-slate-900 p-6 text-center shadow-2xl">
        <div className="mb-2 text-5xl" aria-hidden>
          🐯
        </div>
        <h3
          id="tigress-modal-title"
          className="mb-1 text-xl font-black text-orange-400"
        >
          Choix de la Tigresse
        </h3>
        <p className="mb-6 text-xs text-slate-300">
          Comment souhaitez-vous jouer la Tigresse pour ce pli ?
        </p>

        <div className="mb-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onConfirm("escape")}
            className="flex flex-col items-center gap-1 rounded-2xl border border-slate-600 bg-slate-800 p-4 transition hover:border-slate-400 hover:bg-slate-700 active:scale-95"
          >
            <span className="text-3xl" aria-hidden>
              🏳️
            </span>
            <span className="text-xs font-bold text-slate-200">
              Jouer comme Fuite
            </span>
            <span className="text-[10px] text-slate-400">
              Ne gagne aucun pli
            </span>
          </button>

          <button
            type="button"
            onClick={() => onConfirm("pirate")}
            className="flex flex-col items-center gap-1 rounded-2xl border border-amber-500/60 bg-amber-950/80 p-4 transition hover:border-amber-400 hover:bg-amber-900/90 active:scale-95"
          >
            <span className="text-3xl" aria-hidden>
              🏴‍☠️
            </span>
            <span className="text-xs font-bold text-amber-300">
              Jouer comme Pirate
            </span>
            <span className="text-[10px] text-amber-400/80">
              Bat les cartes de couleur
            </span>
          </button>
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="text-xs font-semibold text-slate-400 hover:text-slate-200"
        >
          Annuler
        </button>
      </div>
    </div>,
    document.body,
  );
}
