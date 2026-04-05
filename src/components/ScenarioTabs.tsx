"use client";

import { useState, useEffect, useRef } from "react";
import { SCENARIOS } from "@/lib/constants";
import ScenarioTable from "./ScenarioTable";
import SummaryView from "./SummaryView";
import type { AppData, ScenarioData, ScenarioId } from "@/lib/types";

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
  } catch {
    // storage quota exceeded — ignore
  }
}

export default function ScenarioTabs({ initialData }: Props) {
  // On first render, prefer localStorage over the server default if server has no saved data
  const [appData, setAppData] = useState<AppData>(() => {
    if (initialData.lastSaved) return initialData; // server has real data — use it
    const local = typeof window !== "undefined" ? loadFromLocalStorage() : null;
    return local ?? initialData;
  });
  const [activeTab, setActiveTab] = useState<ActiveTab>("summary");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    setSaveState("saving");

    debounceRef.current = setTimeout(async () => {
      // Always save to localStorage immediately as fallback
      const dataWithTimestamp = { ...appData, lastSaved: new Date().toISOString() };
      saveToLocalStorage(dataWithTimestamp);

      try {
        const res = await fetch("/api/data", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(appData),
        });
        if (!res.ok) throw new Error("Save failed");
        const json = await res.json();
        const saved = { ...appData, lastSaved: json.lastSaved ?? dataWithTimestamp.lastSaved };
        setAppData(saved);
        saveToLocalStorage(saved);
        setSaveState("saved");
      } catch {
        // Server unavailable — localStorage save already happened
        setAppData(dataWithTimestamp);
        setSaveState("saved"); // show saved since localStorage worked
      }

      setTimeout(() => setSaveState("idle"), 2000);
    }, 1000);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [appData]);

  function handleScenarioUpdate(updated: ScenarioData) {
    setAppData((prev) => ({
      ...prev,
      scenarios: {
        ...prev.scenarios,
        [updated.scenarioId]: updated,
      },
    }));
  }

  const statusLabel: Record<SaveState, string> = {
    idle: "",
    saving: "Saving…",
    saved: "Saved",
    error: "Save failed",
  };

  const statusColor: Record<SaveState, string> = {
    idle: "",
    saving: "text-slate-400",
    saved: "text-emerald-600",
    error: "text-red-500",
  };

  const activeScenario = SCENARIOS.find((s) => s.id === activeTab);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Grad School Decision Calculator</h1>
            <p className="text-sm text-slate-500 mt-1">
              Assign weights to what matters to you, then rate each school&apos;s likelihood for each factor.
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

        {/* Active view */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          {activeTab === "summary" ? (
            <>
              <h2 className="text-lg font-semibold text-slate-800 mb-5">All Scenarios — Summary</h2>
              <SummaryView appData={appData} />
            </>
          ) : activeScenario ? (
            <>
              <h2 className="text-lg font-semibold text-slate-800 mb-5">{activeScenario.label}</h2>
              <ScenarioTable
                key={activeTab}
                scenarioData={appData.scenarios[activeTab as ScenarioId]}
                label={activeScenario.label}
                onUpdate={handleScenarioUpdate}
              />
            </>
          ) : null}
        </div>

        {activeTab !== "summary" && (
          <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
            <strong>How to use:</strong> Set the <em>Level of Importance</em> for each factor (must total
            100). Then rate how likely each outcome is at each school (1–10). The calculator scores
            each school and shows a confidence interval based on your ratings.
          </div>
        )}
      </div>
    </div>
  );
}
