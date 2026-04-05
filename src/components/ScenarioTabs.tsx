"use client";

import { useState, useEffect, useRef } from "react";
import { SCENARIOS, SCENARIO_IDS, buildDefaultAppData } from "@/lib/constants";
import ScenarioTable from "./ScenarioTable";
import SummaryView from "./SummaryView";
import type { AppData, ScenarioId } from "@/lib/types";

const LS_KEY = "college-decider:app-data";

type SaveState = "idle" | "saving" | "saved" | "error";
type ActiveTab = ScenarioId | "summary";

interface Props {
  initialData: AppData;
}

function loadFromLocalStorage(): AppData | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AppData;
  } catch {
    return null;
  }
}

function saveToLocalStorage(data: AppData) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(data));
  } catch { /* quota exceeded */ }
}

export default function ScenarioTabs({ initialData }: Props) {
  const [appData, setAppData] = useState<AppData>(() => {
    if (initialData.lastSaved) return initialData;
    const local = typeof window !== "undefined" ? loadFromLocalStorage() : null;
    // Migrate old format that doesn't have top-level variables
    const data = local ?? initialData;
    if (!data.variables) return buildDefaultAppData();
    return data;
  });
  const [activeTab, setActiveTab] = useState<ActiveTab>("summary");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender = useRef(true);

  // Auto-save on any appData change
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setSaveState("saving");
    debounceRef.current = setTimeout(async () => {
      const dataWithTimestamp = { ...appData, lastSaved: new Date().toISOString() };
      saveToLocalStorage(dataWithTimestamp);
      try {
        const res = await fetch("/api/data", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(appData),
        });
        if (!res.ok) throw new Error();
        const json = await res.json();
        const saved = { ...appData, lastSaved: json.lastSaved ?? dataWithTimestamp.lastSaved };
        setAppData(saved);
        saveToLocalStorage(saved);
      } catch {
        setAppData(dataWithTimestamp);
      }
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 2000);
    }, 1000);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [appData]);

  // ── Variable structure callbacks (apply to all scenarios) ───────────────

  function handleAddVariable() {
    const id = crypto.randomUUID();
    setAppData((prev) => ({
      ...prev,
      variables: [...prev.variables, { id, name: "", isPreset: false }],
      scenarios: Object.fromEntries(
        SCENARIO_IDS.map((sid) => [
          sid,
          {
            ...prev.scenarios[sid],
            entries: { ...prev.scenarios[sid].entries, [id]: { weight: 0, likelihood: null } },
          },
        ])
      ) as AppData["scenarios"],
    }));
  }

  function handleDeleteVariable(variableId: string) {
    setAppData((prev) => {
      const newEntries = (sid: ScenarioId) => {
        const e = { ...prev.scenarios[sid].entries };
        delete e[variableId];
        return e;
      };
      return {
        ...prev,
        variables: prev.variables.filter((v) => v.id !== variableId),
        scenarios: Object.fromEntries(
          SCENARIO_IDS.map((sid) => [
            sid,
            { ...prev.scenarios[sid], entries: newEntries(sid) },
          ])
        ) as AppData["scenarios"],
      };
    });
  }

  function handleUpdateName(variableId: string, name: string) {
    setAppData((prev) => ({
      ...prev,
      variables: prev.variables.map((v) => (v.id === variableId ? { ...v, name } : v)),
    }));
  }

  // ── Per-scenario entry callbacks ─────────────────────────────────────────

  function handleUpdateWeight(scenarioId: ScenarioId, variableId: string, rawValue: string) {
    setAppData((prev) => {
      const entries = prev.scenarios[scenarioId].entries;
      const othersSum = Object.entries(entries)
        .filter(([id]) => id !== variableId)
        .reduce((s, [, e]) => s + e.weight, 0);
      const parsed = parseInt(rawValue, 10);
      const capped = Math.min(Math.max(0, isNaN(parsed) ? 0 : parsed), 100 - othersSum);
      return {
        ...prev,
        scenarios: {
          ...prev.scenarios,
          [scenarioId]: {
            ...prev.scenarios[scenarioId],
            entries: {
              ...entries,
              [variableId]: { ...entries[variableId], weight: capped },
            },
          },
        },
      };
    });
  }

  function handleUpdateLikelihood(scenarioId: ScenarioId, variableId: string, value: number | null) {
    setAppData((prev) => ({
      ...prev,
      scenarios: {
        ...prev.scenarios,
        [scenarioId]: {
          ...prev.scenarios[scenarioId],
          entries: {
            ...prev.scenarios[scenarioId].entries,
            [variableId]: { ...prev.scenarios[scenarioId].entries[variableId], likelihood: value },
          },
        },
      },
    }));
  }

  // ── Render ───────────────────────────────────────────────────────────────

  const statusLabel: Record<SaveState, string> = {
    idle: "", saving: "Saving…", saved: "Saved", error: "Save failed",
  };
  const statusColor: Record<SaveState, string> = {
    idle: "", saving: "text-slate-400", saved: "text-emerald-600", error: "text-red-500",
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Grad School Decision Calculator</h1>
            <p className="text-sm text-slate-500 mt-1">
              Assign weights to what matters to you, then rate each outcome&apos;s likelihood per combination.
            </p>
            <p className="text-sm text-blue-700 mt-2">
              <strong>How to use:</strong> Set the <em>Level of Importance</em> for each factor (must total
              100). Then rate how likely each outcome is for this combination (0–100%). Adding or removing
              a variable updates it across all scenario tabs.
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className={`text-sm font-medium transition-colors ${statusColor[saveState]}`}>
              {saveState === "saved" && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1 -mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
              {statusLabel[saveState]}
            </span>
            {appData.lastSaved && saveState === "idle" && (
              <span className="text-xs text-slate-400">
                Last saved {new Date(appData.lastSaved).toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab("summary")}
            className={`whitespace-nowrap text-sm font-medium px-4 py-2 rounded-lg transition-colors ${
              activeTab === "summary"
                ? "bg-slate-800 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            Summary
          </button>
          {SCENARIOS.map((scenario) => (
            <button
              key={scenario.id}
              onClick={() => setActiveTab(scenario.id)}
              className={`flex-1 whitespace-nowrap text-sm font-medium px-4 py-2 rounded-lg transition-colors ${
                activeTab === scenario.id
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              {scenario.label}
            </button>
          ))}
        </div>

        {/* Views */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className={activeTab === "summary" ? "" : "hidden"}>
            <h2 className="text-lg font-semibold text-slate-800 mb-5">All Scenarios — Summary</h2>
            <SummaryView appData={appData} />
          </div>

          {SCENARIOS.map((scenario) => (
            <div key={scenario.id} className={activeTab === scenario.id ? "" : "hidden"}>
              <h2 className="text-lg font-semibold text-slate-800 mb-5">{scenario.label}</h2>
              <ScenarioTable
                scenarioId={scenario.id}
                label={scenario.label}
                variables={appData.variables}
                entries={appData.scenarios[scenario.id].entries}
                onUpdateName={handleUpdateName}
                onUpdateWeight={handleUpdateWeight}
                onUpdateLikelihood={handleUpdateLikelihood}
                onAddVariable={handleAddVariable}
                onDeleteVariable={handleDeleteVariable}
              />
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
