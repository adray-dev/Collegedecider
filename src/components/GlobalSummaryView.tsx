import { useState } from "react";
import { computeScore } from "@/lib/calculations";
import { SCENARIOS } from "@/lib/constants";
import type { Session } from "@/lib/types";
import type { SortKey } from "./ScenarioTabs";

interface Props {
  sessions: Session[];
}

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "median", label: "Median" },
  { key: "min",    label: "Minimum" },
  { key: "max",    label: "Maximum" },
];

// Color palette per session index — no red, no green
export const SESSION_COLORS = [
  {
    headerBg:   "bg-indigo-600",
    headerText: "text-white",
    cardBg:     "bg-indigo-50",
    cardBorder: "border-indigo-200",
    bar:        "bg-indigo-500",
    label:      "text-indigo-700",
    tabActive:  "bg-indigo-600 text-white shadow-sm",
  },
  {
    headerBg:   "bg-sky-500",
    headerText: "text-white",
    cardBg:     "bg-sky-50",
    cardBorder: "border-sky-200",
    bar:        "bg-sky-400",
    label:      "text-sky-700",
    tabActive:  "bg-sky-500 text-white shadow-sm",
  },
  {
    headerBg:   "bg-violet-500",
    headerText: "text-white",
    cardBg:     "bg-violet-50",
    cardBorder: "border-violet-200",
    bar:        "bg-violet-400",
    label:      "text-violet-700",
    tabActive:  "bg-violet-500 text-white shadow-sm",
  },
] as const;

export default function GlobalSummaryView({ sessions }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("median");

  // For each session, compute + rank all 4 scenario scores
  const sessionRankings = sessions.map((session) =>
    SCENARIOS.map((scenario) => ({
      scenarioLabel: scenario.label,
      score: computeScore(
        session.appData.variables,
        session.appData.scenarios[scenario.id].entries
      ),
    })).sort((a, b) => {
      const val = (s: typeof a) => {
        if (!s.score.isValid) return -Infinity;
        if (sortKey === "min") return s.score.scoreMin;
        if (sortKey === "max") return s.score.scoreMax;
        return s.score.scoreAvg;
      };
      return val(b) - val(a);
    })
  );

  const displayVal = (score: ReturnType<typeof computeScore>): number | null => {
    if (!score.isValid) return null;
    if (sortKey === "min") return score.scoreMin;
    if (sortKey === "max") return score.scoreMax;
    return score.scoreAvg;
  };

  const displayLabel = sortKey === "min" ? "min" : sortKey === "max" ? "max" : "median";

  const hasAnyData = sessionRankings.some((ranks) => ranks.some((r) => r.score.isValid));

  if (!hasAnyData) {
    return (
      <div className="text-center py-16 text-slate-400 text-sm">
        No scores yet — fill in weights and score ranges in each test tab.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Sort toggle */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <p className="text-sm text-slate-500">
          Each test&apos;s scenarios ranked independently by{" "}
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

      {/* Grid: [rank label] [session 1] [session 2] [session 3] */}
      <div className="grid grid-cols-[2rem_1fr_1fr_1fr] gap-x-3 gap-y-2">

        {/* Column headers */}
        <div /> {/* rank label column — empty */}
        {sessions.map((session, si) => {
          const c = SESSION_COLORS[si % SESSION_COLORS.length];
          return (
            <div
              key={session.id}
              className={`${c.headerBg} ${c.headerText} text-sm font-semibold px-3 py-2 rounded-lg text-center truncate`}
            >
              {session.name}
            </div>
          );
        })}

        {/* One row per rank */}
        {Array.from({ length: SCENARIOS.length }, (_, rank) => (
          <>
            {/* Rank badge */}
            <div key={`label-${rank}`} className="flex items-center justify-center self-stretch">
              <span className="text-xs font-bold text-slate-400">#{rank + 1}</span>
            </div>

            {/* Cell for each session */}
            {sessions.map((session, si) => {
              const entry = sessionRankings[si][rank];
              const ds = entry ? displayVal(entry.score) : null;
              const c = SESSION_COLORS[si % SESSION_COLORS.length];

              return (
                <div
                  key={`${session.id}-rank${rank}`}
                  className={`rounded-xl border p-3 ${c.cardBorder} ${c.cardBg}`}
                >
                  <div className={`text-xs font-semibold ${c.label} mb-1.5 leading-snug`}>
                    {entry?.scenarioLabel ?? "—"}
                  </div>

                  {entry?.score.isValid && ds !== null ? (
                    <>
                      <div className="h-1.5 bg-white/70 rounded-full overflow-hidden mb-1.5">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${c.bar}`}
                          style={{ width: `${ds}%` }}
                        />
                      </div>
                      <div className="text-xl font-bold text-slate-800 leading-none">
                        {ds.toFixed(1)}
                      </div>
                      <div className={`text-xs ${c.label} mt-0.5 opacity-75`}>
                        {displayLabel} / 100
                      </div>
                    </>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No data</p>
                  )}
                </div>
              );
            })}
          </>
        ))}
      </div>

      <p className="text-xs text-slate-400 pt-1">
        Scores reflect each test&apos;s own weights — rankings are not compared across tests.
      </p>
    </div>
  );
}
