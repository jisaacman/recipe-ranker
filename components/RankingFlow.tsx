"use client";

import { RankingState } from "@/hooks/useRankingFlow";
import { Recipe } from "@/types/recipe";

interface Props {
  state: RankingState;
  currentComparison: Recipe | null;
  comparisonsLeft: number;
  onChooseTier: (tier: "liked" | "disliked") => void;
  onPick: (preferNew: boolean) => void;
  onPickTie: () => void;
  onCancel: () => void;
}

export default function RankingFlow({
  state,
  currentComparison,
  comparisonsLeft,
  onChooseTier,
  onPick,
  onPickTie,
  onCancel,
}: Props) {
  if (state.phase === "idle") return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-5">

        {/* ── Step 1: Liked or disliked? ── */}
        {state.phase === "choosing-tier" && (
          <>
            <div>
              <p className="text-xs text-stone-400 uppercase tracking-widest mb-2">
                Step 1
              </p>
              <h2 className="text-xl font-bold text-stone-900">
                Did you like &ldquo;{state.pending.name}&rdquo;?
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onChooseTier("liked")}
                className="flex flex-col items-center gap-2 py-6 rounded-2xl bg-emerald-50 border-2 border-emerald-100 hover:border-emerald-300 hover:bg-emerald-100 transition-all"
              >
                <span className="text-3xl font-black text-emerald-400 leading-none">+</span>
                <span className="font-semibold text-stone-800">Liked it</span>
                <span className="text-xs text-stone-400">Scores 6–10</span>
              </button>

              <button
                onClick={() => onChooseTier("disliked")}
                className="flex flex-col items-center gap-2 py-6 rounded-2xl bg-rose-50 border-2 border-rose-100 hover:border-rose-300 hover:bg-rose-100 transition-all"
              >
                <span className="text-3xl font-black text-rose-400 leading-none">−</span>
                <span className="font-semibold text-stone-800">Didn&apos;t like it</span>
                <span className="text-xs text-stone-400">Scores 1–5</span>
              </button>
            </div>
          </>
        )}

        {/* ── Step 2+: Pairwise comparisons ── */}
        {state.phase === "comparing" && currentComparison && (
          <>
            <div>
              <p className="text-xs text-stone-400 uppercase tracking-widest mb-2">
                Finding your spot
              </p>
              <h2 className="text-xl font-bold text-stone-900">
                Which did you prefer?
              </h2>
              <p className="text-sm text-stone-400 mt-0.5">
                Tap the one you enjoyed more.
              </p>
            </div>

            {/* Comparison cards */}
            <div className="relative grid grid-cols-2 gap-3">
              {/* New recipe */}
              <button
                onClick={() => onPick(true)}
                className="flex flex-col items-start gap-2 p-4 rounded-2xl border-2 border-stone-100 hover:border-stone-900 hover:bg-stone-50 transition-all text-left"
              >
                <span className="text-xs font-semibold text-stone-400 uppercase tracking-wide">
                  New
                </span>
                <p className="font-semibold text-stone-900 leading-snug">
                  {state.pending.name}
                </p>
                {state.pending.author && (
                  <p className="text-xs text-stone-400">{state.pending.author}</p>
                )}
                <span className="text-xs text-stone-300">{state.pending.category}</span>
              </button>

              {/* VS pill */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                <span className="bg-stone-100 rounded-full text-xs font-bold text-stone-400 px-2.5 py-1">
                  vs
                </span>
              </div>

              {/* Existing recipe */}
              <button
                onClick={() => onPick(false)}
                className="flex flex-col items-start gap-2 p-4 rounded-2xl border-2 border-stone-100 hover:border-stone-900 hover:bg-stone-50 transition-all text-left"
              >
                <span className="text-xs font-semibold text-stone-400 uppercase tracking-wide">
                  #{currentComparison.rankInTier + 1} ranked
                </span>
                <p className="font-semibold text-stone-900 leading-snug">
                  {currentComparison.name}
                </p>
                {currentComparison.author && (
                  <p className="text-xs text-stone-400">{currentComparison.author}</p>
                )}
                <span className="text-xs font-bold text-stone-500">
                  {currentComparison.rating}
                </span>
              </button>
            </div>

            {/* Tie button */}
            <button
              onClick={onPickTie}
              className="w-full text-sm text-stone-400 hover:text-stone-700 transition-colors py-1 border border-stone-200 rounded-xl hover:border-stone-300"
            >
              It&apos;s a tie
            </button>

            {comparisonsLeft > 1 && (
              <p className="text-center text-xs text-stone-300">
                Up to {comparisonsLeft} more comparison{comparisonsLeft !== 1 ? "s" : ""}
              </p>
            )}
          </>
        )}

        <button
          onClick={onCancel}
          className="w-full text-xs text-stone-300 hover:text-stone-500 transition-colors pt-1"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
