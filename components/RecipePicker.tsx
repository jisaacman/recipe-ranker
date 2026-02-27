"use client";

import { useState } from "react";
import { Recipe } from "@/types/recipe";

interface Props {
  recipes: Recipe[];
  slotLabel: string; // e.g. "Monday · Breakfast"
  onPick: (recipe: Recipe) => void;
  onClose: () => void;
}

function ratingBg(rating: number): string {
  if (rating >= 8) return "bg-emerald-500";
  if (rating >= 5) return "bg-amber-400";
  return "bg-rose-400";
}

const CATEGORY_COLORS: Record<string, string> = {
  "Breakfast":    "bg-amber-100 text-amber-700",
  "Lunch/Dinner": "bg-sky-100 text-sky-700",
  "Dessert":      "bg-pink-100 text-pink-700",
  "Drinks":       "bg-violet-100 text-violet-700",
};

export default function RecipePicker({ recipes, slotLabel, onPick, onClose }: Props) {
  const [search, setSearch] = useState("");

  const filtered = recipes.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.author.toLowerCase().includes(search.toLowerCase()) ||
      r.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-md flex flex-col max-h-[80vh]">

        {/* Header */}
        <div className="p-5 pb-3 border-b border-stone-100 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base font-semibold text-stone-900">Add a recipe</h2>
              <p className="text-xs text-stone-400 mt-0.5">{slotLabel}</p>
            </div>
            <button
              onClick={onClose}
              className="text-stone-300 hover:text-stone-500 text-xl leading-none"
            >
              ×
            </button>
          </div>
          <input
            autoFocus
            placeholder="Search your recipes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-200 placeholder:text-stone-300"
          />
        </div>

        {/* Recipe list */}
        <ul className="overflow-y-auto flex-1 p-3 space-y-1">
          {filtered.length === 0 ? (
            <li className="text-center py-10 text-sm text-stone-400">
              No recipes found
            </li>
          ) : (
            filtered.map((recipe) => {
              const catColor =
                CATEGORY_COLORS[recipe.category] ?? "bg-stone-100 text-stone-500";
              return (
                <li key={recipe.id}>
                  <button
                    onClick={() => onPick(recipe)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-stone-50 transition-colors text-left"
                  >
                    <div
                      className={`w-9 h-9 rounded-full ${ratingBg(recipe.rating)} text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-sm`}
                    >
                      {recipe.rating}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-stone-900 truncate text-sm">
                        {recipe.name}
                      </p>
                      {recipe.author && (
                        <p className="text-xs text-stone-400 truncate">
                          {recipe.author}
                        </p>
                      )}
                    </div>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${catColor}`}
                    >
                      {recipe.category}
                    </span>
                  </button>
                </li>
              );
            })
          )}
        </ul>
      </div>
    </div>
  );
}
