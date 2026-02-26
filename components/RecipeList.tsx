"use client";

import { useState } from "react";
import { Recipe, CATEGORIES } from "@/types/recipe";
import RecipeCard from "@/components/RecipeCard";

interface Props {
  recipes: Recipe[];
  onDelete: (id: string) => void;
}

const ALL = "All";
const TABS = [ALL, ...CATEGORIES] as const;
type Tab = (typeof TABS)[number];

export default function RecipeList({ recipes, onDelete }: Props) {
  const [filter, setFilter] = useState<Tab>(ALL);

  const filtered =
    filter === ALL ? recipes : recipes.filter((r) => r.category === filter);

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
                      active ? "bg-white/20 text-white" : "bg-stone-100 text-stone-400"
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
        <div className="text-center py-12 text-stone-400">
          <p className="text-sm">
            {recipes.length === 0
              ? "No recipes yet — add your first one above."
              : `No ${filter} recipes yet.`}
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {filtered.map((recipe, index) => (
            <li key={recipe.id}>
              <RecipeCard
                recipe={recipe}
                rank={index + 1}
                onDelete={onDelete}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
