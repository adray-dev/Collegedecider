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
        <div className="flex items-end gap-6">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold text-slate-900">{score.score.toFixed(1)}</span>
              <span className="text-slate-400 text-sm">/ 100</span>
            </div>
            <div className="mt-1 h-2 w-48 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full"
                style={{ width: `${score.score}%` }}
              />
            </div>
          </div>
          <div className="text-sm text-slate-500 space-y-0.5 pb-1">
            <div><span className="text-slate-400">SD</span> <span className="font-medium">± {score.sd.toFixed(1)}</span></div>
            <div><span className="text-slate-400">95% CI</span> <span className="font-medium">[{score.ciLow.toFixed(1)} – {score.ciHigh.toFixed(1)}]</span></div>
          </div>
        </div>
      ) : (
        <p className="text-sm text-slate-400 italic">Add importance weights and likelihoods to see a score.</p>
      )}
    </div>
  );
}
