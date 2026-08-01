import { describe, expect, it } from "vitest";
import { calculatePlayerRoundScore } from "./scoring.ts";

describe("scoring", () => {
  it("awards 20 per trick when bid is hit", () => {
    const res = calculatePlayerRoundScore(3, 3, 0, 5);
    expect(res.bidHit).toBe(true);
    expect(res.baseScore).toBe(60);
    expect(res.roundScore).toBe(60);
  });

  it("penalizes miss by 10 per difference", () => {
    const res = calculatePlayerRoundScore(2, 4, 30, 5);
    expect(res.bidHit).toBe(false);
    expect(res.baseScore).toBe(-20);
    expect(res.capturedBonus).toBe(0);
    expect(res.roundScore).toBe(-20);
  });

  it("awards roundNumber * 10 for successful zero bid", () => {
    const res = calculatePlayerRoundScore(0, 0, 0, 7);
    expect(res.bidHit).toBe(true);
    expect(res.baseScore).toBe(70);
  });

  it("penalizes failed zero bid", () => {
    const res = calculatePlayerRoundScore(0, 1, 40, 4);
    expect(res.bidHit).toBe(false);
    expect(res.baseScore).toBe(-40);
    expect(res.capturedBonus).toBe(0);
  });

  it("keeps capture bonus only when bid is hit", () => {
    const hit = calculatePlayerRoundScore(1, 1, 40, 3);
    expect(hit.roundScore).toBe(20 + 40);

    const miss = calculatePlayerRoundScore(1, 0, 40, 3);
    expect(miss.roundScore).toBe(-10);
  });
});
