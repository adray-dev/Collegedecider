import type { ScenarioId, ScenarioMeta, AppData, VariableDef, Session, AllSessionsData } from "./types";

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

/**
 * Merges loaded data with defaults so any missing scenarios or variable entries
 * are filled in rather than causing a silent reset or crash.
 */
export function sanitizeAppData(data: AppData): AppData {
  const defaults = buildDefaultAppData();
  const variables =
    Array.isArray(data.variables) && data.variables.length > 0
      ? data.variables
      : defaults.variables;

  const scenarios = Object.fromEntries(
    SCENARIO_IDS.map((id) => {
      const existing = data.scenarios?.[id];
      const defaultEntries = Object.fromEntries(
        variables.map((v) => [v.id, { weight: 0, likelihood: null }])
      );
      const entries = existing?.entries
        ? { ...defaultEntries, ...existing.entries }
        : defaultEntries;
      return [id, { scenarioId: id, entries }];
    })
  ) as AppData["scenarios"];

  return { variables, scenarios, lastSaved: data.lastSaved ?? null };
}

export const DEFAULT_SESSION_NAMES = [
  "Test 1", "Test 2", "Test 3", "Test 4", "Test 5", "Test 6", "Test 7", "Test 8",
] as const;

export function buildDefaultAllSessionsData(): AllSessionsData {
  return {
    sessions: DEFAULT_SESSION_NAMES.map((name, i) => ({
      id: `session-${i + 1}`,
      name,
      appData: buildDefaultAppData(),
    })),
    lastSaved: null,
  };
}

/** Migrate old single-session AppData → AllSessionsData (sessions 2 & 3 are deep copies of session 1). */
export function migrateToAllSessionsData(appData: AppData): AllSessionsData {
  const sanitized = sanitizeAppData(appData);
  return {
    sessions: DEFAULT_SESSION_NAMES.map((name, i) => ({
      id: `session-${i + 1}`,
      name,
      appData: JSON.parse(JSON.stringify(sanitized)) as AppData,
    })),
    lastSaved: appData.lastSaved ?? null,
  };
}

/** Apply sanitizeAppData to every session; fill in missing sessions with defaults. */
export function sanitizeAllSessionsData(data: AllSessionsData): AllSessionsData {
  const sessions: Session[] = DEFAULT_SESSION_NAMES.map((name, i) => {
    const existing = data.sessions?.[i];
    return {
      id: existing?.id ?? `session-${i + 1}`,
      name: existing?.name ?? name,
      appData: existing?.appData ? sanitizeAppData(existing.appData) : buildDefaultAppData(),
    };
  });
  return { sessions, lastSaved: data.lastSaved ?? null };
}
