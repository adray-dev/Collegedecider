import type { VariableDef, ScenarioEntry, SchoolScore } from "./types";

function computeScoreForP(
  variables: VariableDef[],
  entries: Record<string, ScenarioEntry>,
  getPct: (e: ScenarioEntry) => number
): { score: number; variance: number } {
  // Only include variables that have both weight > 0 AND a score range entered
  const eligible = variables.filter((v) => {
    const e = entries[v.id];
    if (!e || e.weight === 0 || e.likelihood === null) return false;
    return e.likelihood.min !== null || e.likelihood.max !== null;
  });

  const totalWeight = eligible.reduce((sum, v) => sum + entries[v.id].weight, 0);
  if (totalWeight === 0) return { score: 0, variance: 0 };

  let score = 0;
  let variance = 0;

  for (const v of eligible) {
    const e = entries[v.id];
    const w = e.weight / totalWeight;
    const p = getPct(e) / 100;
    score += w * p;
    variance += w * w * p * (1 - p);
  }

  return { score, variance };
}

export function computeScore(
  variables: VariableDef[],
  entries: Record<string, ScenarioEntry>
): SchoolScore {
  const invalid = { scoreAvg: 0, scoreMin: 0, scoreMax: 0, sd: 0, ciLow: 0, ciHigh: 0, isValid: false };

  const hasAny = variables.some((v) => {
    const e = entries[v.id];
    return e && e.weight > 0 && e.likelihood !== null &&
      (e.likelihood.min !== null || e.likelihood.max !== null);
  });

  if (!hasAny) return invalid;

  // Fall back to the other side if only one is filled
  const getMin = (e: ScenarioEntry) => {
    const { min, max } = e.likelihood!;
    return min ?? max ?? 0;
  };
  const getMax = (e: ScenarioEntry) => {
    const { min, max } = e.likelihood!;
    return max ?? min ?? 0;
  };
  const getMid = (e: ScenarioEntry) => (getMin(e) + getMax(e)) / 2;

  const { score: sMin } = computeScoreForP(variables, entries, getMin);
  const { score: sMax } = computeScoreForP(variables, entries, getMax);
  const { score: sMid, variance } = computeScoreForP(variables, entries, getMid);

  const round1 = (n: number) => Math.round(n * 10) / 10;

  const scoreAvgPct = sMid * 100;
  const sd = Math.sqrt(variance) * 100;
  const ciLow  = Math.max(0,   scoreAvgPct - 1.96 * sd);
  const ciHigh = Math.min(100, scoreAvgPct + 1.96 * sd);

  return {
    scoreAvg: round1(scoreAvgPct),
    scoreMin: round1(sMin * 100),
    scoreMax: round1(sMax * 100),
    sd:       round1(sd),
    ciLow:    round1(ciLow),
    ciHigh:   round1(ciHigh),
    isValid:  true,
  };
}
