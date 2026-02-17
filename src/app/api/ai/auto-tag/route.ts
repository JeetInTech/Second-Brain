/**
 * AI Auto-Tagging Endpoint
 *
 * POST /api/ai/auto-tag
 * Body: { itemId: string }
 *
 * Generates smart tags for a knowledge item and merges them
 * with any existing tags. Deduplication is handled automatically.
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateTags, isAIConfigured } from "@/lib/ai";

export async function POST(request: NextRequest) {
  if (!isAIConfigured()) {
    return NextResponse.json(
      { error: "AI is not configured. Add your GOOGLE_GENERATIVE_AI_API_KEY to .env" },
      { status: 503 }
    );
  }

  try {
    const { itemId } = await request.json();

    if (!itemId) {
      return NextResponse.json(
        { error: "itemId is required." },
        { status: 400 }
      );
    }

    const item = await db.knowledgeItem.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      return NextResponse.json(
        { error: "Item not found." },
        { status: 404 }
      );
    }

    // Generate new tags
    const aiTags = await generateTags(item.content, item.title);

    if (aiTags.length === 0) {
      return NextResponse.json(
        { tags: item.tags, newTags: [], itemId, message: "No new tags generated" }
      );
    }

    // Merge with existing tags, no duplicates
    const mergedTags = [...new Set([...item.tags, ...aiTags])];

    await db.knowledgeItem.update({
      where: { id: itemId },
      data: { tags: mergedTags },
    });

    return NextResponse.json({ tags: mergedTags, newTags: aiTags, itemId });
  } catch (err) {
    console.error("[API] Auto-tag endpoint error:", err);
    return NextResponse.json(
      { error: "Auto-tagging failed." },
      { status: 500 }
    );
  }
}
