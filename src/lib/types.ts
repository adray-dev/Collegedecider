export interface VariableDef {
  id: string;
  name: string;
  isPreset: boolean;
}

export interface ScenarioEntry {
  weight: number;
  likelihood: number | null; // 0–100 percentage points
}

export type ScenarioId =
  | "princeton-stanford-jd"
  | "princeton-nyu"
  | "nyu-stanford-phd"
  | "stanford-jd-phd";

export interface ScenarioData {
  scenarioId: ScenarioId;
  entries: Record<string, ScenarioEntry>; // keyed by variableId
}

export interface AppData {
  variables: VariableDef[];              // shared across all scenarios
  scenarios: Record<ScenarioId, ScenarioData>;
  lastSaved: string | null;
}

export interface SchoolScore {
  score: number;
  sd: number;
  ciLow: number;
  ciHigh: number;
  isValid: boolean;
}

export interface ScenarioMeta {
  id: ScenarioId;
  label: string;
}
