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
        headers: { "User-Agent": "Mozilla/5.0" },
      });
      html = await res.text();
      html = html.slice(0, 60000);
    } catch {
      return NextResponse.json({ error: "Could not fetch URL" }, { status: 400 });
    }

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `Extract the ingredients list from this recipe page HTML. Return ONLY valid JSON with no markdown:\n{"ingredients":["1 cup flour","2 eggs"]}\nIf no ingredients found, return {"ingredients":[]}.\n\nHTML:\n${html}`,
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
