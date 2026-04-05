export interface Variable {
  id: string;
  name: string;
  weight: number;
  likelihood: number | null; // 0–100 percentage points, null = not set
  isPreset: boolean;
}

export type ScenarioId =
  | "princeton-stanford-jd"
  | "princeton-nyu"
  | "nyu-stanford-phd"
  | "stanford-jd-phd";

export interface ScenarioData {
  scenarioId: ScenarioId;
  variables: Variable[];
}

export interface AppData {
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
