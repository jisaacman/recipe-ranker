"use client";

import { RankingState } from "@/hooks/useRankingFlow";
import { Recipe } from "@/types/recipe";

interface Props {
  state: RankingState;
  currentComparison: Recipe | null;
  comparisonsLeft: number;
  onChooseTier: (tier: "liked" | "disliked") => void;
  onPick: (preferNew: boolean) => void;
  onCancel: () => void;
}

export default function RankingFlow({
  state,
  currentComparison,
  comparisonsLeft,
  onChooseTier,
  onPick,
  onCancel,
}: Props) {
  if (state.phase === "idle") return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-6">

        {/* ── Step 1: Liked or disliked? ── */}
        {state.phase === "choosing-tier" && (
          <>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">
                Step 1
              </p>
              <h2 className="text-xl font-bold text-gray-900">
                Did you like{" "}
                <span className="text-gray-600">
                  &ldquo;{state.pending.name}&rdquo;
                </span>
                ?
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onChooseTier("liked")}
                className="flex flex-col items-center gap-2 p-5 rounded-2xl border-2 border-gray-200 hover:border-emerald-400 hover:bg-emerald-50 transition-all"
              >
                <span className="text-2xl font-bold text-emerald-500">+</span>
                <span className="font-semibold text-gray-800">Liked it</span>
                <span className="text-xs text-gray-400 text-center">
                  Scores 6–10
                </span>
              </button>

              <button
                onClick={() => onChooseTier("disliked")}
                className="flex flex-col items-center gap-2 p-5 rounded-2xl border-2 border-gray-200 hover:border-rose-400 hover:bg-rose-50 transition-all"
              >
                <span className="text-2xl font-bold text-rose-400">−</span>
                <span className="font-semibold text-gray-800">
                  Didn&apos;t like it
                </span>
                <span className="text-xs text-gray-400 text-center">
                  Scores 1–5
                </span>
              </button>
            </div>
          </>
        )}

        {/* ── Step 2+: Pairwise comparisons ── */}
        {state.phase === "comparing" && currentComparison && (
          <>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">
                Finding your spot
              </p>
              <h2 className="text-xl font-bold text-gray-900">
                Which did you prefer?
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                Tap the one you enjoyed more.
              </p>
            </div>

            <div className="relative grid grid-cols-2 gap-3">
              {/* New recipe card */}
              <button
                onClick={() => onPick(true)}
                className="flex flex-col items-start gap-2 p-4 rounded-2xl border-2 border-gray-200 hover:border-gray-900 hover:bg-gray-50 transition-all text-left group"
              >
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  New
                </span>
                <p className="font-semibold text-gray-900 leading-snug">
                  {state.pending.name}
                </p>
                {state.pending.author && (
                  <p className="text-xs text-gray-400">
                    {state.pending.author}
                  </p>
                )}
                <span className="text-xs text-gray-300">
                  {state.pending.category}
                </span>
              </button>

              {/* VS divider */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
                <span className="text-xs font-bold text-gray-400">vs</span>
              </div>

              {/* Existing recipe card */}
              <button
                onClick={() => onPick(false)}
                className="flex flex-col items-start gap-2 p-4 rounded-2xl border-2 border-gray-200 hover:border-gray-900 hover:bg-gray-50 transition-all text-left group"
              >
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  #{currentComparison.rankInTier + 1} in{" "}
                  {currentComparison.tier}
                </span>
                <p className="font-semibold text-gray-900 leading-snug">
                  {currentComparison.name}
                </p>
                {currentComparison.author && (
                  <p className="text-xs text-gray-400">
                    {currentComparison.author}
                  </p>
                )}
                <span className="text-xs font-bold text-gray-500">
                  {currentComparison.rating}
                </span>
              </button>
            </div>

            {comparisonsLeft > 1 && (
              <p className="text-center text-xs text-gray-300">
                Up to {comparisonsLeft} more comparison
                {comparisonsLeft === 1 ? "" : "s"} remaining
              </p>
            )}
          </>
        )}

        <button
          onClick={onCancel}
          className="w-full text-sm text-gray-300 hover:text-gray-500 transition-colors pt-1"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
