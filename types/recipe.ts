export interface Recipe {
  id: string;
  name: string;
  author: string;
  source: string;
  category: string;
  tier: "liked" | "disliked";
  rankInTier: number; // 0-indexed within tier (0 = best in tier)
  rating: number;     // computed score: liked → 6–10, disliked → 1–5
}

// Fields the user fills in before ranking begins
export type PendingRecipe = Omit<Recipe, "id" | "tier" | "rankInTier" | "rating">;

export const CATEGORIES = [
  "Breakfast",
  "Lunch/Dinner",
  "Dessert",
  "Drinks",
] as const;

export type Category = (typeof CATEGORIES)[number];
