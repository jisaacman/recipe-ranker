import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

const VALID_MIME_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"] as const;
type ValidMimeType = (typeof VALID_MIME_TYPES)[number];

function isValidMimeType(s: string): s is ValidMimeType {
  return (VALID_MIME_TYPES as readonly string[]).includes(s);
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  let raw = "";

  if (body.url) {
    let html = "";
    try {
      const res = await fetch(body.url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml",
        },
      });
      html = await res.text();
    } catch {
      return NextResponse.json({ error: "Could not fetch URL" }, { status: 400 });
    }

    // Primary: parse JSON-LD structured data (works on AllRecipes, Food Network,
    // Epicurious, Serious Eats, NYT Cooking, etc.)
    const jsonLdBlocks = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi) ?? [];
    for (const block of jsonLdBlocks) {
      try {
        const content = block.replace(/<script[^>]*>/i, "").replace(/<\/script>/i, "");
        const parsed = JSON.parse(content);
        const schemas = Array.isArray(parsed) ? parsed : [parsed];
        for (const schema of schemas) {
          const isRecipe = (type: unknown) =>
            type === "Recipe" || (Array.isArray(type) && type.includes("Recipe"));

          // Direct Recipe schema
          if (isRecipe(schema["@type"]) && Array.isArray(schema.recipeIngredient)) {
            return NextResponse.json({ ingredients: schema.recipeIngredient });
          }
          // @graph containing Recipe
          if (Array.isArray(schema["@graph"])) {
            for (const item of schema["@graph"]) {
              if (isRecipe(item["@type"]) && Array.isArray(item.recipeIngredient)) {
                return NextResponse.json({ ingredients: item.recipeIngredient });
              }
            }
          }
        }
      } catch {
        // malformed JSON-LD, skip
      }
    }

    // Fallback: ask Claude to extract from HTML
    const trimmed = html.slice(0, 60000);
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `Extract the ingredients list from this recipe page HTML. Return ONLY valid JSON with no markdown:\n{"ingredients":["1 cup flour","2 eggs"]}\nIf no ingredients found, return {"ingredients":[]}.\n\nHTML:\n${trimmed}`,
        },
      ],
    });

    raw = message.content[0].type === "text" ? message.content[0].text : "";
  } else if (body.image && body.mimeType) {
    if (!isValidMimeType(body.mimeType)) {
      return NextResponse.json({ error: "Unsupported image type. Use JPEG, PNG, GIF, or WebP." }, { status: 400 });
    }

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: body.mimeType,
                data: body.image,
              },
            },
            {
              type: "text",
              text: 'Extract the ingredients list from this recipe image. Return ONLY valid JSON with no markdown:\n{"ingredients":["1 cup flour","2 eggs"]}\nIf no ingredients found, return {"ingredients":[]}.',
            },
          ],
        },
      ],
    });

    raw = message.content[0].type === "text" ? message.content[0].text : "";
  } else {
    return NextResponse.json({ error: "Provide url or image" }, { status: 400 });
  }

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
