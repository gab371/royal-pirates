import { usePeer as useCorePeer, type PeerManagerLike } from "p2play-core";
import type { GameState } from "../core/types.ts";
import { soundFX } from "../core/soundFX.ts";

export interface UsePeerProps {
  externalPeerManager?: PeerManagerLike<GameState>;
}

export function usePeer(options?: UsePeerProps) {
  return useCorePeer<GameState>({
    externalPeerManager: options?.externalPeerManager,
    namespacePrefix: "pirates",
    sounds: {
      click: () => soundFX.playClick(),
      bid: () => soundFX.playBid(),
      card: () => soundFX.playCard(),
      trickWin: () => soundFX.playTrickWin(),
      special: () => soundFX.playSpecialSting(),
      victory: () => soundFX.playVictory(),
    },
  });
}
