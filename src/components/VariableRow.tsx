import type { Variable } from "@/lib/types";

interface Props {
  variable: Variable;
  onUpdateName: (id: string, name: string) => void;
  onUpdateWeight: (id: string, value: string) => void;
  onUpdateLikelihood: (id: string, school: "A" | "B", value: number | null) => void;
  onDelete: (id: string) => void;
  totalWeight: number;
}

function LikelihoodInput({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (v: number | null) => void;
}) {
  return (
    <input
      type="number"
      min={1}
      max={10}
      step={1}
      value={value ?? ""}
      placeholder="1–10"
      onChange={(e) => {
        const raw = parseInt(e.target.value, 10);
        if (e.target.value === "") { onChange(null); return; }
        const clamped = Math.min(10, Math.max(1, raw));
        onChange(isNaN(clamped) ? null : clamped);
      }}
      className="w-full text-sm text-center border border-slate-200 rounded-md px-2 py-1 bg-white outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 text-slate-700 placeholder:text-slate-300"
    />
  );
}

export default function VariableRow({
  variable,
  onUpdateName,
  onUpdateWeight,
  onUpdateLikelihood,
  onDelete,
  totalWeight,
}: Props) {
  const budgetExhausted = totalWeight >= 100 && variable.weight === 0;

  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50 group">
      {/* Variable name */}
      <td className="py-2 pr-3 pl-1">
        <input
          type="text"
          value={variable.name}
          onChange={(e) => onUpdateName(variable.id, e.target.value)}
          placeholder="Variable name…"
          className="w-full text-sm text-slate-800 bg-transparent border-b border-transparent focus:border-slate-300 outline-none px-1 py-0.5 placeholder:text-slate-300"
        />
      </td>

      {/* Level of importance */}
      <td className="py-2 px-2 w-28 border-r border-slate-100">
        <input
          type="number"
          min={0}
          max={100}
          value={variable.weight === 0 ? "" : variable.weight}
          onChange={(e) => onUpdateWeight(variable.id, e.target.value)}
          placeholder="0"
          className={`w-full text-sm text-center border rounded-md px-2 py-1 outline-none focus:ring-2 transition-colors ${
            budgetExhausted
              ? "border-amber-300 bg-amber-50 focus:ring-amber-200"
              : "border-slate-200 bg-white focus:ring-blue-200"
          }`}
        />
      </td>

      {/* Likelihood A */}
      <td className="py-2 px-2 w-32">
        <LikelihoodInput
          value={variable.likelihoodA}
          onChange={(v) => onUpdateLikelihood(variable.id, "A", v)}
        />
      </td>

      {/* Likelihood B */}
      <td className="py-2 px-2 w-32">
        <LikelihoodInput
          value={variable.likelihoodB}
          onChange={(v) => onUpdateLikelihood(variable.id, "B", v)}
        />
      </td>

      {/* Delete */}
      <td className="py-2 pl-2 w-8">
        <button
          onClick={() => onDelete(variable.id)}
          title="Remove variable"
          className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-500 p-1 rounded"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </button>
      </td>
    </tr>
  );
}
