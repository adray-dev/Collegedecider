import { computeScore } from "@/lib/calculations";
import { SCENARIOS } from "@/lib/constants";
import type { AppData } from "@/lib/types";

interface Props {
  appData: AppData;
}

export default function SummaryView({ appData }: Props) {
  const results = SCENARIOS.map((scenario) => {
    const { variables } = appData.scenarios[scenario.id];
    const scoreA = computeScore(variables, "A");
    const scoreB = computeScore(variables, "B");
    const winner =
      scoreA.isValid && scoreB.isValid
        ? scoreA.score > scoreB.score
          ? scenario.schoolA
          : scoreB.score > scoreA.score
          ? scenario.schoolB
          : "Tie"
        : null;

    return { scenario, scoreA, scoreB, winner };
  });

  const hasAnyData = results.some((r) => r.scoreA.isValid || r.scoreB.isValid);

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-500">
        Scores across all four scenarios. Fill in weights and likelihoods in each tab to see results here.
      </p>

      {!hasAnyData && (
        <div className="text-center py-16 text-slate-400 text-sm">
          No scores yet — go to each scenario tab and fill in weights and likelihoods.
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {results.map(({ scenario, scoreA, scoreB, winner }) => (
          <div
            key={scenario.id}
            className="rounded-xl border border-slate-200 bg-white overflow-hidden"
          >
            {/* Scenario header */}
            <div className="bg-slate-50 px-5 py-3 border-b border-slate-200">
              <h3 className="font-semibold text-slate-800">{scenario.label}</h3>
            </div>

            <div className="px-5 py-4 flex gap-4">
              {/* School A */}
              <div className={`flex-1 rounded-lg p-4 ${winner === scenario.schoolA ? "bg-emerald-50 border border-emerald-300" : "bg-slate-50 border border-slate-200"}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-blue-700">{scenario.schoolA}</span>
                  {winner === scenario.schoolA && (
                    <span className="text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full font-semibold">
                      Recommended
                    </span>
                  )}
                </div>
                {scoreA.isValid ? (
                  <>
                    <div className="text-3xl font-bold text-slate-900">{scoreA.score.toFixed(1)}</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      ± {scoreA.sd.toFixed(1)} &nbsp;|&nbsp; CI [{scoreA.ciLow.toFixed(1)} – {scoreA.ciHigh.toFixed(1)}]
                    </div>
                    {/* Score bar */}
                    <div className="mt-2 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${scoreA.score}%` }}
                      />
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-slate-400 italic mt-1">No data yet</p>
                )}
              </div>

              {/* VS divider */}
              <div className="flex items-center text-slate-300 font-bold text-sm">vs</div>

              {/* School B */}
              <div className={`flex-1 rounded-lg p-4 ${winner === scenario.schoolB ? "bg-emerald-50 border border-emerald-300" : "bg-slate-50 border border-slate-200"}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-violet-700">{scenario.schoolB}</span>
                  {winner === scenario.schoolB && (
                    <span className="text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full font-semibold">
                      Recommended
                    </span>
                  )}
                </div>
                {scoreB.isValid ? (
                  <>
                    <div className="text-3xl font-bold text-slate-900">{scoreB.score.toFixed(1)}</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      ± {scoreB.sd.toFixed(1)} &nbsp;|&nbsp; CI [{scoreB.ciLow.toFixed(1)} – {scoreB.ciHigh.toFixed(1)}]
                    </div>
                    {/* Score bar */}
                    <div className="mt-2 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-violet-500 rounded-full"
                        style={{ width: `${scoreB.score}%` }}
                      />
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-slate-400 italic mt-1">No data yet</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-slate-400">
        Score = weighted expected value (0–100). Higher score = stronger overall fit for that scenario.
      </p>
    </div>
  );
}
