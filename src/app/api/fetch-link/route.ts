/**
 * API Route: Fetch Link Content
 *
 * POST /api/fetch-link
 * Body: { url: string }
 *
 * Fetches a webpage and extracts its text content.
 * Used when saving LINK type items to automatically
 * populate the content field with the actual webpage text.
 */

import { NextRequest, NextResponse } from "next/server";

/**
 * Simple HTML to text converter
 * Removes scripts, styles, and extracts visible text
 */
function htmlToText(html: string): string {
  // Remove script and style tags and their content
  let text = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");

  // Remove HTML tags
  text = text.replace(/<[^>]+>/g, " ");

  // Decode HTML entities
  text = text.replace(/&nbsp;/g, " ");
  text = text.replace(/&amp;/g, "&");
  text = text.replace(/&lt;/g, "<");
  text = text.replace(/&gt;/g, ">");
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#39;/g, "'");

  // Clean up whitespace
  text = text.replace(/\s+/g, " ");
  text = text.trim();

  return text;
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Validate URL
    let validUrl: URL;
    try {
      validUrl = new URL(url);
      if (!validUrl.protocol.startsWith("http")) {
        throw new Error("Only HTTP(S) URLs are supported");
      }
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      );
    }

    console.log(`[Fetch Link] Fetching: ${validUrl.href}`);

    // Fetch the webpage with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch: ${response.status} ${response.statusText}` },
        { status: 400 }
      );
    }

    const html = await response.text();
    const text = htmlToText(html);

    // Limit to first 2000 characters
    const truncated = text.slice(0, 2000);

    console.log(
      `[Fetch Link] Extracted ${text.length} chars, returning ${truncated.length}`
    );

    return NextResponse.json({
      content: truncated,
      fullLength: text.length,
    });
  } catch (err: unknown) {
    console.error("[Fetch Link] Error:", err);

    if (err instanceof Error && err.name === "AbortError") {
      return NextResponse.json(
        { error: "Request timeout" },
        { status: 408 }
      );
    }

    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Failed to fetch link content",
      },
      { status: 500 }
    );
  }
}
