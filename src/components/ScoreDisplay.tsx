import type { SchoolScore } from "@/lib/types";

interface Props {
  scenarioLabel: string;
  score: SchoolScore;
}

export default function ScoreDisplay({ scenarioLabel, score }: Props) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
      <h3 className="font-semibold text-slate-700 text-sm mb-3">{scenarioLabel} — Score</h3>
      {score.isValid ? (
        <div className="space-y-2">
          {/* Average score — prominent */}
          <div className="flex items-baseline gap-1.5">
            <span className="text-4xl font-bold text-slate-900">{score.scoreAvg.toFixed(1)}</span>
            <span className="text-slate-400 text-sm">/ 100</span>
          </div>

          {/* Progress bar */}
          <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${score.scoreAvg}%` }}
            />
          </div>

          {/* Score range — medium */}
          <div className="text-sm text-slate-600 font-medium">
            Range: {score.scoreMin.toFixed(1)} – {score.scoreMax.toFixed(1)}
          </div>

          {/* SD and CI — small */}
          <div className="text-xs text-slate-400 space-y-0.5">
            <div>SD ± {score.sd.toFixed(1)}</div>
            <div>95% CI [{score.ciLow.toFixed(1)} – {score.ciHigh.toFixed(1)}]</div>
          </div>
        </div>
      ) : (
        <p className="text-sm text-slate-400 italic">Add importance weights and likelihoods to see a score.</p>
      )}
    </div>
  );
}
