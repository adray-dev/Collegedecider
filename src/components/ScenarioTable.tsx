"use client";

import VariableRow from "./VariableRow";
import ScoreDisplay from "./ScoreDisplay";
import { computeScore } from "@/lib/calculations";
import type { VariableDef, ScenarioEntry, ScenarioId, LikelihoodRange } from "@/lib/types";

interface Props {
  scenarioId: ScenarioId;
  label: string;
  variables: VariableDef[];
  entries: Record<string, ScenarioEntry>;
  onUpdateName: (id: string, name: string) => void;
  onUpdateWeight: (scenarioId: ScenarioId, variableId: string, value: string) => void;
  onUpdateLikelihood: (scenarioId: ScenarioId, variableId: string, value: LikelihoodRange | null) => void;
  onAddVariable: () => void;
  onDeleteVariable: (id: string) => void;
}

export default function ScenarioTable({
  scenarioId,
  label,
  variables,
  entries,
  onUpdateName,
  onUpdateWeight,
  onUpdateLikelihood,
  onAddVariable,
  onDeleteVariable,
}: Props) {
  const totalWeight = variables.reduce((s, v) => s + (entries[v.id]?.weight ?? 0), 0);
  const score = computeScore(variables, entries);

  const weightColor =
    totalWeight === 100
      ? "text-emerald-600"
      : totalWeight > 0
      ? "text-amber-600"
      : "text-slate-400";

  return (
    <div className="space-y-6">
      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full min-w-[580px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wide py-3 pl-3 pr-2">
                Variable
              </th>
              <th className="text-center text-xs font-semibold text-slate-600 uppercase tracking-wide py-3 px-2 w-28 border-r border-slate-200">
                Level of Importance
              </th>
              <th className="text-center text-xs font-semibold text-blue-600 uppercase tracking-wide py-3 px-2 w-44">
                Likelihood range (%)
              </th>
              <th className="w-8" />
            </tr>
          </thead>
          <tbody>
            {variables.map((variable) => (
              <VariableRow
                key={variable.id}
                variable={variable}
                entry={entries[variable.id] ?? { weight: 0, likelihood: null }}
                totalWeight={totalWeight}
                onUpdateName={onUpdateName}
                onUpdateWeight={(id, val) => onUpdateWeight(scenarioId, id, val)}
                onUpdateLikelihood={(id, val) => onUpdateLikelihood(scenarioId, id, val)}
                onDelete={onDeleteVariable}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-1">
        <button
          onClick={onAddVariable}
          className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add variable
        </button>
        <span className={`text-sm font-medium ${weightColor}`}>
          Importance total: {totalWeight} / 100{totalWeight === 100 && " ✓"}
        </span>
      </div>

      {/* Score card */}
      <ScoreDisplay scenarioLabel={label} score={score} />

      <p className="text-xs text-slate-400 leading-relaxed">
        Score = weighted expected value (0–100) using the midpoint of each likelihood range. SD and 95% CI use a Bernoulli variance model.
        Compare scores across tabs on the Summary page.
      </p>
    </div>
  );
}
