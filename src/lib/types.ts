export interface VariableDef {
  id: string;
  name: string;
  isPreset: boolean;
}

export interface LikelihoodRange {
  min: number; // 0–100 percentage points
  max: number; // 0–100 percentage points
}

export interface ScenarioEntry {
  weight: number;
  likelihood: LikelihoodRange | null;
}

export interface SchoolScore {
  scoreAvg: number;
  scoreMin: number;
  scoreMax: number;
  sd: number;
  ciLow: number;
  ciHigh: number;
  isValid: boolean;
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


export interface ScenarioMeta {
  id: ScenarioId;
  label: string;
}
