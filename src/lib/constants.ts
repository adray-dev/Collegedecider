import type { LikelihoodLabel, ScenarioId, ScenarioMeta, AppData, Variable } from "./types";

export const LIKELIHOOD_MAP: Record<LikelihoodLabel, number> = {
  "Extremely unlikely": 0.05,
  "Very unlikely": 0.15,
  "Unlikely": 0.30,
  "Unsure/Neutral": 0.50,
  "Likely": 0.70,
  "Very likely": 0.85,
  "Extremely likely": 0.95,
};

export const LIKELIHOOD_OPTIONS: LikelihoodLabel[] = [
  "Extremely unlikely",
  "Very unlikely",
  "Unlikely",
  "Unsure/Neutral",
  "Likely",
  "Very likely",
  "Extremely likely",
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
    likelihoodA: "",
    likelihoodB: "",
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
