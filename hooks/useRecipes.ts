"use client";

import { useState, useEffect } from "react";
import { Recipe } from "@/types/recipe";

const STORAGE_KEY = "recipe-ranker";

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

  const addRecipe = (
    data: Omit<Recipe, "id" | "rankInTier" | "rating">,
    position: number,
    tieWithId?: string
  ) => {
    setRecipes((prev) => {
      const newId = crypto.randomUUID();

      const shifted = prev.map((r) =>
        r.tier === data.tier && r.rankInTier >= position
          ? { ...r, rankInTier: r.rankInTier + 1 }
          : r
      );
      const newRecipe: Recipe = {
        ...data,
        id: newId,
        rankInTier: position,
        rating: 0,
      };

      let result = recalculateScores([...shifted, newRecipe]);

      // If tied, average the scores of both recipes so they match
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

  const getTieredRecipes = (tier: "liked" | "disliked") =>
    recipes
      .filter((r) => r.tier === tier)
      .sort((a, b) => a.rankInTier - b.rankInTier);

  const sortedRecipes = [...recipes].sort((a, b) => b.rating - a.rating);

  return { recipes: sortedRecipes, addRecipe, deleteRecipe, getTieredRecipes, mounted };
}
