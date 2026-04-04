"use client";

import { useState } from "react";
import { SCENARIOS } from "@/lib/constants";
import ScenarioTable from "./ScenarioTable";
import SaveButton from "./SaveButton";
import type { AppData, ScenarioData, ScenarioId } from "@/lib/types";

interface Props {
  initialData: AppData;
}

export default function ScenarioTabs({ initialData }: Props) {
  const [appData, setAppData] = useState<AppData>(initialData);
  const [activeTab, setActiveTab] = useState<ScenarioId>(SCENARIOS[0].id);

  function handleScenarioUpdate(updated: ScenarioData) {
    setAppData((prev) => ({
      ...prev,
      scenarios: {
        ...prev.scenarios,
        [updated.scenarioId]: updated,
      },
    }));
  }

  const activeScenario = SCENARIOS.find((s) => s.id === activeTab)!;

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
            <SaveButton data={appData} />
            {appData.lastSaved && (
              <span className="text-xs text-slate-400">
                Last saved {new Date(appData.lastSaved).toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 mb-6 overflow-x-auto">
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

        {/* Active scenario */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-5">
            {activeScenario.label}
          </h2>
          <ScenarioTable
            key={activeTab}
            scenarioData={appData.scenarios[activeTab]}
            schoolA={activeScenario.schoolA}
            schoolB={activeScenario.schoolB}
            onUpdate={handleScenarioUpdate}
          />
        </div>

        {/* How-to hint */}
        <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
          <strong>How to use:</strong> Set the <em>Weight</em> for each factor (all weights must total
          100). Then for each school, choose how likely that factor is to be satisfied there. The
          calculator scores each school and shows a confidence interval based on your ratings.
        </div>
      </div>
    </div>
  );
}
