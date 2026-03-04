"use client";

import { useState } from "react";
import { Recipe, CATEGORIES } from "@/types/recipe";
import RecipeCard from "@/components/RecipeCard";

interface Props {
  recipes: Recipe[];
  onSelect: (recipe: Recipe) => void;
  onDelete: (id: string) => void;
}

const ALL = "All";
const TABS = [ALL, ...CATEGORIES] as const;
type Tab = (typeof TABS)[number];

export default function RecipeList({ recipes, onSelect, onDelete }: Props) {
  const [filter, setFilter] = useState<Tab>(ALL);

  const filtered =
    filter === ALL ? recipes : recipes.filter((r) => r.category === filter);

  const likedRecipes = filtered.filter((r) => r.tier === "liked");
  const dislikedRecipes = filtered.filter((r) => r.tier === "disliked");
  const hasBothTiers = likedRecipes.length > 0 && dislikedRecipes.length > 0;

  const countFor = (tab: Tab) =>
    tab === ALL
      ? recipes.length
      : recipes.filter((r) => r.category === tab).length;

  return (
    <div className="space-y-4">
      {/* Category pill tabs */}
      {recipes.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {TABS.map((tab) => {
            const count = countFor(tab);
            const active = filter === tab;
            return (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  active
                    ? "bg-stone-900 text-white"
                    : "bg-white border border-stone-200 text-stone-500 hover:border-stone-300"
                }`}
              >
                {tab}
                {count > 0 && (
                  <span
                    className={`text-xs rounded-full px-1.5 py-0.5 ${
                      active
                        ? "bg-white/20 text-white"
                        : "bg-stone-100 text-stone-400"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Recipe cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-stone-400">
          {recipes.length === 0 ? (
            <>
              <p className="text-3xl mb-3">🍽️</p>
              <p className="text-sm font-medium text-stone-500">No recipes yet</p>
              <p className="text-xs mt-1 text-stone-300">Tap + to add your first recipe</p>
            </>
          ) : (
            <p className="text-sm">No {filter} recipes yet.</p>
          )}
        </div>
      ) : hasBothTiers ? (
        <div className="space-y-4">
          {/* Liked section */}
          <div>
            <p className="text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2 px-1">
              Liked
            </p>
            <ul className="space-y-2">
              {likedRecipes.map((recipe, i) => (
                <li key={recipe.id}>
                  <RecipeCard
                    recipe={recipe}
                    rank={i + 1}
                    onSelect={onSelect}
                    onDelete={onDelete}
                  />
                </li>
              ))}
            </ul>
          </div>

          {/* Disliked section */}
          <div>
            <p className="text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2 px-1">
              Didn&apos;t like
            </p>
            <ul className="space-y-2">
              {dislikedRecipes.map((recipe, i) => (
                <li key={recipe.id}>
                  <RecipeCard
                    recipe={recipe}
                    rank={i + 1}
                    onSelect={onSelect}
                    onDelete={onDelete}
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <ul className="space-y-2">
          {filtered.map((recipe, i) => (
            <li key={recipe.id}>
              <RecipeCard
                recipe={recipe}
                rank={i + 1}
                onSelect={onSelect}
                onDelete={onDelete}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
