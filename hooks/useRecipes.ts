"use client";

import { useState, useEffect } from "react";
import { Recipe } from "@/types/recipe";

const STORAGE_KEY = "recipe-ranker";

// Evenly distribute scores within each tier after any add/delete.
// liked tier: 10 (best) → 6 (worst)
// disliked tier: 5 (best) → 1 (worst)
function recalculateScores(recipes: Recipe[]): Recipe[] {
  const score = (group: Recipe[], max: number, min: number): Recipe[] =>
    group.map((r, i) => ({
      ...r,
      rating:
        group.length === 1
          ? parseFloat(((max + min) / 2).toFixed(1))
          : parseFloat((max - (i / (group.length - 1)) * (max - min)).toFixed(1)),
    }));

  const liked = recipes
    .filter((r) => r.tier === "liked")
    .sort((a, b) => a.rankInTier - b.rankInTier);

  const disliked = recipes
    .filter((r) => r.tier === "disliked")
    .sort((a, b) => a.rankInTier - b.rankInTier);

  return [...score(liked, 10, 6), ...score(disliked, 5, 1)];
}

// Type guard to reject old schema entries that lack tier/rankInTier
function isValidRecipe(r: unknown): r is Recipe {
  return (
    typeof r === "object" &&
    r !== null &&
    "tier" in r &&
    (r.tier === "liked" || r.tier === "disliked") &&
    "rankInTier" in r &&
    typeof (r as Recipe).rankInTier === "number"
  );
}

export function useRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: unknown[] = JSON.parse(raw);
        setRecipes(parsed.filter(isValidRecipe));
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

  // Insert a recipe at `position` within its tier, then recalculate all scores.
  const addRecipe = (
    data: Omit<Recipe, "id" | "rankInTier" | "rating">,
    position: number
  ) => {
    setRecipes((prev) => {
      const shifted = prev.map((r) =>
        r.tier === data.tier && r.rankInTier >= position
          ? { ...r, rankInTier: r.rankInTier + 1 }
          : r
      );
      const newRecipe: Recipe = {
        ...data,
        id: crypto.randomUUID(),
        rankInTier: position,
        rating: 0, // placeholder; recalculateScores overwrites this
      };
      return recalculateScores([...shifted, newRecipe]);
    });
  };

  const deleteRecipe = (id: string) => {
    setRecipes((prev) => {
      const target = prev.find((r) => r.id === id);
      if (!target) return prev;
      const updated = prev
        .filter((r) => r.id !== id)
        .map((r) =>
          r.tier === target.tier && r.rankInTier > target.rankInTier
            ? { ...r, rankInTier: r.rankInTier - 1 }
            : r
        );
      return recalculateScores(updated);
    });
  };

  // Sorted best→worst within a tier — passed to the ranking flow for comparisons
  const getTieredRecipes = (tier: "liked" | "disliked") =>
    recipes
      .filter((r) => r.tier === tier)
      .sort((a, b) => a.rankInTier - b.rankInTier);

  const sortedRecipes = [...recipes].sort((a, b) => b.rating - a.rating);

  return { recipes: sortedRecipes, addRecipe, deleteRecipe, getTieredRecipes, mounted };
}
