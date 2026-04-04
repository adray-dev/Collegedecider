import type { SchoolScore } from "@/lib/types";

interface Props {
  schoolName: string;
  score: SchoolScore;
  isRecommended: boolean;
}

export default function ScoreDisplay({ schoolName, score, isRecommended }: Props) {
  return (
    <div
      className={`flex-1 rounded-xl border p-5 ${
        isRecommended
          ? "border-emerald-400 bg-emerald-50"
          : "border-slate-200 bg-slate-50"
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        <h3 className="font-semibold text-slate-800 text-lg">{schoolName}</h3>
        {isRecommended && (
          <span className="text-xs font-semibold bg-emerald-500 text-white px-2 py-0.5 rounded-full">
            Recommended
          </span>
        )}
      </div>

      {score.isValid ? (
        <>
          <div className="flex items-baseline gap-1 mb-1">
            <span className="text-4xl font-bold text-slate-900">
              {score.score.toFixed(1)}
            </span>
            <span className="text-slate-500 text-sm">/ 100</span>
          </div>
          <div className="text-sm text-slate-600 space-y-0.5">
            <div>
              <span className="text-slate-400">SD</span>{" "}
              <span className="font-medium">± {score.sd.toFixed(1)}</span>
            </div>
            <div>
              <span className="text-slate-400">95% CI</span>{" "}
              <span className="font-medium">
                [{score.ciLow.toFixed(1)} – {score.ciHigh.toFixed(1)}]
              </span>
            </div>
          </div>
        </>
      ) : (
        <p className="text-sm text-slate-400 italic mt-1">
          Add weights and likelihoods to see a score
        </p>
      )}
    </div>
  );
}
