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

  const { state, start, chooseTier, pick, cancel, currentComparison, comparisonsLeft } =
    useRankingFlow(
      (pending: PendingRecipe, tier: "liked" | "disliked", position: number) => {
        addRecipe({ ...pending, tier }, position);
      }
    );

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Recipe Ranker
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Track and rank your favorite recipes
          </p>
        </header>

        <RecipeForm onSubmit={start} />

        {mounted && (
          <section className="mt-8">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">
              {recipes.length > 0
                ? `${recipes.length} recipe${recipes.length === 1 ? "" : "s"} · sorted by rating`
                : "Your ranked list"}
            </h2>
            <RecipeList recipes={recipes} onDelete={deleteRecipe} />
          </section>
        )}
      </div>

      {/* Ranking flow renders as a fixed overlay outside the scroll area */}
      <RankingFlow
        state={state}
        currentComparison={currentComparison}
        comparisonsLeft={comparisonsLeft}
        onChooseTier={(tier) => chooseTier(tier, getTieredRecipes(tier))}
        onPick={pick}
        onCancel={cancel}
      />
    </main>
  );
}
