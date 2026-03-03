"use client";

import { useState } from "react";
import { useRecipes } from "@/hooks/useRecipes";
import { useMealPlan } from "@/hooks/useMealPlan";
import { CATEGORIES } from "@/types/recipe";
import RecipePicker from "@/components/RecipePicker";

interface PickerState {
  dateStr: string;
  dayName: string;
  category: string;
}

function toLocalDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getWeekDays() {
  const today = new Date();
  const todayStr = toLocalDateStr(today);
  const day = today.getDay(); // 0 = Sun
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);

  const DAY_NAMES = [
    "Monday", "Tuesday", "Wednesday", "Thursday",
    "Friday", "Saturday", "Sunday",
  ];

  return DAY_NAMES.map((name, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    const dateStr = toLocalDateStr(date);
    return {
      name,
      dateStr,
      isToday: dateStr === todayStr,
      shortDate: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    };
  });
}

function ratingBg(rating: number): string {
  if (rating >= 8) return "bg-emerald-500";
  if (rating >= 5) return "bg-amber-400";
  return "bg-rose-400";
}

export default function PlanPage() {
  const { recipes, updateRecipe, mounted: recipesMounted } = useRecipes();
  const { getSlot, assignRecipe, removeSlot, markCooked, mounted: planMounted } =
    useMealPlan();
  const [picker, setPicker] = useState<PickerState | null>(null);

  const weekDays = getWeekDays();
  const mounted = recipesMounted && planMounted;

  // Week range label
  const weekLabel = `${weekDays[0].shortDate} – ${weekDays[6].shortDate}`;

  const handlePick = (recipeId: string) => {
    if (!picker) return;
    assignRecipe(picker.dateStr, picker.category, recipeId);
    setPicker(null);
  };

  const handleCookIt = (dateStr: string, category: string, recipeId: string) => {
    markCooked(dateStr, category);
    const recipe = recipes.find((r) => r.id === recipeId);
    if (recipe) updateRecipe(recipeId, { timesMade: recipe.timesMade + 1 });
  };

  return (
    <main className="min-h-screen bg-stone-50 pb-24">
      <div className="max-w-lg mx-auto px-4 py-10">

        <header className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-stone-900">
            Week Planner
          </h1>
          <p className="text-sm text-stone-400 mt-1">{weekLabel}</p>
        </header>

        {!mounted ? null : recipes.length === 0 ? (
          <div className="text-center py-16 text-stone-400">
            <p className="text-sm">
              Add and rank some recipes first, then come back to plan your week.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {weekDays.map(({ name, dateStr, isToday, shortDate }) => (
              <div
                key={dateStr}
                className="bg-white rounded-2xl border border-stone-100 overflow-hidden"
              >
                {/* Day header */}
                <div
                  className={`px-4 py-3 flex items-center justify-between ${
                    isToday ? "bg-stone-900" : "border-b border-stone-50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-semibold text-sm ${
                        isToday ? "text-white" : "text-stone-800"
                      }`}
                    >
                      {name}
                    </span>
                    <span
                      className={`text-xs ${
                        isToday ? "text-stone-400" : "text-stone-300"
                      }`}
                    >
                      {shortDate}
                    </span>
                  </div>
                  {isToday && (
                    <span className="text-xs text-stone-400 bg-white/10 px-2 py-0.5 rounded-full">
                      Today
                    </span>
                  )}
                </div>

                {/* Meal slots */}
                <div className="divide-y divide-stone-50">
                  {CATEGORIES.map((category) => {
                    const slot = getSlot(dateStr, category);
                    const recipe = slot
                      ? recipes.find((r) => r.id === slot.recipeId)
                      : null;

                    return (
                      <div
                        key={category}
                        className="px-4 py-3 flex items-center gap-3 min-h-[52px]"
                      >
                        {/* Category label */}
                        <span className="text-xs text-stone-300 w-[88px] shrink-0">
                          {category}
                        </span>

                        {recipe ? (
                          /* Filled slot */
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div
                              className={`w-7 h-7 rounded-full ${ratingBg(recipe.rating)} text-white font-bold text-xs flex items-center justify-center shrink-0`}
                            >
                              {recipe.rating}
                            </div>
                            <span className="text-sm font-medium text-stone-800 truncate flex-1">
                              {recipe.name}
                            </span>

                            {slot?.cooked ? (
                              <span className="text-xs font-medium text-emerald-500 shrink-0">
                                Cooked
                              </span>
                            ) : (
                              <button
                                onClick={() =>
                                  handleCookIt(dateStr, category, recipe.id)
                                }
                                className="text-xs text-stone-400 hover:text-emerald-500 border border-stone-200 hover:border-emerald-200 rounded-lg px-2.5 py-1 transition-colors shrink-0"
                              >
                                Cook it
                              </button>
                            )}

                            <button
                              onClick={() => removeSlot(dateStr, category)}
                              className="text-stone-200 hover:text-rose-400 transition-colors text-lg leading-none shrink-0"
                            >
                              ×
                            </button>
                          </div>
                        ) : (
                          /* Empty slot */
                          <button
                            onClick={() =>
                              setPicker({ dateStr, dayName: name, category })
                            }
                            className="flex-1 text-left text-sm text-stone-300 hover:text-stone-500 transition-colors"
                          >
                            + Add
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {picker && (
        <RecipePicker
          recipes={recipes}
          slotLabel={`${picker.dayName} · ${picker.category}`}
          onPick={(recipe) => handlePick(recipe.id)}
          onClose={() => setPicker(null)}
        />
      )}
    </main>
  );
}
