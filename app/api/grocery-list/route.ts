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

  const allIngredients = recipes.flatMap((r) => r.ingredients ?? []);

  if (allIngredients.length === 0) {
    return NextResponse.json({ error: "No ingredients to organize" }, { status: 400 });
  }

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `Organize these ingredients into a grocery shopping list. Group by: Produce, Dairy & Eggs, Meat & Seafood, Pantry & Dry Goods, Spices & Herbs. Consolidate duplicates and combine quantities where possible.\n\nIngredients:\n${allIngredients.join("\n")}\n\nReturn ONLY valid JSON, no markdown:\n{"sections":[{"category":"Produce","items":["2 lemons","1 head garlic"]}]}`,
      },
    ],
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
