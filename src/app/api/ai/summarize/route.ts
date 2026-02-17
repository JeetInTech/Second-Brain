/**
 * AI Summarization Endpoint
 *
 * POST /api/ai/summarize
 * Body: { itemId: string }
 *
 * Fetches the knowledge item, generates a summary via Google Gemini,
 * and persists it back to the database. This way summaries are
 * generated once and cached — no repeated API calls for the
 * same content.
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { summarizeContent, isAIConfigured } from "@/lib/ai";

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

    // Generate summary
    const summary = await summarizeContent(item.content, item.title);

    if (!summary) {
      return NextResponse.json(
        { error: "Failed to generate summary. Try again." },
        { status: 500 }
      );
    }

    // Persist it so we don't re-generate next time
    await db.knowledgeItem.update({
      where: { id: itemId },
      data: { summary },
    });

    return NextResponse.json({ summary, itemId });
  } catch (err) {
    console.error("[API] Summarization endpoint error:", err);
    return NextResponse.json(
      { error: "Summarization failed." },
      { status: 500 }
    );
  }
}
