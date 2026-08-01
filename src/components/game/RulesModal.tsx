import React from "react";

interface RulesModalProps {
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-amber-500/40 rounded-3xl p-6 max-w-xl w-full max-h-[85vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-150 text-slate-200">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
          <h2 className="text-xl font-black text-amber-400 flex items-center gap-2">
            <span>📜</span> Règles de Royal Pirates
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-100 text-lg font-bold px-2 py-0.5 rounded-lg hover:bg-slate-800"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 text-xs leading-relaxed">
          <div className="p-3 bg-amber-950/40 border border-amber-800/40 rounded-xl">
            <h3 className="font-bold text-amber-300 text-sm mb-1">🎯 Objectif du Jeu</h3>
            <p>
              Prédire exactement le nombre de plis que vous allez remporter à chaque manche (de 1 à 10 cartes distribuées sur 10 manches).
            </p>
          </div>

          <div>
            <h3 className="font-bold text-slate-100 text-sm mb-2">🃏 Les Cartes du Deck (66 cartes)</h3>
            <ul className="space-y-1.5 list-disc list-inside text-slate-300">
              <li><strong className="text-amber-400">4 Couleurs (1-13) :</strong> Jaune 🟡, Vert 🟢, Bleu 🔵 et Atout Noir 🖤.</li>
              <li><strong className="text-slate-200">🏳️ 5 Fuites :</strong> Ne remportent jamais de pli (sauf si le pli ne contient que des Fuites).</li>
              <li><strong className="text-amber-400">🏴‍☠️ 5 Pirates :</strong> Battent tous les Atouts et toutes les cartes de couleur.</li>
              <li><strong className="text-cyan-300">🧜‍♀️ 2 Sirènes :</strong> Battent toutes les cartes de couleur et Pirates, et battent le Roi des Crânes !</li>
              <li><strong className="text-purple-300">👑 1 Roi des Crânes :</strong> Bat tous les Pirates et cartes (sauf s'il y a une Sirène dans le pli).</li>
              <li><strong className="text-orange-400">🐯 1 Tigresse :</strong> Choix au moment de jouer : Fuite 🏳️ ou Pirate 🏴‍☠️.</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-slate-100 text-sm mb-2">⚔️ Triangle des Cartes Spéciales</h3>
            <div className="grid grid-cols-3 gap-2 text-center font-bold">
              <div className="p-2.5 bg-cyan-950/60 border border-cyan-500/40 rounded-xl text-cyan-300">
                🧜‍♀️ Sirène
                <div className="text-[10px] font-normal text-slate-400 mt-1">Bat le Roi des Crânes (+40 pts)</div>
              </div>
              <div className="p-2.5 bg-purple-950/60 border border-purple-500/40 rounded-xl text-purple-300">
                👑 Roi des Crânes
                <div className="text-[10px] font-normal text-slate-400 mt-1">Bat les Pirates (+30/pirate)</div>
              </div>
              <div className="p-2.5 bg-amber-950/60 border border-amber-500/40 rounded-xl text-amber-300">
                🏴‍☠️ Pirate
                <div className="text-[10px] font-normal text-slate-400 mt-1">Bat la Sirène (sans Roi)</div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-slate-100 text-sm mb-2">📊 Décompte des Points</h3>
            <ul className="space-y-1 list-disc list-inside text-slate-300">
              <li><strong className="text-emerald-400">Enchère réussie (N &gt; 0) :</strong> N × 20 points + bonus de capture.</li>
              <li><strong className="text-rose-400">Enchère ratée (N &gt; 0) :</strong> -|Plis Réalisés - Enchère| × 10 points.</li>
              <li><strong className="text-emerald-400">Enchère Zéro réussie :</strong> Manche × 10 points.</li>
              <li><strong className="text-rose-400">Enchère Zéro ratée :</strong> -Manche × 10 points.</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition shadow-md"
          >
            Fermer les Règles
          </button>
        </div>
      </div>
    </div>
  );
};
