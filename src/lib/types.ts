export type LikelihoodLabel =
  | "Extremely unlikely"
  | "Very unlikely"
  | "Unlikely"
  | "Unsure/Neutral"
  | "Likely"
  | "Very likely"
  | "Extremely likely";

export interface Variable {
  id: string;
  name: string;
  weight: number;
  likelihoodA: LikelihoodLabel | "";
  likelihoodB: LikelihoodLabel | "";
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
  schoolA: string;
  schoolB: string;
}
