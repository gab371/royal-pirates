import { test, expect } from "@playwright/test";

test.describe("Royal Pirates - Standalone UI & Game Engine", () => {
  test("renders homepage lobby correctly", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("body")).toContainText("ROYAL PIRATES");
    await expect(page.getByRole("heading", { name: /ROYAL PIRATES/i })).toBeVisible();
  });

  test("can create a room and use testHooks to verify game state", async ({ page }) => {
    await page.goto("/");

    // Wait for P2PlayLobby to be visible
    await expect(page.getByPlaceholder(/nom/i)).toBeVisible();
    await page.getByPlaceholder(/nom/i).fill("Capitaine Test");

    // Click "Créer un salon"
    await page.getByRole("button", { name: /Créer un salon/i }).click();

    // Now in game lobby, testHooks are initialized
    await expect(page.locator("text=Salon :")).toBeVisible({ timeout: 10000 });

    // Use testHooks to inject a 2-player BIDDING game state
    await page.evaluate(() => {
      const hooks = (window as any).__testHooks__;
      const currentState = hooks.getState();
      const myId = currentState.players[0]?.id || "p1";

      const state = {
        phase: "BIDDING",
        config: { suitFollowHints: true, enableFourteenBonus: false },
        players: [
          { id: myId, name: "Barbe Noire", avatar: "🏴‍☠️", score: 0, bid: null, bidsRevealed: false, tricksWon: 0, hand: [{ id: "yellow-5", suit: "yellow", rank: 5 }], capturedBonus: 0, isConnected: true },
          { id: "p2", name: "Anne Bonny", avatar: "👑", score: 0, bid: null, bidsRevealed: false, tricksWon: 0, hand: [{ id: "blue-10", suit: "blue", rank: 10 }], capturedBonus: 0, isConnected: true }
        ],
        spectators: [],
        spectatorLocks: {},
        lastRoundScores: null,
        round: {
          roundNumber: 1,
          totalRounds: 10,
          dealerId: myId,
          currentTrick: { leadPlayerId: myId, playedCards: [] },
          trickHistory: [],
          bidsSubmitted: {}
        },
        turnNonce: 1,
        logs: [{ id: "log-1", text: "Manche 1 / 10", timestamp: Date.now() }]
      };

      hooks.setState(state);
    });

    await expect(page.locator("text=Manche 1 / 10").first()).toBeVisible();
    await expect(page.locator("text=Annonce tes plis")).toBeVisible();

    // Verify state from testHooks
    const state = await page.evaluate(() => (window as any).__testHooks__.getState());
    expect(state.phase).toBe("BIDDING");
    expect(state.players.length).toBe(2);
  });
});
