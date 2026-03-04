"use client";

import { Recipe } from "@/types/recipe";

interface Props {
  recipe: Recipe;
  rank: number;
  onSelect: (recipe: Recipe) => void;
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

export default function RecipeCard({ recipe, rank, onSelect, onDelete }: Props) {
  const isUrl =
    recipe.source.startsWith("http://") ||
    recipe.source.startsWith("https://");

  const catColor =
    CATEGORY_COLORS[recipe.category] ?? "bg-stone-100 text-stone-500";

  const tierStripe =
    recipe.tier === "liked" ? "bg-emerald-400" : "bg-rose-400";

  return (
    <div
      onClick={() => onSelect(recipe)}
      className="group relative bg-white rounded-2xl border border-stone-100 p-4 pl-5 flex items-center gap-3 cursor-pointer hover:border-stone-200 hover:shadow-md transition-all overflow-hidden"
    >
      {/* Tier accent stripe */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${tierStripe}`} />

      {/* Rank */}
      <span className="text-xs font-bold text-stone-300 w-5 text-center shrink-0 select-none tabular-nums">
        {rank}
      </span>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-stone-900 truncate leading-snug">
          {recipe.name}
        </p>

        {(recipe.author || recipe.source) && (
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            {recipe.author && (
              <span className="text-xs text-stone-400">{recipe.author}</span>
            )}
            {recipe.author && recipe.source && (
              <span className="text-stone-200 text-xs">·</span>
            )}
            {recipe.source &&
              (isUrl ? (
                <span className="text-xs text-blue-400 truncate max-w-[140px]">
                  {safeHostname(recipe.source)}
                </span>
              ) : (
                <span className="text-xs text-stone-400 truncate max-w-[140px]">
                  {recipe.source}
                </span>
              ))}
          </div>
        )}

        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${catColor}`}>
            {recipe.category}
          </span>
          {recipe.timesMade > 0 && (
            <span className="text-xs text-stone-400">
              Made {recipe.timesMade}×
            </span>
          )}
          {recipe.notes && (
            <span className="text-xs text-stone-300">· has notes</span>
          )}
        </div>
      </div>

      {/* Score badge */}
      <div
        className={`w-11 h-11 rounded-full ${ratingBg(recipe.rating)} text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-sm`}
      >
        {recipe.rating}
      </div>

      {/* Delete — only visible on hover */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(recipe.id);
        }}
        title="Remove"
        className="opacity-0 group-hover:opacity-100 text-stone-300 hover:text-rose-400 transition-all text-xl leading-none shrink-0"
      >
        ×
      </button>
    </div>
  );
}
