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
      tieredRecipes: Recipe[];
    };

export function useRankingFlow(
  onComplete: (
    pending: PendingRecipe,
    tier: "liked" | "disliked",
    position: number,
    tieWithId?: string
  ) => void
) {
  const [state, setState] = useState<RankingState>({ phase: "idle" });

  const start = (pending: PendingRecipe) =>
    setState({ phase: "choosing-tier", pending });

  const chooseTier = (
    tier: "liked" | "disliked",
    tieredRecipes: Recipe[]
  ) => {
    if (state.phase !== "choosing-tier") return;

    if (tieredRecipes.length === 0) {
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

  // User declares a tie with the current comparison recipe
  const pickTie = () => {
    if (state.phase !== "comparing") return;
    const { lo, hi, tieredRecipes, pending, tier } = state;
    const mid = Math.floor((lo + hi) / 2);
    onComplete(pending, tier, mid, tieredRecipes[mid].id);
    setState({ phase: "idle" });
  };

  const cancel = () => setState({ phase: "idle" });

  const currentComparison =
    state.phase === "comparing"
      ? state.tieredRecipes[Math.floor((state.lo + state.hi) / 2)]
      : null;

  const comparisonsLeft =
    state.phase === "comparing"
      ? Math.ceil(Math.log2(state.hi - state.lo + 1))
      : 0;

  return { state, start, chooseTier, pick, pickTie, cancel, currentComparison, comparisonsLeft };
}
