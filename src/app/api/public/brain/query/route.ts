/**
 * Public Brain Query API
 *
 * GET /api/public/brain/query?q=your+question
 *
 * This is the public-facing endpoint that lets external
 * systems query the knowledge base. No auth required.
 *
 * Returns a clean JSON response with the answer and source
 * references. Could be consumed by a widget, chatbot, or
 * any third-party integration.
 *
 * Rate limiting would go here in production (middleware or
 * edge function), but keeping it simple for now.
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { queryKnowledgeBase, isAIConfigured } from "@/lib/ai";
import type { PublicBrainQueryResponse } from "@/types";

// CORS headers for cross-origin embedding
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET(request: NextRequest) {
  const question = request.nextUrl.searchParams.get("q");

  if (!question) {
    return NextResponse.json(
      { error: 'Missing query parameter "q". Usage: ?q=your+question' },
      { status: 400, headers: corsHeaders }
    );
  }

  if (!isAIConfigured()) {
    return NextResponse.json(
      { error: "AI service is currently unavailable." },
      { status: 503, headers: corsHeaders }
    );
  }

  try {
    // Keyword-based relevance search
    const keywords = question
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 3);

    const items = await db.knowledgeItem.findMany({
      where: {
        OR: keywords.flatMap((keyword) => [
          { title: { contains: keyword, mode: "insensitive" as const } },
          { content: { contains: keyword, mode: "insensitive" as const } },
        ]),
      },
      take: 8,
      orderBy: { createdAt: "desc" },
    });

    if (items.length === 0) {
      const response: PublicBrainQueryResponse = {
        question,
        answer: "No relevant knowledge found for this query.",
        sources: [],
        timestamp: new Date().toISOString(),
      };
      return NextResponse.json(response, { headers: corsHeaders });
    }

    const result = await queryKnowledgeBase(
      question,
      items.map((i) => ({ id: i.id, title: i.title, content: i.content }))
    );

    const response: PublicBrainQueryResponse = {
      question,
      answer: result?.answer || "Unable to generate an answer at this time.",
      sources: (result?.sourceIds || [])
        .map((id) => {
          const item = items.find((i) => i.id === id);
          return item
            ? {
                id: item.id,
                title: item.title,
                type: item.type,
                summary: item.summary,
              }
            : null;
        })
        .filter(Boolean) as PublicBrainQueryResponse["sources"],
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response, { headers: corsHeaders });
  } catch (err) {
    console.error("[Public API] Query error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500, headers: corsHeaders }
    );
  }
}
