import React from "react";

interface RulesModalProps {
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-amber-500/40 rounded-3xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-150 text-slate-200">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800 sticky top-0 bg-slate-900 z-10">
          <h2 className="text-xl font-black text-amber-400 flex items-center gap-2">
            <span>📜</span> Règles de Royal Pirates & Extensions
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-100 text-lg font-bold px-2 py-0.5 rounded-lg hover:bg-slate-800 transition"
          >
            ✕
          </button>
        </div>

        <div className="space-y-5 text-xs leading-relaxed">
          {/* Objectif */}
          <div className="p-3 bg-amber-950/40 border border-amber-800/40 rounded-xl">
            <h3 className="font-bold text-amber-300 text-sm mb-1">🎯 Objectif du Jeu</h3>
            <p>
              Prédire exactement le nombre de plis que vous allez remporter à chaque manche.
            </p>
          </div>

          {/* Cartes de base */}
          <div>
            <h3 className="font-bold text-slate-100 text-sm mb-2">🃏 Les Cartes de Base (70 cartes)</h3>
            <ul className="space-y-1.5 list-disc list-inside text-slate-300">
              <li><strong className="text-amber-400">4 Couleurs (1-14) :</strong> Jaune 🟡, Vert 🟢, Bleu 🔵 et Atout Noir 🖤 (56 cartes).</li>
              <li><strong className="text-slate-200">🏳️ 5 Fuites :</strong> Perdent toujours les plis (sauf si le pli ne contient que des Fuites).</li>
              <li><strong className="text-amber-400">🏴‍☠️ 5 Pirates :</strong> Battent toutes les couleurs et les Sirènes (mais perdent contre le Roi des Crânes !).</li>
              <li><strong className="text-cyan-300">🧜‍♀️ 2 Sirènes :</strong> Battent toutes les couleurs et le Roi des Crânes (mais perdent contre les Pirates !).</li>
              <li><strong className="text-purple-300">👑 1 Roi des Crânes :</strong> Bat tous les Pirates et couleurs (mais perd contre la Sirène !).</li>
              <li><strong className="text-orange-400">🐯 1 Tigresse :</strong> Choix au moment de jouer : Fuite 🏳️ ou Pirate 🏴‍☠️.</li>
            </ul>
          </div>

          {/* Pierre Feuille Ciseaux */}
          <div>
            <h3 className="font-bold text-slate-100 text-sm mb-2">⚔️ Triangle des Cartes Spéciales</h3>
            <div className="grid grid-cols-3 gap-2 text-center font-bold">
              <div className="p-2.5 bg-cyan-950/60 border border-cyan-500/40 rounded-xl text-cyan-300">
                🧜‍♀️ Sirène
                <div className="text-[10px] font-normal text-slate-400 mt-1">Bat le Roi des Crânes (+40 pts)</div>
              </div>
              <div className="p-2.5 bg-purple-950/60 border border-purple-500/40 rounded-xl text-purple-300">
                👑 Roi des Crânes
                <div className="text-[10px] font-normal text-slate-400 mt-1">Bat les Pirates (+30 pts/pirate)</div>
              </div>
              <div className="p-2.5 bg-amber-950/60 border border-amber-500/40 rounded-xl text-amber-300">
                🏴‍☠️ Pirate
                <div className="text-[10px] font-normal text-slate-400 mt-1">Bat les Sirènes (sans Roi)</div>
              </div>
            </div>
          </div>

          {/* Extensions Optionnelles */}
          <div className="border-t border-slate-800 pt-4">
            <h3 className="font-bold text-amber-400 text-sm mb-3">⚙️ Règles Optionnelles & Extensions (Activables au Salon)</h3>

            <div className="space-y-3">
              {/* Léviathans */}
              <div className="p-3 bg-rose-950/30 border border-rose-800/40 rounded-xl">
                <h4 className="font-bold text-rose-300 text-xs mb-1">🐙 Léviathans (Kraken & Baleine Blanche)</h4>
                <ul className="space-y-1 list-disc list-inside text-slate-300 text-[11px]">
                  <li><strong>Kraken (1 carte) :</strong> Dévore le pli. Pli défaussé sans vainqueur ni bonus. Le gagnant virtuel entame le pli suivant.</li>
                  <li><strong>Baleine Blanche (1 carte) :</strong> Neutralise toutes les cartes spéciales. La plus forte carte numérotée (1-14) l'emporte quelle que soit sa couleur.</li>
                  <li><strong>Eaux Agitées :</strong> Si le Kraken et la Baleine sont joués ensemble, la 2ᵉ créature posée applique son effet.</li>
                </ul>
              </div>

              {/* Butin */}
              <div className="p-3 bg-yellow-950/30 border border-yellow-800/40 rounded-xl">
                <h4 className="font-bold text-yellow-300 text-xs mb-1">💰 Cartes Butin & Alliances (+20 pts)</h4>
                <p className="text-slate-300 text-[11px]">
                  Le joueur d'une carte Butin forme une alliance avec le gagnant du pli. Si les deux alliés réussissent leur pari en fin de manche ➔ <strong>+20 pts bonus chacun</strong>.
                </p>
              </div>

              {/* Pouvoirs Pirates */}
              <div className="p-3 bg-amber-950/30 border border-amber-800/40 rounded-xl">
                <h4 className="font-bold text-amber-300 text-xs mb-1">⚔️ Pouvoirs Avancés des 5 Pirates</h4>
                <ul className="space-y-1 list-disc list-inside text-slate-300 text-[11px]">
                  <li><strong>Rosie la Douce :</strong> Choisissez le joueur qui entamera le pli suivant.</li>
                  <li><strong>Will le Bandit :</strong> Piochez 2 cartes du talon et défaussez 2 cartes de votre main.</li>
                  <li><strong>Rascal le Flambeur :</strong> Pariez un bonus secret de 0, 10 ou 20 points.</li>
                  <li><strong>Juanita Jade :</strong> Révèle secrètement les cartes non distribuées du talon.</li>
                  <li><strong>Harry le Géant :</strong> Ajustez votre propre mise de la manche (+1, -1 ou 0).</li>
                </ul>
              </div>

              {/* Mode Rascal & Options */}
              <div className="p-3 bg-sky-950/30 border border-sky-800/40 rounded-xl">
                <h4 className="font-bold text-sky-300 text-xs mb-1">📊 Variantes de Score & Manches</h4>
                <ul className="space-y-1 list-disc list-inside text-slate-300 text-[11px]">
                  <li><strong>Système Rascal (Potentiel Fixe) :</strong> Points basés sur le potentiel de la manche (Chevrotine : 100%/50%/0% ; Boulet de canon : 15 pts/carte si exact, 0 si erreur).</li>
                  <li><strong>Structures de Manches :</strong> Choisissez parmi 6 rythmes de partie (Standard 1-10, Pas d'impair 2-10, Prêt au combat 6-10, Attaque éclair 5x5, Tir de barrage 10x10, Tourbillon 9-1).</li>
                  <li><strong>Ghost Pirate (Mode 2 Joueurs) :</strong> Ajoute un joueur virtuel automatique en 2ᵉ position pour pimenter les duels 1v1.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Score Classique */}
          <div>
            <h3 className="font-bold text-slate-100 text-sm mb-2">📊 Décompte des Points (Mode Classique)</h3>
            <ul className="space-y-1 list-disc list-inside text-slate-300">
              <li><strong className="text-emerald-400">Enchère réussie (N &gt; 0) :</strong> N × 20 points + bonus de capture.</li>
              <li><strong className="text-rose-400">Enchère ratée (N &gt; 0) :</strong> -|Plis Réalisés - Enchère| × 10 points.</li>
              <li><strong className="text-emerald-400">Enchère Zéro réussie :</strong> Manche × 10 points.</li>
              <li><strong className="text-rose-400">Enchère Zéro ratée :</strong> -Manche × 10 points.</li>
              <li><strong className="text-amber-400">Bonus carte 14 (Option) :</strong> +10 points par carte 14 capturée.</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 text-center sticky bottom-0 bg-slate-900">
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
