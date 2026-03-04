export interface Recipe {
  id: string;
  name: string;
  author: string;
  source: string;
  category: string;
  tier: "liked" | "disliked";
  rankInTier: number; // 0-indexed within tier (0 = best in tier)
  rating: number;     // computed score: liked → 6–10, disliked → 1–5
  notes: string;
  timesMade: number;
  ingredients: string[];
}

// Only the fields the user fills in before ranking — excludes all computed/post-ranking fields
export type PendingRecipe = Pick<Recipe, "name" | "author" | "source" | "category">;

export const CATEGORIES = [
  "Breakfast",
  "Lunch/Dinner",
  "Dessert",
  "Drinks",
] as const;

export type Category = (typeof CATEGORIES)[number];
