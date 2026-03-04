"use client";

import { useState, useEffect } from "react";
import { Recipe } from "@/types/recipe";

const STORAGE_KEY = "recipe-ranker";

function recalculateScores(recipes: Recipe[]): Recipe[] {
  const scoreGroup = (group: Recipe[], max: number, min: number): Recipe[] =>
    group.map((r, i) => ({
      ...r,
      rating:
        group.length === 1
          ? parseFloat(((max + min) / 2).toFixed(1))
          : parseFloat((max - (i / (group.length - 1)) * (max - min)).toFixed(1)),
    }));

  // Group by tier + category so each category is scored independently
  const groups = new Map<string, Recipe[]>();
  for (const r of recipes) {
    const key = `${r.tier}::${r.category}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(r);
  }

  const result: Recipe[] = [];
  for (const [key, group] of groups) {
    const tier = key.split("::")[0] as "liked" | "disliked";
    const sorted = [...group].sort((a, b) => a.rankInTier - b.rankInTier);
    result.push(...scoreGroup(sorted, tier === "liked" ? 10 : 5, tier === "liked" ? 6 : 1));
  }
  return result;
}

// Normalizes a raw parsed value into a Recipe, filling in defaults for any missing fields.
// Returns null if the value is fundamentally invalid (missing tier/rankInTier).
function normalizeRecipe(r: unknown): Recipe | null {
  if (
    typeof r !== "object" ||
    r === null ||
    !("tier" in r) ||
    !((r as { tier: unknown }).tier === "liked" || (r as { tier: unknown }).tier === "disliked") ||
    !("rankInTier" in r) ||
    typeof (r as { rankInTier: unknown }).rankInTier !== "number"
  ) {
    return null;
  }

  const raw = r as Partial<Recipe> & { tier: "liked" | "disliked"; rankInTier: number };
  return {
    id: raw.id ?? crypto.randomUUID(),
    name: raw.name ?? "",
    author: raw.author ?? "",
    source: raw.source ?? "",
    category: raw.category ?? "Lunch/Dinner",
    tier: raw.tier,
    rankInTier: raw.rankInTier,
    rating: raw.rating ?? 0,
    notes: raw.notes ?? "",
    timesMade: raw.timesMade ?? 0,
    ingredients: Array.isArray(raw.ingredients) ? raw.ingredients : [],
  };
}

type AddRecipeData = Pick<
  Recipe,
  "name" | "author" | "source" | "category" | "tier" | "notes" | "timesMade"
>;

export function useRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: unknown[] = JSON.parse(raw);
        setRecipes(parsed.map(normalizeRecipe).filter((r): r is Recipe => r !== null));
      }
    } catch {
      // ignore corrupt data
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
  }, [recipes, mounted]);

  const addRecipe = (
    data: AddRecipeData,
    position: number,
    tieWithId?: string,
    existingId?: string  // provided when re-ranking to preserve the original ID
  ) => {
    setRecipes((prev) => {
      const newId = existingId ?? crypto.randomUUID();

      const shifted = prev.map((r) =>
        r.tier === data.tier && r.category === data.category && r.rankInTier >= position
          ? { ...r, rankInTier: r.rankInTier + 1 }
          : r
      );
      const newRecipe: Recipe = {
        ...data,
        id: newId,
        rankInTier: position,
        rating: 0,
        ingredients: [],
      };

      let result = recalculateScores([...shifted, newRecipe]);

      if (tieWithId) {
        const newR = result.find((r) => r.id === newId);
        const tiedR = result.find((r) => r.id === tieWithId);
        if (newR && tiedR) {
          const avg = parseFloat(((newR.rating + tiedR.rating) / 2).toFixed(1));
          result = result.map((r) =>
            r.id === newId || r.id === tieWithId ? { ...r, rating: avg } : r
          );
        }
      }

      return result;
    });
  };

  // Edit notes, times made, or category without affecting ranking
  const updateRecipe = (
    id: string,
    updates: Partial<Pick<Recipe, "notes" | "timesMade" | "category" | "ingredients">>
  ) => {
    setRecipes((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
  };

  const deleteRecipe = (id: string) => {
    setRecipes((prev) => {
      const target = prev.find((r) => r.id === id);
      if (!target) return prev;
      const updated = prev
        .filter((r) => r.id !== id)
        .map((r) =>
          r.tier === target.tier && r.category === target.category && r.rankInTier > target.rankInTier
            ? { ...r, rankInTier: r.rankInTier - 1 }
            : r
        );
      return recalculateScores(updated);
    });
  };

  const getTieredRecipes = (tier: "liked" | "disliked", category: string) =>
    recipes
      .filter((r) => r.tier === tier && r.category === category)
      .sort((a, b) => a.rankInTier - b.rankInTier);

  const sortedRecipes = [...recipes].sort((a, b) => b.rating - a.rating);

  return { recipes: sortedRecipes, addRecipe, updateRecipe, deleteRecipe, getTieredRecipes, mounted };
}
