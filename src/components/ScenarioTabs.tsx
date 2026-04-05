"use client";

import { useState } from "react";
import { SCENARIOS, SCENARIO_IDS } from "@/lib/constants";
import ScenarioTable from "./ScenarioTable";
import SummaryView from "./SummaryView";
import type { AppData, ScenarioId, LikelihoodRange } from "@/lib/types";

export type SortKey = "median" | "min" | "max";

interface Props {
  appData: AppData;
  onDataChange: (data: AppData) => void;
}

type ActiveTab = ScenarioId | "summary";

export default function ScenarioTabs({ appData: initialAppData, onDataChange }: Props) {
  const [appData, setAppData] = useState<AppData>(initialAppData);
  const [activeTab, setActiveTab] = useState<ActiveTab>("summary");
  const [sortKey, setSortKey] = useState<SortKey>("median");

  function update(newData: AppData) {
    setAppData(newData);
    onDataChange(newData);
  }

  // ── Variable structure callbacks (apply to all scenarios) ───────────────

  function handleAddVariable() {
    const id = crypto.randomUUID();
    update({
      ...appData,
      variables: [...appData.variables, { id, name: "", isPreset: false }],
      scenarios: Object.fromEntries(
        SCENARIO_IDS.map((sid) => [
          sid,
          {
            ...appData.scenarios[sid],
            entries: { ...appData.scenarios[sid].entries, [id]: { weight: 0, likelihood: null } },
          },
        ])
      ) as AppData["scenarios"],
    });
  }

  function handleDeleteVariable(variableId: string) {
    const newEntries = (sid: ScenarioId) => {
      const e = { ...appData.scenarios[sid].entries };
      delete e[variableId];
      return e;
    };
    update({
      ...appData,
      variables: appData.variables.filter((v) => v.id !== variableId),
      scenarios: Object.fromEntries(
        SCENARIO_IDS.map((sid) => [
          sid,
          { ...appData.scenarios[sid], entries: newEntries(sid) },
        ])
      ) as AppData["scenarios"],
    });
  }

  function handleUpdateName(variableId: string, name: string) {
    update({
      ...appData,
      variables: appData.variables.map((v) => (v.id === variableId ? { ...v, name } : v)),
    });
  }

  // ── Per-scenario entry callbacks ─────────────────────────────────────────

  function handleUpdateWeight(scenarioId: ScenarioId, variableId: string, rawValue: string) {
    const entries = appData.scenarios[scenarioId].entries;
    const othersSum = Object.entries(entries)
      .filter(([id]) => id !== variableId)
      .reduce((s, [, e]) => s + e.weight, 0);
    const parsed = parseInt(rawValue, 10);
    const capped = Math.min(Math.max(0, isNaN(parsed) ? 0 : parsed), 100 - othersSum);

    // Apply same weight to all scenarios
    update({
      ...appData,
      scenarios: Object.fromEntries(
        SCENARIO_IDS.map((sid) => [
          sid,
          {
            ...appData.scenarios[sid],
            entries: {
              ...appData.scenarios[sid].entries,
              [variableId]: { ...appData.scenarios[sid].entries[variableId], weight: capped },
            },
          },
        ])
      ) as AppData["scenarios"],
    });
  }

  function handleUpdateLikelihood(scenarioId: ScenarioId, variableId: string, value: LikelihoodRange | null) {
    update({
      ...appData,
      scenarios: {
        ...appData.scenarios,
        [scenarioId]: {
          ...appData.scenarios[scenarioId],
          entries: {
            ...appData.scenarios[scenarioId].entries,
            [variableId]: { ...appData.scenarios[scenarioId].entries[variableId], likelihood: value },
          },
        },
      },
    });
  }

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Scenario sub-tabs */}
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
          <SummaryView appData={appData} sortKey={sortKey} onSortChange={setSortKey} />
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
  );
}
