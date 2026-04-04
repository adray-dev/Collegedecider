import { LIKELIHOOD_MAP } from "./constants";
import type { Variable, SchoolScore, LikelihoodLabel } from "./types";

export function computeScore(variables: Variable[], school: "A" | "B"): SchoolScore {
  const totalWeight = variables.reduce((sum, v) => sum + v.weight, 0);

  if (totalWeight === 0) {
    return { score: 0, sd: 0, ciLow: 0, ciHigh: 0, isValid: false };
  }

  const eligible = variables.filter((v) => {
    const likelihood = school === "A" ? v.likelihoodA : v.likelihoodB;
    return v.weight > 0 && likelihood !== "";
  });

  if (eligible.length === 0) {
    return { score: 0, sd: 0, ciLow: 0, ciHigh: 0, isValid: false };
  }

  let score = 0;
  let variance = 0;

  for (const v of eligible) {
    const w = v.weight / totalWeight;
    const label = (school === "A" ? v.likelihoodA : v.likelihoodB) as LikelihoodLabel;
    const p = LIKELIHOOD_MAP[label];
    score += w * p;
    variance += w * w * p * (1 - p);
  }

  const scorePct = score * 100;
  const sd = Math.sqrt(variance) * 100;
  const ciLow = Math.max(0, scorePct - 1.96 * sd);
  const ciHigh = Math.min(100, scorePct + 1.96 * sd);

  return {
    score: Math.round(scorePct * 10) / 10,
    sd: Math.round(sd * 10) / 10,
    ciLow: Math.round(ciLow * 10) / 10,
    ciHigh: Math.round(ciHigh * 10) / 10,
    isValid: true,
  };
}
