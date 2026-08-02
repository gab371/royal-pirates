export interface ScoreResult {
  roundScore: number;
  bidHit: boolean;
  baseScore: number;
  capturedBonus: number;
}

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
  scoringMode: "CLASSIC" | "RASCAL" = "CLASSIC",
  rascalOption: "CHEVROTINE" | "BOULET_DE_CANON" = "CHEVROTINE",
  cardsInRound: number = roundNumber,
): ScoreResult {
  let baseScore = 0;
  let bidHit = false;
  let finalBonus = 0;

  if (scoringMode === "RASCAL") {
    const diff = Math.abs(tricksWon - bid);
    if (rascalOption === "BOULET_DE_CANON") {
      if (diff === 0) {
        bidHit = true;
        baseScore = cardsInRound * 15;
        finalBonus = capturedBonus;
      } else {
        bidHit = false;
        baseScore = 0;
        finalBonus = 0;
      }
    } else {
      // CHEVROTINE
      if (diff === 0) {
        bidHit = true;
        baseScore = cardsInRound * 10;
        finalBonus = capturedBonus;
      } else if (diff === 1) {
        bidHit = false;
        baseScore = cardsInRound * 5;
        finalBonus = Math.floor(capturedBonus * 0.5);
      } else {
        bidHit = false;
        baseScore = 0;
        finalBonus = 0;
      }
    }
  } else {
    // CLASSIC SKULL KING SCORING
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
    finalBonus = bidHit ? capturedBonus : 0;
  }

  const roundScore = baseScore + finalBonus;

  return {
    roundScore,
    bidHit,
    baseScore,
    capturedBonus: finalBonus,
  };
}
