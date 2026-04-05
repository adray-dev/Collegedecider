import { computeScore } from "@/lib/calculations";
import { SCENARIOS } from "@/lib/constants";
import type { AppData } from "@/lib/types";

interface Props {
  appData: AppData;
}

export default function SummaryView({ appData }: Props) {
  const results = SCENARIOS.map((scenario) => ({
    scenario,
    score: computeScore(appData.scenarios[scenario.id].variables),
  })).sort((a, b) => {
    if (!a.score.isValid && !b.score.isValid) return 0;
    if (!a.score.isValid) return 1;
    if (!b.score.isValid) return -1;
    return b.score.score - a.score.score;
  });

  const topScore = results.find((r) => r.score.isValid)?.score.score ?? null;
  const hasAnyData = results.some((r) => r.score.isValid);

  if (!hasAnyData) {
    return (
      <div className="text-center py-16 text-slate-400 text-sm">
        No scores yet — go to each scenario tab and fill in importance weights and likelihoods.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">
        Scenarios ranked by score. The highest score is your recommended choice.
      </p>

      {results.map(({ scenario, score }, i) => {
        const isTop = score.isValid && score.score === topScore;
        const rank = score.isValid ? i + 1 : null;

        return (
          <div
            key={scenario.id}
            className={`rounded-xl border p-5 flex items-center gap-5 ${
              isTop
                ? "border-emerald-400 bg-emerald-50"
                : "border-slate-200 bg-white"
            }`}
          >
            {/* Rank badge */}
            <div className={`text-2xl font-bold w-8 text-center shrink-0 ${
              isTop ? "text-emerald-600" : "text-slate-300"
            }`}>
              {rank ?? "—"}
            </div>

            {/* Label + bar */}
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
                      className={`h-full rounded-full ${isTop ? "bg-emerald-500" : "bg-blue-400"}`}
                      style={{ width: `${score.score}%` }}
                    />
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    95% CI [{score.ciLow.toFixed(1)} – {score.ciHigh.toFixed(1)}]
                  </div>
                </>
              ) : (
                <p className="text-xs text-slate-400 italic">No data yet</p>
              )}
            </div>

            {/* Score */}
            {score.isValid && (
              <div className="text-right shrink-0">
                <div className="text-3xl font-bold text-slate-900">{score.score.toFixed(1)}</div>
                <div className="text-xs text-slate-400">± {score.sd.toFixed(1)}</div>
              </div>
            )}
          </div>
        );
      })}

      <p className="text-xs text-slate-400 pt-2">
        Score = weighted expected value (0–100) using importance weights and percentage likelihoods.
        Higher score = stronger overall fit for that combination.
      </p>
    </div>
  );
}
