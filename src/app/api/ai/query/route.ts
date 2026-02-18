/**
 * AI Conversational Query Endpoint
 *
 * POST /api/ai/query
 * Body: { question: string }
 *
 * This is the "ask your brain" feature. It searches for
 * relevant knowledge items, feeds them as context to the AI,
 * and returns a synthesized answer with source references.
 *
 * A lightweight RAG approach — no vector DB needed for
 * moderate-scale knowledge bases (< 1000 items).
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { queryKnowledgeBase, isAIConfigured } from "@/lib/ai";

export async function POST(request: NextRequest) {
  if (!isAIConfigured()) {
    return NextResponse.json(
      { error: "AI is not configured. Add your GOOGLE_GENERATIVE_AI_API_KEY to .env" },
      { status: 503 }
    );
  }

  try {
    const { question } = await request.json();

    if (!question || typeof question !== "string") {
      return NextResponse.json(
        { error: "A question string is required." },
        { status: 400 }
      );
    }

    // Pull keywords from the question for a basic relevance search.
    // In a more advanced setup, this would use vector embeddings.
    const keywords = question
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 3); // skip short common words

    // Search for potentially relevant items
    // Using OR across title and content for each keyword
    // Handle empty keywords by fetching recent items as fallback
    const items = await db.knowledgeItem.findMany({
      where:
        keywords.length > 0
          ? {
              OR: keywords.flatMap((keyword) => [
                { title: { contains: keyword, mode: "insensitive" as const } },
                { content: { contains: keyword, mode: "insensitive" as const } },
              ]),
            }
          : undefined, // no filter — just grab recent items
      take: 10, // cap context window size
      orderBy: { createdAt: "desc" },
    });

    if (items.length === 0) {
      return NextResponse.json({
        answer:
          "I couldn't find any relevant entries in your knowledge base for that question. " +
          "Try adding more notes or rephrasing your question.",
        sources: [],
      });
    }

    // Feed into AI for synthesis
    const result = await queryKnowledgeBase(
      question,
      items.map((i) => ({ id: i.id, title: i.title, content: i.content }))
    );

    // Map source IDs back to item metadata
    const sources = result.sourceIds
      .map((id) => {
        const item = items.find((i) => i.id === id);
        return item ? { id: item.id, title: item.title } : null;
      })
      .filter(Boolean);

    return NextResponse.json({
      answer: result.answer,
      sources,
    });
  } catch (err) {
    console.error("[API] Query endpoint error:", err);
    
    // Check if it's a quota/rate limit error
    const errorMessage = err instanceof Error ? err.message : String(err);
    if (errorMessage.includes("quota") || errorMessage.includes("RESOURCE_EXHAUSTED")) {
      return NextResponse.json(
        { error: "AI quota exceeded. Please try again later or check your API key limits." },
        { status: 429 }
      );
    }

    if (errorMessage.includes("not configured") || errorMessage.includes("API key")) {
      return NextResponse.json(
        { error: "AI is not configured. Please set up your API key." },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: `AI query failed: ${errorMessage}. Please try again.` },
      { status: 500 }
    );
  }
}
