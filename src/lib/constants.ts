import type { ScenarioId, ScenarioMeta, AppData, Variable } from "./types";

// Maps 0–100 percentage points to a 0–1 probability
export function likelihoodToProb(value: number): number {
  return value / 100;
}

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
  { id: "princeton-stanford-jd", label: "Princeton + Stanford JD" },
  { id: "princeton-nyu",         label: "Princeton + NYU" },
  { id: "nyu-stanford-phd",      label: "NYU + Stanford PhD" },
  { id: "stanford-jd-phd",       label: "Stanford JD + Stanford PhD" },
];

function makePresetVariables(): Variable[] {
  return PRESET_VARIABLE_NAMES.map((name, i) => ({
    id: `preset-${i}`,
    name,
    weight: 0,
    likelihood: null,
    isPreset: true,
  }));
}

export function buildDefaultAppData(): AppData {
  const scenarios = {} as Record<ScenarioId, { scenarioId: ScenarioId; variables: Variable[] }>;
  for (const s of SCENARIOS) {
    scenarios[s.id] = { scenarioId: s.id, variables: makePresetVariables() };
  }
  return { scenarios, lastSaved: null };
}
