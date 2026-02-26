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
  Breakfast: "bg-yellow-100 text-yellow-700",
  Lunch: "bg-lime-100 text-lime-700",
  Dinner: "bg-blue-100 text-blue-700",
  Dessert: "bg-pink-100 text-pink-700",
  Snack: "bg-orange-100 text-orange-700",
  Other: "bg-gray-100 text-gray-600",
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
    CATEGORY_COLORS[recipe.category] ?? "bg-gray-100 text-gray-600";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
      {/* Rank number */}
      <span className="text-2xl font-bold text-gray-200 w-7 text-center shrink-0 select-none">
        {rank}
      </span>

      {/* Recipe info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 truncate">{recipe.name}</p>

        {(recipe.author || recipe.source) && (
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            {recipe.author && (
              <span className="text-xs text-gray-500">{recipe.author}</span>
            )}
            {recipe.author && recipe.source && (
              <span className="text-gray-300 text-xs">·</span>
            )}
            {recipe.source &&
              (isUrl ? (
                <a
                  href={recipe.source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-500 hover:underline truncate max-w-[160px]"
                >
                  {safeHostname(recipe.source)}
                </a>
              ) : (
                <span className="text-xs text-gray-500 truncate">
                  {recipe.source}
                </span>
              ))}
          </div>
        )}

        <div className="flex items-center gap-2 mt-2">
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${catColor}`}
          >
            {recipe.category}
          </span>
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              recipe.tier === "liked"
                ? "bg-emerald-50 text-emerald-600"
                : "bg-rose-50 text-rose-500"
            }`}
          >
            {recipe.tier === "liked" ? "Liked" : "Disliked"}
          </span>
        </div>
      </div>

      {/* Rating badge — display only, computed automatically */}
      <div
        className={`w-11 h-11 rounded-full ${ratingBg(recipe.rating)} text-white font-bold text-base flex items-center justify-center shrink-0`}
      >
        {recipe.rating}
      </div>

      {/* Delete */}
      <button
        onClick={() => onDelete(recipe.id)}
        title="Remove recipe"
        className="text-gray-300 hover:text-rose-400 transition-colors text-2xl leading-none shrink-0"
      >
        ×
      </button>
    </div>
  );
}
