"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "recipe-ranker-mealplan";

export interface MealSlot {
  recipeId: string;
  cooked: boolean;
}

// Keys are "YYYY-MM-DD||Category", values are the assigned slot (or absent)
export type MealPlanData = Record<string, MealSlot>;

export function useMealPlan() {
  const [plan, setPlan] = useState<MealPlanData>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setPlan(JSON.parse(raw));
    } catch {
      // ignore corrupt data
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
  }, [plan, mounted]);

  const slotKey = (dateStr: string, category: string) =>
    `${dateStr}||${category}`;

  const getSlot = (dateStr: string, category: string): MealSlot | undefined =>
    plan[slotKey(dateStr, category)];

  const assignRecipe = (dateStr: string, category: string, recipeId: string) =>
    setPlan((prev) => ({
      ...prev,
      [slotKey(dateStr, category)]: { recipeId, cooked: false },
    }));

  const removeSlot = (dateStr: string, category: string) =>
    setPlan((prev) => {
      const next = { ...prev };
      delete next[slotKey(dateStr, category)];
      return next;
    });

  const markCooked = (dateStr: string, category: string) =>
    setPlan((prev) => {
      const key = slotKey(dateStr, category);
      const slot = prev[key];
      if (!slot) return prev;
      return { ...prev, [key]: { ...slot, cooked: true } };
    });

  return { getSlot, assignRecipe, removeSlot, markCooked, mounted };
}
