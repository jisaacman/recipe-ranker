"use client";

import { useState, useRef } from "react";
import { useRecipes } from "@/hooks/useRecipes";
import { useRankingFlow } from "@/hooks/useRankingFlow";
import { PendingRecipe, Recipe } from "@/types/recipe";
import RecipeForm from "@/components/RecipeForm";
import RecipeList from "@/components/RecipeList";
import RankingFlow from "@/components/RankingFlow";
import RecipeDetail from "@/components/RecipeDetail";

export default function Home() {
  const { recipes, addRecipe, updateRecipe, deleteRecipe, getTieredRecipes, mounted } =
    useRecipes();

  // Re-rank context: preserves the original ID, notes, and timesMade across the ranking flow
  const rerankContextRef = useRef<{ id: string; notes: string; timesMade: number } | null>(null);

  const { state, start, chooseTier, pick, pickTie, cancel, currentComparison, comparisonsLeft } =
    useRankingFlow(
      (pending: PendingRecipe, tier: "liked" | "disliked", position: number, tieWithId?: string) => {
        const ctx = rerankContextRef.current;
        addRecipe(
          { ...pending, tier, notes: ctx?.notes ?? "", timesMade: ctx?.timesMade ?? 0 },
          position,
          tieWithId,
          ctx?.id
        );
        rerankContextRef.current = null;
      }
    );

  // Add recipe form
  const [formOpen, setFormOpen] = useState(false);

  // Detail modal
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedRecipe = recipes.find((r) => r.id === selectedId) ?? null;

  const handleRerank = (recipe: Recipe) => {
    setSelectedId(null);
    rerankContextRef.current = { id: recipe.id, notes: recipe.notes, timesMade: recipe.timesMade };
    deleteRecipe(recipe.id);
    start({ name: recipe.name, author: recipe.author, source: recipe.source, category: recipe.category });
  };

  const likedCount = recipes.filter((r) => r.tier === "liked").length;
  const dislikedCount = recipes.filter((r) => r.tier === "disliked").length;
  const avgRating =
    recipes.length > 0
      ? (recipes.reduce((s, r) => s + r.rating, 0) / recipes.length).toFixed(1)
      : null;

  return (
    <main className="min-h-screen bg-stone-50 pb-24">
      <div className="max-w-lg mx-auto px-4 py-10">

        {/* Header */}
        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-stone-900">
            My Recipes
          </h1>
          <p className="text-sm text-stone-400 mt-0.5">
            Ranked by taste
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

        {/* Ranked list */}
        {mounted && (
          <RecipeList
            recipes={recipes}
            onSelect={(recipe) => setSelectedId(recipe.id)}
            onDelete={deleteRecipe}
          />
        )}
      </div>

      {/* Floating action button — add recipe */}
      {state.phase === "idle" && (
        <button
          onClick={() => setFormOpen(true)}
          className="fixed bottom-20 right-4 w-14 h-14 bg-stone-900 text-white rounded-full shadow-lg flex items-center justify-center text-2xl font-light hover:bg-stone-700 hover:scale-105 active:scale-95 transition-all z-30"
          title="Add a recipe"
        >
          +
        </button>
      )}

      {/* Add recipe modal */}
      <RecipeForm
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={start}
      />

      {/* Ranking flow overlay */}
      <RankingFlow
        state={state}
        currentComparison={currentComparison}
        comparisonsLeft={comparisonsLeft}
        onChooseTier={(tier) => {
          const category = state.phase === "choosing-tier" ? state.pending.category : "";
          chooseTier(tier, getTieredRecipes(tier, category));
        }}
        onPick={pick}
        onPickTie={pickTie}
        onCancel={cancel}
      />

      {/* Recipe detail / edit modal */}
      {selectedRecipe && (
        <RecipeDetail
          recipe={selectedRecipe}
          onSave={updateRecipe}
          onRerank={handleRerank}
          onDelete={deleteRecipe}
          onClose={() => setSelectedId(null)}
        />
      )}
    </main>
  );
}
