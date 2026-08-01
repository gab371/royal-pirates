import type { PiratesGameEngine } from "../core/gameEngine.ts";
import type { Card, GameState } from "../core/types.ts";

const TEST_HOOKS_ENABLED =
  import.meta.env.DEV || import.meta.env.VITE_TEST_HOOKS === "true";

export function installTestHooks(options: {
  getEngine: () => PiratesGameEngine | null;
  getGuestState: () => GameState | null;
  getFallbackState: () => GameState;
  broadcast: (state: GameState) => void;
}): () => void {
  if (typeof window === "undefined" || !TEST_HOOKS_ENABLED) {
    return () => undefined;
  }

  (window as unknown as { __testHooks__?: Record<string, unknown> }).__testHooks__ =
    {
      getState: () =>
        options.getEngine()?.state ||
        options.getGuestState() ||
        options.getFallbackState(),
      setState: (newState: GameState) => {
        const engine = options.getEngine();
        if (!engine) return;
        engine.state = newState;
        options.broadcast(newState);
      },
      setPhase: (phase: GameState["phase"]) => {
        const engine = options.getEngine();
        if (!engine) return;
        engine.state.phase = phase;
        options.broadcast(engine.state);
      },
      forceHands: (hands: Record<string, Card[]>) => {
        const engine = options.getEngine();
        if (!engine) return;
        for (const [id, hand] of Object.entries(hands)) {
          const p = engine.state.players.find((pl) => pl.id === id);
          if (p) p.hand = hand;
        }
        options.broadcast(engine.state);
      },
      forceBids: (bids: Record<string, number>) => {
        const engine = options.getEngine();
        if (!engine) return;
        for (const [id, bid] of Object.entries(bids)) {
          engine.submitBid(id, bid);
        }
        options.broadcast(engine.state);
      },
    };

  return () => {
    delete (window as unknown as { __testHooks__?: unknown }).__testHooks__;
  };
}
