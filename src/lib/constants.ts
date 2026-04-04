import type { ScenarioId, ScenarioMeta, AppData, Variable } from "./types";

// Maps a 1–10 likelihood rating to a probability (0–1)
// Linear: value / 10, so 1 = 10%, 5 = 50%, 10 = 100%
export function likelihoodToProb(value: number): number {
  return value / 10;
}

export const LIKELIHOOD_LEGEND: { range: string; label: string; color: string }[] = [
  { range: "1–2", label: "Very unlikely", color: "text-red-500" },
  { range: "3–4", label: "Unlikely", color: "text-orange-500" },
  { range: "5",   label: "Possible",     color: "text-yellow-600" },
  { range: "6–7", label: "Likely",       color: "text-lime-600" },
  { range: "8–9", label: "Very likely",  color: "text-emerald-600" },
  { range: "10",  label: "Certain",      color: "text-emerald-700" },
];

export const PRESET_VARIABLE_NAMES: string[] = [
  "Optimal job outcome",
  "Optimal scholarship production",
  "Ideal advisor personality fit",
  "School personality fit",
  "Ideal breadth of faculty",
  "Interest fit of faculty",
  "Interest fit of advisor",
  "Money",
  "Ideal location",
  "Ideal social life",
];

export const SCENARIOS: ScenarioMeta[] = [
  {
    id: "princeton-stanford-jd",
    label: "Princeton vs Stanford JD",
    schoolA: "Princeton",
    schoolB: "Stanford JD",
  },
  {
    id: "princeton-nyu",
    label: "Princeton vs NYU",
    schoolA: "Princeton",
    schoolB: "NYU",
  },
  {
    id: "nyu-stanford-phd",
    label: "NYU vs Stanford PhD",
    schoolA: "NYU",
    schoolB: "Stanford PhD",
  },
  {
    id: "stanford-jd-phd",
    label: "Stanford JD vs Stanford PhD",
    schoolA: "Stanford JD",
    schoolB: "Stanford PhD",
  },
];

function makePresetVariables(): Variable[] {
  return PRESET_VARIABLE_NAMES.map((name, i) => ({
    id: `preset-${i}`,
    name,
    weight: 0,
    likelihoodA: null,
    likelihoodB: null,
    isPreset: true,
  }));
}

export function buildDefaultAppData(): AppData {
  const scenarios = {} as Record<ScenarioId, { scenarioId: ScenarioId; variables: Variable[] }>;
  for (const s of SCENARIOS) {
    scenarios[s.id] = {
      scenarioId: s.id,
      variables: makePresetVariables(),
    };
  }
  return { scenarios, lastSaved: null };
}
