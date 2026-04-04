"use client";

import { useEffect } from "react";
import { useScenarioState } from "@/hooks/useScenarioState";
import VariableRow from "./VariableRow";
import ScoreDisplay from "./ScoreDisplay";
import { computeScore } from "@/lib/calculations";
import { LIKELIHOOD_LEGEND } from "@/lib/constants";
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
            {/* Top group row */}
            <tr className="bg-slate-100 border-b border-slate-200">
              <th className="py-2 pl-3 pr-2" />
              <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wide py-2 px-2 w-28 border-r border-slate-200">
                Shared
              </th>
              <th
                colSpan={2}
                className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wide py-2 px-2"
              >
                Likelihood of this outcome (1–10)
              </th>
              <th className="w-8" />
            </tr>
            {/* Column label row */}
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wide py-2 pl-3 pr-2">
                Variable
              </th>
              <th className="text-center text-xs font-semibold text-slate-600 uppercase tracking-wide py-2 px-2 w-28 border-r border-slate-200">
                Level of Importance
              </th>
              <th className="text-center text-xs font-semibold text-blue-600 uppercase tracking-wide py-2 px-2 w-32">
                {schoolA}
              </th>
              <th className="text-center text-xs font-semibold text-violet-600 uppercase tracking-wide py-2 px-2 w-32">
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

      {/* Footer: add button + weight budget */}
      <div className="flex items-center justify-between px-1">
        <button
          onClick={addRow}
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

      {/* Likelihood legend */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
          Likelihood scale legend
        </p>
        <div className="flex flex-wrap gap-x-5 gap-y-1">
          {LIKELIHOOD_LEGEND.map((item) => (
            <span key={item.range} className="text-sm">
              <span className={`font-bold ${item.color}`}>{item.range}</span>
              <span className="text-slate-500"> = {item.label}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Score cards */}
      <div className="flex gap-4">
        <ScoreDisplay schoolName={schoolA} score={scoreA} isRecommended={recommendA} />
        <ScoreDisplay schoolName={schoolB} score={scoreB} isRecommended={recommendB} />
      </div>

      <p className="text-xs text-slate-400 leading-relaxed">
        Score = weighted expected value (0–100). SD and 95% CI use a Bernoulli variance model.
        Higher score = stronger overall fit.
      </p>
    </div>
  );
}
