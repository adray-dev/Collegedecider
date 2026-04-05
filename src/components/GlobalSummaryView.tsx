import { useState } from "react";
import { computeScore } from "@/lib/calculations";
import { SCENARIOS } from "@/lib/constants";
import type { Session } from "@/lib/types";
import type { SortKey } from "./ScenarioTabs";

interface Props {
  sessions: Session[];
}

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "median",  label: "Median"  },
  { key: "min",     label: "Minimum" },
  { key: "max",     label: "Maximum" },
];

export default function GlobalSummaryView({ sessions }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("median");

  // Build flat list of all session × scenario combinations
  const raw = sessions.flatMap((session) =>
    SCENARIOS.map((scenario) => ({
      sessionName: session.name,
      scenarioLabel: scenario.label,
      key: `${session.id}-${scenario.id}`,
      score: computeScore(
        session.appData.variables,
        session.appData.scenarios[scenario.id].entries
      ),
    }))
  );

  const getSortScore = (entry: typeof raw[0]) => {
    if (!entry.score.isValid) return -Infinity;
    if (sortKey === "min") return entry.score.scoreMin;
    if (sortKey === "max") return entry.score.scoreMax;
    return entry.score.scoreAvg;
  };

  const results = [...raw].sort((a, b) => getSortScore(b) - getSortScore(a));
  const validResults = results.filter((r) => r.score.isValid);
  const topScore = validResults.length > 0 ? getSortScore(validResults[0]) : null;

  const displayScore = (entry: typeof raw[0]) => {
    if (!entry.score.isValid) return 0;
    if (sortKey === "min") return entry.score.scoreMin;
    if (sortKey === "max") return entry.score.scoreMax;
    return entry.score.scoreAvg;
  };

  const displayLabel = sortKey === "min" ? "min" : sortKey === "max" ? "max" : "median";

  if (validResults.length === 0) {
    return (
      <div className="text-center py-16 text-slate-400 text-sm">
        No scores yet — fill in weights and score ranges in each test tab.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header + sort toggle */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <p className="text-sm text-slate-500">
          All scenarios across all tests, sorted by{" "}
          <span className="font-medium text-slate-700">{sortKey}</span> score.
        </p>
        <div className="flex gap-1 bg-slate-100 rounded-lg p-1 shrink-0">
          {SORT_OPTIONS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setSortKey(key)}
              className={`text-xs font-medium px-3 py-1.5 rounded-md transition-colors ${
                sortKey === key
                  ? "bg-slate-800 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {results.map((entry, i) => {
        const isTop = entry.score.isValid && getSortScore(entry) === topScore;
        const rank = entry.score.isValid ? i + 1 : null;
        const ds = displayScore(entry);

        return (
          <div
            key={entry.key}
            className={`rounded-xl border p-5 flex items-center gap-5 ${
              isTop ? "border-emerald-400 bg-emerald-50" : "border-slate-200 bg-white"
            }`}
          >
            {/* Rank */}
            <div className={`text-2xl font-bold w-8 text-center shrink-0 ${isTop ? "text-emerald-600" : "text-slate-300"}`}>
              {rank ?? "—"}
            </div>

            <div className="flex-1 min-w-0">
              {/* Test badge + scenario label */}
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-xs font-semibold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full shrink-0">
                  {entry.sessionName}
                </span>
                <span className="font-semibold text-slate-800 text-sm">{entry.scenarioLabel}</span>
                {isTop && (
                  <span className="text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full font-semibold shrink-0">
                    Top overall
                  </span>
                )}
              </div>

              {entry.score.isValid ? (
                <>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${isTop ? "bg-emerald-500" : "bg-blue-400"}`}
                      style={{ width: `${ds}%` }}
                    />
                  </div>
                  <div className="text-xs text-slate-500 font-medium mt-1">
                    Range: {entry.score.scoreMin.toFixed(1)} – {entry.score.scoreMax.toFixed(1)}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    SD ± {entry.score.sd.toFixed(1)} &nbsp;·&nbsp; 95% CI [{entry.score.ciLow.toFixed(1)} – {entry.score.ciHigh.toFixed(1)}]
                  </div>
                </>
              ) : (
                <p className="text-xs text-slate-400 italic">No data yet</p>
              )}
            </div>

            {/* Score number */}
            {entry.score.isValid && (
              <div className="text-right shrink-0">
                <div className="text-3xl font-bold text-slate-900">{ds.toFixed(1)}</div>
                <div className="text-xs text-slate-400">{displayLabel} / 100</div>
              </div>
            )}
          </div>
        );
      })}

      <p className="text-xs text-slate-400 pt-2">
        Showing all {raw.length} scenario × test combinations. Higher score = stronger overall fit.
      </p>
    </div>
  );
}
