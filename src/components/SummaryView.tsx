import { computeScore } from "@/lib/calculations";
import { SCENARIOS } from "@/lib/constants";
import type { AppData } from "@/lib/types";
import type { SortKey } from "./ScenarioTabs";

interface Props {
  appData: AppData;
  sortKey: SortKey;
  onSortChange: (key: SortKey) => void;
}

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "median", label: "Median" },
  { key: "min",    label: "Minimum" },
  { key: "max",    label: "Maximum" },
];

export default function SummaryView({ appData, sortKey, onSortChange }: Props) {
  const raw = SCENARIOS.map((scenario) => ({
    scenario,
    score: computeScore(appData.variables, appData.scenarios[scenario.id].entries),
  }));

  const getSortScore = (s: typeof raw[0]) => {
    if (!s.score.isValid) return -Infinity;
    if (sortKey === "min") return s.score.scoreMin;
    if (sortKey === "max") return s.score.scoreMax;
    return s.score.scoreAvg;
  };

  const results = [...raw].sort((a, b) => getSortScore(b) - getSortScore(a));
  const validResults = results.filter((r) => r.score.isValid);
  const topSortScore = validResults.length > 0 ? getSortScore(validResults[0]) : null;

  if (validResults.length === 0) {
    return (
      <div className="text-center py-16 text-slate-400 text-sm">
        No scores yet — go to each scenario tab and fill in importance weights and likelihoods.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header row: description + sort toggle */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <p className="text-sm text-slate-500">
          Sorted by <span className="font-medium text-slate-700">{sortKey}</span> score. The highest score is your recommended choice.
        </p>
        <div className="flex gap-1 bg-slate-100 rounded-lg p-1 shrink-0">
          {SORT_OPTIONS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => onSortChange(key)}
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

      {results.map(({ scenario, score }, i) => {
        const isTop = score.isValid && getSortScore({ scenario, score }) === topSortScore;
        const rank = score.isValid ? i + 1 : null;
        const displayScore = score.isValid
          ? sortKey === "min" ? score.scoreMin
          : sortKey === "max" ? score.scoreMax
          : score.scoreAvg
          : 0;
        const displayLabel = sortKey === "min" ? "min" : sortKey === "max" ? "max" : "median";

        return (
          <div
            key={scenario.id}
            className={`rounded-xl border p-5 flex items-center gap-5 ${
              isTop ? "border-emerald-400 bg-emerald-50" : "border-slate-200 bg-white"
            }`}
          >
            <div className={`text-2xl font-bold w-8 text-center shrink-0 ${isTop ? "text-emerald-600" : "text-slate-300"}`}>
              {rank ?? "—"}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="font-semibold text-slate-800">{scenario.label}</span>
                {isTop && (
                  <span className="text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full font-semibold shrink-0">
                    Recommended
                  </span>
                )}
              </div>
              {score.isValid ? (
                <>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${isTop ? "bg-emerald-500" : "bg-blue-400"}`}
                      style={{ width: `${displayScore}%` }}
                    />
                  </div>
                  <div className="text-xs text-slate-500 font-medium mt-1">
                    Range: {score.scoreMin.toFixed(1)} – {score.scoreMax.toFixed(1)}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    SD ± {score.sd.toFixed(1)} &nbsp;·&nbsp; 95% CI [{score.ciLow.toFixed(1)} – {score.ciHigh.toFixed(1)}]
                  </div>
                </>
              ) : (
                <p className="text-xs text-slate-400 italic">No data yet</p>
              )}
            </div>

            {score.isValid && (
              <div className="text-right shrink-0">
                <div className="text-3xl font-bold text-slate-900">{displayScore.toFixed(1)}</div>
                <div className="text-xs text-slate-400">{displayLabel} / 100</div>
              </div>
            )}
          </div>
        );
      })}

      <p className="text-xs text-slate-400 pt-2">
        Score = weighted expected value (0–100) using importance weights and the midpoint of each score range.
        Higher score = stronger overall fit for that combination.
      </p>
    </div>
  );
}
