"use client";

import { Recipe } from "@/types/recipe";

interface Props {
  recipe: Recipe;
  rank: number;
  onDelete: (id: string) => void;
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

function safeHostname(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

export default function RecipeCard({ recipe, rank, onDelete }: Props) {
  const isUrl =
    recipe.source.startsWith("http://") ||
    recipe.source.startsWith("https://");

  const catColor =
    CATEGORY_COLORS[recipe.category] ?? "bg-stone-100 text-stone-500";

  return (
    <div className="bg-white rounded-2xl border border-stone-100 p-4 flex items-center gap-3 group">
      {/* Rank */}
      <span className="text-lg font-bold text-stone-200 w-6 text-center shrink-0 select-none">
        {rank}
      </span>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-stone-900 truncate leading-snug">
          {recipe.name}
        </p>

        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
          {recipe.author && (
            <span className="text-xs text-stone-400">{recipe.author}</span>
          )}
          {recipe.author && recipe.source && (
            <span className="text-stone-200 text-xs">·</span>
          )}
          {recipe.source &&
            (isUrl ? (
              <a
                href={recipe.source}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-400 hover:underline truncate max-w-[140px]"
              >
                {safeHostname(recipe.source)}
              </a>
            ) : (
              <span className="text-xs text-stone-400 truncate">
                {recipe.source}
              </span>
            ))}
        </div>

        <span
          className={`inline-block mt-2 text-xs font-medium px-2 py-0.5 rounded-full ${catColor}`}
        >
          {recipe.category}
        </span>
      </div>

      {/* Score badge */}
      <div
        className={`w-11 h-11 rounded-full ${ratingBg(recipe.rating)} text-white font-bold text-base flex items-center justify-center shrink-0 shadow-sm`}
      >
        {recipe.rating}
      </div>

      {/* Delete — always visible but subtle */}
      <button
        onClick={() => onDelete(recipe.id)}
        title="Remove"
        className="text-stone-200 hover:text-rose-400 transition-colors text-xl leading-none shrink-0"
      >
        ×
      </button>
    </div>
  );
}
