# 🏴‍☠️ Royal Pirates (Skull King) - P2P Edition

[![Deploy to GitHub Pages](https://github.com/gab371/royal-pirates/actions/workflows/deploy.yml/badge.svg)](https://github.com/gab371/royal-pirates/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

**Royal Pirates** est un jeu de plis, de paris et de piraterie multijoueur Peer-to-Peer standalone basé sur WebRTC, jouable directement dans votre navigateur sans serveur intermédiaire.

Inspiré du célèbre jeu de cartes *Skull King*, cette version propose un univers pirate immersif, une gestion dynamique des enchères de plis et des effets de cartes spéciales (Pirates, Skull King, Sirènes, Fuites).

---

## 🎮 Démo en Ligne

Jouez directement sur votre navigateur sans aucune installation :
👉 **[Jouer à la démo en ligne](https://gab371.github.io/royal-pirates/)**

---

## ✨ Fonctionnalités Clés

- **Connexion P2P via [`p2play-core`](https://github.com/gab371/p2play-core)** (≥ v0.6.6) : PeerJS, lobby partagé, chat, présence, partage de lien de salon.
- **Thème Piraterie Immersif** : Interface aux couleurs océaniques et sombres, cartes illustrées et effets sonores marins.
- **Phase d'Annonce des Plis (Bidding)** : Pariez secrètement sur le nombre exact de plis que vous pensez réaliser à chaque manche.
- **Moteur de Résolution des Plis** : Prise en charge des règles de demande de couleur, atouts, et bonus de capture (Skull King vs Pirate, Sirène vs Skull King).
- **Tchat & Historique en Direct** : Discussion P2P via `p2play-core/chat` pour célébrer vos captures et provoquer vos adversaires.
- **Hub P2Play** : Build lib montable dans [hub-p2play](https://github.com/gab371/hub-p2play).

---

## 🛠️ Lancement Local

### Prérequis
- **Node.js** (v20 ou supérieur recommandé)
- **npm**

### Instructions

1. **Cloner le projet** :
   ```bash
   git clone https://github.com/gab371/royal-pirates.git
   cd royal-pirates
   ```
2. **Installer les dépendances** :
   ```bash
   npm install
   ```
3. **Lancer le serveur de développement** :
   ```bash
   npm run dev
   ```
4. **Ouvrir dans le navigateur** :
   Ouvrez `http://localhost:5173/` (ou le port indiqué par Vite).
   *Pour tester à deux sur la même machine, ouvrez un deuxième onglet ou un autre navigateur.*

5. **Compiler pour la production** :
   ```bash
   npm run build
   ```

---

## 🏛️ Architecture du Projet

Le projet suit des principes stricts de séparation des responsabilités pour garantir la testabilité et la maintenabilité :
- **`/src/core`** : Moteur de jeu pur (gestion des manches, distribution, résolution des plis, calcul des scores et bonus) écrit en TypeScript pur, sans aucune dépendance UI ou réseau.
- **Réseau** : [`p2play-core`](https://github.com/gab371/p2play-core) (`usePeer`, `P2PlayLobby`, présence, chat) — pas de `PeerManager` local.
- **`/src/hooks`** : Custom hooks liant l'état de jeu réactif et les événements réseau au cycle de vie de React.
- **`/src/components`** : Composants d'interface (plateau de jeu, cartes, modaux de pari, tchat).

Dépendance typique :
```json
"p2play-core": "github:gab371/p2play-core#v0.6.6"
```

---

## 📄 Licence

Ce projet est distribué sous licence MIT.
