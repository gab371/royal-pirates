import React from "react";

interface TigressModalProps {
  isOpen: boolean;
  onConfirm: (choice: "escape" | "pirate") => void;
  onCancel: () => void;
}

export const TigressModal: React.FC<TigressModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-orange-500/50 rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center animate-in zoom-in-95 duration-150">
        <div className="text-5xl mb-2">🐯</div>
        <h3 className="text-xl font-black text-orange-400 mb-1">
          Choix de la Tigresse
        </h3>
        <p className="text-xs text-slate-300 mb-6">
          Comment souhaitez-vous jouer la Tigresse pour ce pli ?
        </p>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            onClick={() => onConfirm("escape")}
            className="p-4 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-2xl flex flex-col items-center gap-1 transition shadow hover:border-slate-400 active:scale-95"
          >
            <span className="text-3xl">🏳️</span>
            <span className="font-bold text-slate-200 text-xs">Jouer comme Fuite</span>
            <span className="text-[10px] text-slate-400">Ne gagne aucun pli</span>
          </button>

          <button
            onClick={() => onConfirm("pirate")}
            className="p-4 bg-amber-950/80 hover:bg-amber-900/90 border border-amber-500/60 rounded-2xl flex flex-col items-center gap-1 transition shadow hover:border-amber-400 active:scale-95"
          >
            <span className="text-3xl">🏴‍☠️</span>
            <span className="font-bold text-amber-300 text-xs">Jouer comme Pirate</span>
            <span className="text-[10px] text-amber-400/80">Bat les cartes de couleur</span>
          </button>
        </div>

        <button
          onClick={onCancel}
          className="text-xs text-slate-400 hover:text-slate-200 font-semibold"
        >
          Annuler
        </button>
      </div>
    </div>
  );
};
