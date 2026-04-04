"use client";

import { useState } from "react";
import type { AppData } from "@/lib/types";

interface Props {
  data: AppData;
}

type SaveState = "idle" | "saving" | "saved" | "error";

export default function SaveButton({ data }: Props) {
  const [state, setState] = useState<SaveState>("idle");

  async function handleSave() {
    setState("saving");
    try {
      const res = await fetch("/api/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Save failed");
      setState("saved");
      setTimeout(() => setState("idle"), 2500);
    } catch {
      setState("error");
      setTimeout(() => setState("idle"), 3000);
    }
  }

  const label: Record<SaveState, string> = {
    idle: "Save",
    saving: "Saving…",
    saved: "Saved",
    error: "Save failed — retry?",
  };

  const colorClass: Record<SaveState, string> = {
    idle: "bg-blue-600 hover:bg-blue-700 text-white",
    saving: "bg-blue-400 text-white cursor-not-allowed",
    saved: "bg-emerald-600 text-white",
    error: "bg-red-600 hover:bg-red-700 text-white",
  };

  return (
    <button
      onClick={handleSave}
      disabled={state === "saving"}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${colorClass[state]}`}
    >
      {state === "saved" && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 inline mr-1 -mt-0.5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      )}
      {label[state]}
    </button>
  );
}
