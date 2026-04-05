import type { ScenarioId, ScenarioMeta, AppData, VariableDef } from "./types";

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

export const SCENARIO_IDS: ScenarioId[] = SCENARIOS.map((s) => s.id);

export function buildDefaultAppData(): AppData {
  const variables: VariableDef[] = PRESET_VARIABLE_NAMES.map((name, i) => ({
    id: `preset-${i}`,
    name,
    isPreset: true,
  }));

  const emptyEntries = Object.fromEntries(
    variables.map((v) => [v.id, { weight: 0, likelihood: null }])
  );

  const scenarios = Object.fromEntries(
    SCENARIO_IDS.map((id) => [id, { scenarioId: id, entries: { ...emptyEntries } }])
  ) as AppData["scenarios"];

  return { variables, scenarios, lastSaved: null };
}
