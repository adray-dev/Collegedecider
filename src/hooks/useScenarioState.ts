"use client";

import { useState } from "react";
import type { Variable, ScenarioData } from "@/lib/types";

export function useScenarioState(initialData: ScenarioData) {
  const [variables, setVariables] = useState<Variable[]>(initialData.variables);

  const totalWeight = variables.reduce((s, v) => s + v.weight, 0);

  function updateWeight(id: string, rawValue: string) {
    const parsed = parseInt(rawValue, 10);
    const numeric = isNaN(parsed) ? 0 : Math.max(0, parsed);
    setVariables((prev) => {
      const othersSum = prev.filter((v) => v.id !== id).reduce((s, v) => s + v.weight, 0);
      const capped = Math.min(numeric, 100 - othersSum);
      return prev.map((v) => (v.id === id ? { ...v, weight: capped } : v));
    });
  }

  function updateName(id: string, name: string) {
    setVariables((prev) => prev.map((v) => (v.id === id ? { ...v, name } : v)));
  }

  function updateLikelihood(id: string, value: number | null) {
    setVariables((prev) =>
      prev.map((v) => (v.id === id ? { ...v, likelihood: value } : v))
    );
  }

  function addRow() {
    setVariables((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: "",
        weight: 0,
        likelihood: null,
        isPreset: false,
      },
    ]);
  }

  function deleteRow(id: string) {
    setVariables((prev) => prev.filter((v) => v.id !== id));
  }

  function getScenarioData(): ScenarioData {
    return { scenarioId: initialData.scenarioId, variables };
  }

  return { variables, totalWeight, updateWeight, updateName, updateLikelihood, addRow, deleteRow, getScenarioData };
}
