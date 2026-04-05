import type { VariableDef, ScenarioEntry, SchoolScore } from "./types";

function computeScoreForP(
  variables: VariableDef[],
  entries: Record<string, ScenarioEntry>,
  getPct: (e: ScenarioEntry) => number
): { score: number; variance: number } {
  const totalWeight = variables.reduce((sum, v) => sum + (entries[v.id]?.weight ?? 0), 0);
  if (totalWeight === 0) return { score: 0, variance: 0 };

  let score = 0;
  let variance = 0;

  for (const v of variables) {
    const e = entries[v.id];
    if (!e || e.weight === 0 || e.likelihood === null) continue;
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
  const totalWeight = variables.reduce((sum, v) => sum + (entries[v.id]?.weight ?? 0), 0);

  if (totalWeight === 0) {
    return { scoreAvg: 0, scoreMin: 0, scoreMax: 0, sd: 0, ciLow: 0, ciHigh: 0, isValid: false };
  }

  const hasAny = variables.some((v) => {
    const e = entries[v.id];
    return e && e.weight > 0 && e.likelihood !== null;
  });

  if (!hasAny) {
    return { scoreAvg: 0, scoreMin: 0, scoreMax: 0, sd: 0, ciLow: 0, ciHigh: 0, isValid: false };
  }

  const { score: scoreMin } = computeScoreForP(variables, entries, (e) => e.likelihood!.min);
  const { score: scoreMax } = computeScoreForP(variables, entries, (e) => e.likelihood!.max);
  const { score: scoreAvgRaw, variance } = computeScoreForP(
    variables,
    entries,
    (e) => (e.likelihood!.min + e.likelihood!.max) / 2
  );

  const round1 = (n: number) => Math.round(n * 10) / 10;

  const scoreAvgPct = scoreAvgRaw * 100;
  const sd = Math.sqrt(variance) * 100;
  const ciLow = Math.max(0, scoreAvgPct - 1.96 * sd);
  const ciHigh = Math.min(100, scoreAvgPct + 1.96 * sd);

  return {
    scoreAvg: round1(scoreAvgPct),
    scoreMin: round1(scoreMin * 100),
    scoreMax: round1(scoreMax * 100),
    sd: round1(sd),
    ciLow: round1(ciLow),
    ciHigh: round1(ciHigh),
    isValid: true,
  };
}
