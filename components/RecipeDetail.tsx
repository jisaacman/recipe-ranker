"use client";

import { useState } from "react";
import { Recipe, CATEGORIES } from "@/types/recipe";

interface Props {
  recipe: Recipe;
  onSave: (id: string, updates: Partial<Pick<Recipe, "notes" | "timesMade" | "category" | "ingredients">>) => void;
  onRerank: (recipe: Recipe) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

function ratingBg(rating: number): string {
  if (rating >= 8) return "bg-emerald-500";
  if (rating >= 5) return "bg-amber-400";
  return "bg-rose-400";
}

function safeHostname(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

export default function RecipeDetail({
  recipe,
  onSave,
  onRerank,
  onDelete,
  onClose,
}: Props) {
  const [notes, setNotes] = useState(recipe.notes);
  const [timesMade, setTimesMade] = useState(recipe.timesMade);
  const [category, setCategory] = useState(recipe.category);
  const [ingredients, setIngredients] = useState<string[]>(recipe.ingredients);
  const [fetching, setFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const isDirty =
    notes !== recipe.notes ||
    timesMade !== recipe.timesMade ||
    category !== recipe.category ||
    ingredients !== recipe.ingredients;

  const handleSave = () => {
    onSave(recipe.id, { notes, timesMade, category, ingredients });
    onClose();
  };

  const isUrl =
    recipe.source.startsWith("http://") ||
    recipe.source.startsWith("https://");

  const fetchFromUrl = async () => {
    setFetching(true);
    setFetchError(null);
    try {
      const res = await fetch("/api/extract-ingredients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: recipe.source }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      if (data.ingredients?.length > 0) {
        setIngredients(data.ingredients);
      } else {
        setFetchError("No ingredients found on this page.");
      }
    } catch {
      setFetchError("Couldn't fetch ingredients. Try uploading a photo.");
    } finally {
      setFetching(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFetching(true);
    setFetchError(null);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const res = await fetch("/api/extract-ingredients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64, mimeType: file.type }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      if (data.ingredients?.length > 0) {
        setIngredients(data.ingredients);
      } else {
        setFetchError("No ingredients found in the photo.");
      }
    } catch {
      setFetchError("Couldn't read ingredients from the photo.");
    } finally {
      setFetching(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-md max-h-[92vh] overflow-y-auto">
        <div className="p-6 space-y-5">

          {/* Header */}
          <div className="flex items-start gap-3">
            <div
              className={`w-10 h-10 rounded-full ${ratingBg(recipe.rating)} text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-sm`}
            >
              {recipe.rating}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-stone-900 leading-snug">
                {recipe.name}
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                {recipe.author && (
                  <span className="text-xs text-stone-400">{recipe.author}</span>
                )}
                {recipe.author && recipe.source && (
                  <span className="text-stone-200 text-xs">·</span>
                )}
                {recipe.source && (
                  isUrl ? (
                    <a
                      href={recipe.source}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-400 hover:underline"
                    >
                      {safeHostname(recipe.source)}
                    </a>
                  ) : (
                    <span className="text-xs text-stone-400">{recipe.source}</span>
                  )
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-stone-300 hover:text-stone-500 text-xl leading-none shrink-0"
            >
              ×
            </button>
          </div>

          {/* Category */}
          <div>
            <label className="text-xs font-semibold text-stone-400 uppercase tracking-wide block mb-2">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-200 bg-white text-stone-700"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Times Made */}
          <div>
            <label className="text-xs font-semibold text-stone-400 uppercase tracking-wide block mb-2">
              Times Made
            </label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setTimesMade(Math.max(0, timesMade - 1))}
                className="w-9 h-9 rounded-full border border-stone-200 flex items-center justify-center text-stone-500 hover:bg-stone-50 text-lg leading-none transition-colors"
              >
                −
              </button>
              <span className="text-3xl font-bold text-stone-900 w-10 text-center tabular-nums">
                {timesMade}
              </span>
              <button
                onClick={() => setTimesMade(timesMade + 1)}
                className="w-9 h-9 rounded-full border border-stone-200 flex items-center justify-center text-stone-500 hover:bg-stone-50 text-lg leading-none transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-semibold text-stone-400 uppercase tracking-wide block mb-2">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Tweaks you made, what to try next time, memories..."
              rows={4}
              className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-stone-200 resize-none placeholder:text-stone-300"
            />
          </div>

          {/* Ingredients */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-stone-400 uppercase tracking-wide">
                Ingredients
              </label>
              <div className="flex items-center gap-3">
                {isUrl && (
                  <button
                    onClick={fetchFromUrl}
                    disabled={fetching}
                    className="text-xs text-blue-400 hover:text-blue-500 transition-colors disabled:opacity-40"
                  >
                    {fetching ? "Reading..." : "Fetch from URL"}
                  </button>
                )}
                <label className={`text-xs text-stone-400 hover:text-stone-600 cursor-pointer transition-colors ${fetching ? "opacity-40 pointer-events-none" : ""}`}>
                  Upload photo
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={handlePhotoUpload}
                    disabled={fetching}
                  />
                </label>
              </div>
            </div>

            {fetching && (
              <div className="flex items-center gap-2 py-3 text-stone-400">
                <div className="w-4 h-4 border-2 border-stone-200 border-t-stone-500 rounded-full animate-spin" />
                <span className="text-xs">Reading ingredients...</span>
              </div>
            )}

            {fetchError && !fetching && (
              <p className="text-xs text-rose-400 mb-2">{fetchError}</p>
            )}

            {!fetching && ingredients.length > 0 ? (
              <ul className="space-y-1.5">
                {ingredients.map((ing, i) => (
                  <li key={i} className="text-sm text-stone-700 flex items-start gap-2">
                    <span className="text-stone-300 shrink-0 mt-0.5">·</span>
                    {ing}
                  </li>
                ))}
              </ul>
            ) : !fetching && !fetchError ? (
              <p className="text-sm text-stone-300">
                {isUrl
                  ? "Tap \"Fetch from URL\" to import ingredients automatically, or upload a photo."
                  : "Upload a photo of the recipe to import ingredients."}
              </p>
            ) : null}
          </div>

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={!isDirty}
            className="w-full bg-stone-900 text-white rounded-xl py-2.5 text-sm font-medium hover:bg-stone-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Save Changes
          </button>

          {/* Re-rank */}
          <button
            onClick={() => onRerank(recipe)}
            className="w-full border border-stone-200 text-stone-600 rounded-xl py-2.5 text-sm font-medium hover:bg-stone-50 transition-colors"
          >
            Re-rank this recipe
          </button>

          {/* Delete */}
          <button
            onClick={() => {
              onDelete(recipe.id);
              onClose();
            }}
            className="w-full text-sm text-rose-400 hover:text-rose-500 transition-colors pb-1"
          >
            Delete recipe
          </button>
        </div>
      </div>
    </div>
  );
}
