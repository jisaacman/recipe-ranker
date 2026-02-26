"use client";

import { useState } from "react";
import { Recipe, PendingRecipe } from "@/types/recipe";

export type RankingState =
  | { phase: "idle" }
  | { phase: "choosing-tier"; pending: PendingRecipe }
  | {
      phase: "comparing";
      pending: PendingRecipe;
      tier: "liked" | "disliked";
      lo: number;
      hi: number;
      tieredRecipes: Recipe[]; // snapshot of the tier at the moment ranking began
    };

export function useRankingFlow(
  onComplete: (
    pending: PendingRecipe,
    tier: "liked" | "disliked",
    position: number
  ) => void
) {
  const [state, setState] = useState<RankingState>({ phase: "idle" });

  // Called when the form is submitted
  const start = (pending: PendingRecipe) =>
    setState({ phase: "choosing-tier", pending });

  // Called when the user picks liked/disliked
  const chooseTier = (
    tier: "liked" | "disliked",
    tieredRecipes: Recipe[] // current sorted recipes in that tier
  ) => {
    if (state.phase !== "choosing-tier") return;

    if (tieredRecipes.length === 0) {
      // No comparisons needed — first recipe in this tier
      onComplete(state.pending, tier, 0);
      setState({ phase: "idle" });
      return;
    }

    setState({
      phase: "comparing",
      pending: state.pending,
      tier,
      lo: 0,
      hi: tieredRecipes.length,
      tieredRecipes,
    });
  };

  // Called when the user picks "this new recipe" or "the existing one"
  const pick = (preferNew: boolean) => {
    if (state.phase !== "comparing") return;
    const { lo, hi, tieredRecipes, pending, tier } = state;
    const mid = Math.floor((lo + hi) / 2);

    const nextLo = preferNew ? lo : mid + 1;
    const nextHi = preferNew ? mid : hi;

    if (nextLo >= nextHi) {
      onComplete(pending, tier, nextLo);
      setState({ phase: "idle" });
    } else {
      setState({ ...state, lo: nextLo, hi: nextHi });
    }
  };

  const cancel = () => setState({ phase: "idle" });

  // The recipe the new one is being compared against right now
  const currentComparison =
    state.phase === "comparing"
      ? state.tieredRecipes[Math.floor((state.lo + state.hi) / 2)]
      : null;

  // Upper bound on remaining comparisons — useful for a progress hint
  const comparisonsLeft =
    state.phase === "comparing"
      ? Math.ceil(Math.log2(state.hi - state.lo + 1))
      : 0;

  return { state, start, chooseTier, pick, cancel, currentComparison, comparisonsLeft };
}
