"use client";

import { useState, useEffect, useRef } from "react";
import {
  buildDefaultAllSessionsData,
  migrateToAllSessionsData,
  sanitizeAllSessionsData,
  SCENARIO_IDS,
} from "@/lib/constants";
import ScenarioTabs from "./ScenarioTabs";
import GlobalSummaryView from "./GlobalSummaryView";
import type { AllSessionsData, AppData, Session } from "@/lib/types";

const LS_NEW_KEY = "college-decider:sessions";
const LS_OLD_KEY = "college-decider:app-data";

interface Props {
  initialData: AllSessionsData;
}

function loadFromStorage(): AllSessionsData | null {
  try {
    // Try new key first
    const raw = localStorage.getItem(LS_NEW_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AllSessionsData;
      if (Array.isArray(parsed?.sessions) && parsed.sessions.length > 0) {
        return sanitizeAllSessionsData(parsed);
      }
    }
    // Fall back to old single-session key and migrate
    const oldRaw = localStorage.getItem(LS_OLD_KEY);
    if (oldRaw) {
      const oldParsed = JSON.parse(oldRaw);
      if (oldParsed?.variables || oldParsed?.scenarios) {
        // Reject old number-format likelihood
        const firstScenario = oldParsed.scenarios?.[SCENARIO_IDS[0]];
        const firstEntry = firstScenario && Object.values(firstScenario.entries ?? {})[0] as { likelihood?: unknown } | undefined;
        if (firstEntry && typeof firstEntry.likelihood === "number") return null;
        return migrateToAllSessionsData(oldParsed);
      }
    }
    return null;
  } catch {
    return null;
  }
}

function saveToStorage(data: AllSessionsData) {
  try {
    localStorage.setItem(LS_NEW_KEY, JSON.stringify(data));
  } catch { /* quota exceeded */ }
}

export default function SessionTabs({ initialData }: Props) {
  const [sessions, setSessions] = useState<Session[]>(() => {
    const local = typeof window !== "undefined" ? loadFromStorage() : null;
    const server = initialData.lastSaved ? sanitizeAllSessionsData(initialData) : null;

    let chosen: AllSessionsData;
    if (server && local?.lastSaved) {
      chosen = server.lastSaved! >= local.lastSaved ? server : local;
    } else if (server) {
      chosen = server;
    } else if (local) {
      chosen = local;
    } else {
      chosen = buildDefaultAllSessionsData();
    }
    return chosen.sessions;
  });

  const [activeIdx, setActiveIdx] = useState<number | "global">(0);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editName, setEditName] = useState("");

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender = useRef(true);
  const suppressNextSave = useRef(false);

  // On mount: fetch latest from API, use if newer
  useEffect(() => {
    fetch("/api/data")
      .then((r) => r.json())
      .then((data: AllSessionsData) => {
        if (!data?.lastSaved || !Array.isArray(data.sessions)) return;
        const sanitized = sanitizeAllSessionsData(data);
        setSessions((current) => {
          const currentSaved = current[0]?.appData?.lastSaved ?? null;
          const allSaved = current.map(s => s.appData.lastSaved).filter(Boolean);
          const latestLocal = allSaved.length > 0 ? allSaved.sort().at(-1)! : currentSaved;
          if (!latestLocal || sanitized.lastSaved! > latestLocal) {
            suppressNextSave.current = true;
            return sanitized.sessions;
          }
          return current;
        });
      })
      .catch(() => {});
  }, []);

  // Auto-save whenever sessions change
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    if (suppressNextSave.current) { suppressNextSave.current = false; return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      const timestamp = new Date().toISOString();
      const toSave: AllSessionsData = { sessions, lastSaved: timestamp };
      saveToStorage(toSave);
      try {
        const res = await fetch("/api/data", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(toSave),
        });
        if (!res.ok) throw new Error();
      } catch { /* silent — localStorage already saved */ }
    }, 1000);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [sessions]);

  function updateSession(idx: number, newData: AppData) {
    setSessions((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, appData: newData } : s))
    );
  }

  function startRename(idx: number) {
    setEditingIdx(idx);
    setEditName(sessions[idx].name);
  }

  function commitRename() {
    if (editingIdx === null) return;
    const trimmed = editName.trim();
    if (trimmed) {
      setSessions((prev) =>
        prev.map((s, i) => (i === editingIdx ? { ...s, name: trimmed } : s))
      );
    }
    setEditingIdx(null);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Grad School Decision Calculator</h1>
          <p className="text-sm text-blue-700 mt-2">
            <strong>How to use:</strong> Set the <em>Level of Importance</em> for each factor (must
            total 100). Then rate how likely each outcome is for this combination (0–100%). Adding
            or removing a variable updates it across all scenario tabs within a test.
          </p>
        </div>

        {/* Session tab bar */}
        <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 mb-4 overflow-x-auto">
          {/* Global summary tab */}
          <button
            onClick={() => setActiveIdx("global")}
            className={`whitespace-nowrap text-sm font-semibold px-4 py-2 rounded-lg transition-colors ${
              activeIdx === "global"
                ? "bg-slate-800 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            All Tests
          </button>

          {/* Individual session tabs */}
          {sessions.map((session, i) => (
            <button
              key={session.id}
              onClick={() => setActiveIdx(i)}
              onDoubleClick={() => startRename(i)}
              className={`flex-1 whitespace-nowrap text-sm font-semibold px-4 py-2 rounded-lg transition-colors ${
                activeIdx === i
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              {editingIdx === i ? (
                <input
                  autoFocus
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onBlur={commitRename}
                  onKeyDown={(e) => { if (e.key === "Enter") commitRename(); if (e.key === "Escape") setEditingIdx(null); }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-transparent outline-none text-center w-full"
                />
              ) : (
                <span title="Double-click to rename">{session.name}</span>
              )}
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-400 mb-6">Double-click a test tab to rename it. Each test is fully independent.</p>

        {/* Global summary view */}
        <div className={activeIdx === "global" ? "" : "hidden"}>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-5">All Tests — Combined Summary</h2>
            <GlobalSummaryView sessions={sessions} />
          </div>
        </div>

        {/* Render all 3 ScenarioTabs instances — hide inactive ones to preserve state */}
        {sessions.map((session, i) => (
          <div key={session.id} className={activeIdx === i ? "" : "hidden"}>
            <ScenarioTabs
              appData={session.appData}
              onDataChange={(newData) => updateSession(i, newData)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
