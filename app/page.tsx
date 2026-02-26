"use client";

import { useRecipes } from "@/hooks/useRecipes";
import { useRankingFlow } from "@/hooks/useRankingFlow";
import { PendingRecipe } from "@/types/recipe";
import RecipeForm from "@/components/RecipeForm";
import RecipeList from "@/components/RecipeList";
import RankingFlow from "@/components/RankingFlow";

export default function Home() {
  const { recipes, addRecipe, deleteRecipe, getTieredRecipes, mounted } =
    useRecipes();

  const { state, start, chooseTier, pick, pickTie, cancel, currentComparison, comparisonsLeft } =
    useRankingFlow(
      (pending: PendingRecipe, tier: "liked" | "disliked", position: number, tieWithId?: string) => {
        addRecipe({ ...pending, tier }, position, tieWithId);
      }
    );

  const likedCount = recipes.filter((r) => r.tier === "liked").length;
  const dislikedCount = recipes.filter((r) => r.tier === "disliked").length;
  const avgRating =
    recipes.length > 0
      ? (recipes.reduce((s, r) => s + r.rating, 0) / recipes.length).toFixed(1)
      : null;

  return (
    <main className="min-h-screen bg-stone-50">
      <div className="max-w-lg mx-auto px-4 py-10">

        {/* Header */}
        <header className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-stone-900">
            Recipe Ranker
          </h1>
          <p className="text-sm text-stone-400 mt-1">
            Rate and rank your favorite recipes
          </p>
        </header>

        {/* Stats bar */}
        {mounted && recipes.length > 0 && (
          <div className="flex items-center bg-white border border-stone-100 rounded-2xl mb-6 divide-x divide-stone-100 shadow-sm">
            <div className="flex-1 text-center py-3">
              <p className="text-xl font-bold text-emerald-500">{likedCount}</p>
              <p className="text-xs text-stone-400 mt-0.5">Liked</p>
            </div>
            <div className="flex-1 text-center py-3">
              <p className="text-xl font-bold text-rose-400">{dislikedCount}</p>
              <p className="text-xs text-stone-400 mt-0.5">Disliked</p>
            </div>
            <div className="flex-1 text-center py-3">
              <p className="text-xl font-bold text-stone-700">{avgRating}</p>
              <p className="text-xs text-stone-400 mt-0.5">Avg score</p>
            </div>
          </div>
        )}

        {/* Add recipe */}
        <div className="mb-6">
          <RecipeForm onSubmit={start} />
        </div>

        {/* Ranked list */}
        {mounted && (
          <RecipeList recipes={recipes} onDelete={deleteRecipe} />
        )}
      </div>

      {/* Ranking flow overlay */}
      <RankingFlow
        state={state}
        currentComparison={currentComparison}
        comparisonsLeft={comparisonsLeft}
        onChooseTier={(tier) => chooseTier(tier, getTieredRecipes(tier))}
        onPick={pick}
        onPickTie={pickTie}
        onCancel={cancel}
      />
    </main>
  );
}
