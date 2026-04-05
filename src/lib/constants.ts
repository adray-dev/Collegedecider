import type { ScenarioId, ScenarioMeta, AppData, VariableDef } from "./types";

export const PRESET_VARIABLE_NAMES: string[] = [
  "Ideal PhD advising (academic fit)",
  "Ideal law advising (academic fit)",
  "Ideal PhD advising (personality fit)",
  "Ideal law advising (personality fit)",
  "Ideal PhD advising (topical fit)",
  "Ideal law advising (topical fit)",
  "Ideal PhD institutional fit",
  "Ideal law institutional fit",
  "Ideal prestige level",
  "More money",
  "Ideal location(s)",
  "Ideal social life",
  "Ideal cohort experience/network",
  "Ideal sequencing",
  "Ideal clerking situation",
  "Ideal other benefits",
];

export const SCENARIOS: ScenarioMeta[] = [
  { id: "princeton-stanford-jd", label: "Stanford Law + Princeton PhD" },
  { id: "princeton-nyu",         label: "NYU Law + Princeton PhD" },
  { id: "nyu-stanford-phd",      label: "NYU Law + Stanford PhD" },
  { id: "stanford-jd-phd",       label: "Stanford Law + Stanford PhD" },
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
