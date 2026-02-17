/**
 * Knowledge Items — Main CRUD Endpoint
 *
 * GET  /api/knowledge — List all items, with optional filtering
 * POST /api/knowledge — Create a new knowledge item
 *
 * Filtering is handled via URL params rather than request body
 * so these endpoints are easily testable from a browser.
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Prisma } from "@/generated/prisma";

// ─── GET: Fetch all knowledge items ────────────────────────

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const type = searchParams.get("type"); // NOTE, LINK, INSIGHT
    const tag = searchParams.get("tag");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "newest";

    // Build the where clause piece by piece.
    // I find this more readable than one massive object.
    const where: Prisma.KnowledgeItemWhereInput = {};

    if (type && type !== "ALL") {
      where.type = type as Prisma.EnumItemTypeFilter["equals"];
    }

    if (tag) {
      where.tags = { has: tag };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ];
    }

    // Sort direction
    const orderBy: Prisma.KnowledgeItemOrderByWithRelationInput =
      sort === "oldest"
        ? { createdAt: "asc" }
        : sort === "title"
        ? { title: "asc" }
        : { createdAt: "desc" }; // default: newest first

    const items = await db.knowledgeItem.findMany({
      where,
      orderBy,
    });

    return NextResponse.json(items);
  } catch (err) {
    console.error("[API] Failed to fetch knowledge items:", err);
    return NextResponse.json(
      { error: "Something went wrong fetching your knowledge items." },
      { status: 500 }
    );
  }
}

// ─── POST: Create a new knowledge item ─────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields — keeping it manual rather than
    // pulling in zod for this scope. Would add zod in production.
    const { title, content, type } = body;

    if (!title || !content || !type) {
      return NextResponse.json(
        { error: "Missing required fields: title, content, type" },
        { status: 400 }
      );
    }

    const validTypes = ["NOTE", "LINK", "INSIGHT"];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid type. Must be one of: ${validTypes.join(", ")}` },
        { status: 400 }
      );
    }

    // Clean up tags — trim, lowercase, deduplicate
    const rawTags: string[] = Array.isArray(body.tags)
      ? body.tags.map((t: string) => t.toLowerCase().trim()).filter(Boolean)
      : [];
    const tags = [...new Set(rawTags)];

    const item = await db.knowledgeItem.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        type,
        tags,
        sourceUrl: body.sourceUrl?.trim() || null,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (err) {
    console.error("[API] Failed to create knowledge item:", err);
    return NextResponse.json(
      { error: "Failed to save your knowledge item." },
      { status: 500 }
    );
  }
}
