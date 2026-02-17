/**
 * Knowledge Item — Single Item Operations
 *
 * GET    /api/knowledge/[id] — Fetch one item by ID
 * PUT    /api/knowledge/[id] — Update an item
 * DELETE /api/knowledge/[id] — Remove an item
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

type RouteParams = { params: Promise<{ id: string }> };

// ─── GET: Fetch a single item ──────────────────────────────

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const item = await db.knowledgeItem.findUnique({ where: { id } });

    if (!item) {
      return NextResponse.json(
        { error: "Knowledge item not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(item);
  } catch (err) {
    console.error("[API] Failed to fetch item:", err);
    return NextResponse.json(
      { error: "Failed to retrieve the item." },
      { status: 500 }
    );
  }
}

// ─── PUT: Update an existing item ──────────────────────────

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Check it exists first — cleaner error than Prisma's P2025
    const existing = await db.knowledgeItem.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Knowledge item not found." },
        { status: 404 }
      );
    }

    // Build update data — only include fields that were sent
    const updateData: Record<string, unknown> = {};

    if (body.title !== undefined) updateData.title = body.title.trim();
    if (body.content !== undefined) updateData.content = body.content.trim();
    if (body.type !== undefined) updateData.type = body.type;
    if (body.sourceUrl !== undefined) updateData.sourceUrl = body.sourceUrl?.trim() || null;
    if (body.summary !== undefined) updateData.summary = body.summary;

    if (body.tags !== undefined) {
      updateData.tags = [
        ...new Set(
          body.tags.map((t: string) => t.toLowerCase().trim()).filter(Boolean)
        ),
      ];
    }

    const updated = await db.knowledgeItem.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("[API] Failed to update item:", err);
    return NextResponse.json(
      { error: "Failed to update the item." },
      { status: 500 }
    );
  }
}

// ─── DELETE: Remove an item ────────────────────────────────

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const existing = await db.knowledgeItem.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Knowledge item not found." },
        { status: 404 }
      );
    }

    await db.knowledgeItem.delete({ where: { id } });

    return NextResponse.json({ success: true, id });
  } catch (err) {
    console.error("[API] Failed to delete item:", err);
    return NextResponse.json(
      { error: "Failed to delete the item." },
      { status: 500 }
    );
  }
}
