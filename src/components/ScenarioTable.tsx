"use client";

import { useEffect } from "react";
import { useScenarioState } from "@/hooks/useScenarioState";
import VariableRow from "./VariableRow";
import ScoreDisplay from "./ScoreDisplay";
import { computeScore } from "@/lib/calculations";
import type { ScenarioData } from "@/lib/types";

interface Props {
  scenarioData: ScenarioData;
  schoolA: string;
  schoolB: string;
  onUpdate: (data: ScenarioData) => void;
}

export default function ScenarioTable({ scenarioData, schoolA, schoolB, onUpdate }: Props) {
  const {
    variables,
    totalWeight,
    updateWeight,
    updateName,
    updateLikelihood,
    addRow,
    deleteRow,
    getScenarioData,
  } = useScenarioState(scenarioData);

  useEffect(() => {
    onUpdate(getScenarioData());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variables]);

  const scoreA = computeScore(variables, "A");
  const scoreB = computeScore(variables, "B");
  const recommendA = scoreA.isValid && scoreB.isValid && scoreA.score > scoreB.score;
  const recommendB = scoreA.isValid && scoreB.isValid && scoreB.score > scoreA.score;

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
        <table className="w-full">
          <thead>
            {/* Top header row: group labels */}
            <tr className="bg-slate-100 border-b border-slate-200">
              <th className="py-2 pl-3 pr-2" />
              <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wide py-2 px-2 w-24 border-r border-slate-200">
                Shared
              </th>
              <th
                colSpan={2}
                className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wide py-2 px-2"
              >
                Likelihood per school
              </th>
              <th className="w-8" />
            </tr>
            {/* Bottom header row: column labels */}
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wide py-2 pl-3 pr-2">
                Variable
              </th>
              <th className="text-center text-xs font-semibold text-slate-600 uppercase tracking-wide py-2 px-2 w-24 border-r border-slate-200">
                Weight
              </th>
              <th className="text-center text-xs font-semibold text-blue-600 uppercase tracking-wide py-2 px-2 w-40">
                {schoolA}
              </th>
              <th className="text-center text-xs font-semibold text-violet-600 uppercase tracking-wide py-2 px-2 w-40">
                {schoolB}
              </th>
              <th className="w-8" />
            </tr>
          </thead>
          <tbody>
            {variables.map((variable) => (
              <VariableRow
                key={variable.id}
                variable={variable}
                totalWeight={totalWeight}
                onUpdateName={updateName}
                onUpdateWeight={updateWeight}
                onUpdateLikelihood={updateLikelihood}
                onDelete={deleteRow}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer row: add button + weight budget */}
      <div className="flex items-center justify-between px-1">
        <button
          onClick={addRow}
          className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          Add variable
        </button>

        <span className={`text-sm font-medium ${weightColor}`}>
          Weights used: {totalWeight} / 100
          {totalWeight === 100 && " ✓"}
        </span>
      </div>

      {/* Score cards */}
      <div className="flex gap-4">
        <ScoreDisplay schoolName={schoolA} score={scoreA} isRecommended={recommendA} />
        <ScoreDisplay schoolName={schoolB} score={scoreB} isRecommended={recommendB} />
      </div>

      {/* Statistical note */}
      <p className="text-xs text-slate-400 leading-relaxed">
        Score = weighted expected value (0–100). SD and 95% CI use a Bernoulli variance model.
        Higher score = stronger overall fit.
      </p>
    </div>
  );
}
