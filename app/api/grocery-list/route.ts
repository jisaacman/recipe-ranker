import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

interface RecipeInput {
  name: string;
  category: string;
  author?: string;
  ingredients?: string[];
}

export async function POST(req: NextRequest) {
  const { recipes }: { recipes: RecipeInput[] } = await req.json();

  if (!recipes || recipes.length === 0) {
    return NextResponse.json({ error: "No recipes provided" }, { status: 400 });
  }

  const recipeList = recipes
    .map((r) => {
      let line = `- ${r.name} (${r.category})${r.author ? ` by ${r.author}` : ""}`;
      if (r.ingredients && r.ingredients.length > 0) {
        line += `\n  Ingredients: ${r.ingredients.join(", ")}`;
      }
      return line;
    })
    .join("\n");

  const hasStoredIngredients = recipes.some(
    (r) => r.ingredients && r.ingredients.length > 0
  );

  const prompt = hasStoredIngredients
    ? `Organize a grocery list for these planned recipes. Some recipes include their actual ingredients — use those exactly. For any recipes without ingredients listed, infer typical ingredients from the recipe name.\n\n${recipeList}\n\nGroup everything by: Produce, Dairy & Eggs, Meat & Seafood, Pantry & Dry Goods, Spices & Herbs. Consolidate duplicates and combine quantities where possible.\n\nReturn ONLY valid JSON, no markdown:\n{"sections":[{"category":"Produce","items":["2 lemons","1 head garlic"]}]}`
    : `Generate a grocery list for these recipes planned for the week:\n\n${recipeList}\n\nUse your knowledge of each recipe to list typical ingredients. Group by these categories: Produce, Dairy & Eggs, Meat & Seafood, Pantry & Dry Goods, Spices & Herbs. Consolidate duplicates across recipes. Include practical quantities where possible.\n\nReturn ONLY valid JSON, no markdown, in exactly this format:\n{"sections":[{"category":"Produce","items":["2 lemons","1 head garlic"]}]}`;

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const raw = message.content[0].type === "text" ? message.content[0].text : "";

  // Extract JSON even if Claude wraps it in markdown code blocks
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) {
    return NextResponse.json({ error: "Could not parse response" }, { status: 500 });
  }

  try {
    const data = JSON.parse(match[0]);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Invalid response format" }, { status: 500 });
  }
}
