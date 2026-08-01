export interface ScoreResult {
  roundScore: number;
  bidHit: boolean;
  baseScore: number;
  capturedBonus: number;
}

export function calculatePlayerRoundScore(
  bid: number,
  tricksWon: number,
  capturedBonus: number,
  roundNumber: number,
): ScoreResult {
  let baseScore = 0;
  let bidHit = false;

  if (bid > 0) {
    if (tricksWon === bid) {
      bidHit = true;
      baseScore = bid * 20;
    } else {
      bidHit = false;
      baseScore = -Math.abs(tricksWon - bid) * 10;
    }
  } else {
    // Bid === 0
    if (tricksWon === 0) {
      bidHit = true;
      baseScore = roundNumber * 10;
    } else {
      bidHit = false;
      baseScore = -roundNumber * 10;
    }
  }

  // Bonus is awarded only if bid was hit (standard Skull King rule)
  const finalBonus = bidHit ? capturedBonus : 0;
  const roundScore = baseScore + finalBonus;

  return {
    roundScore,
    bidHit,
    baseScore,
    capturedBonus: finalBonus,
  };
}
