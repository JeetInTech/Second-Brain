/**
 * AI Service Layer
 *
 * All AI operations are centralized here so swapping providers
 * is a one-file change. Currently wired to Google Gemini via the
 * Vercel AI SDK, but the interface is provider-agnostic by design.
 *
 * Each function handles its own error boundaries — callers
 * get clean results or null, never raw API errors.
 */

import { generateText } from "ai";
import { google } from "@ai-sdk/google";

/**
 * Checks whether the AI service is properly configured.
 * Useful for graceful degradation in the UI — show manual
 * tagging when AI isn't available rather than crashing.
 */
export function isAIConfigured(): boolean {
  return Boolean(process.env.GOOGLE_GENERATIVE_AI_API_KEY);
}

// ─── SUMMARIZATION ─────────────────────────────────────────

/**
 * Generates a concise summary of the given content.
 * Aimed at 2-3 sentences that capture the core idea.
 *
 * Returns null if anything goes wrong — the caller can
 * fall back to showing the first N characters instead.
 */
export async function summarizeContent(
  content: string,
  title?: string
): Promise<string | null> {
  if (!isAIConfigured()) return null;

  try {
    const { text } = await generateText({
      model: google("gemini-2.5-flash"),
      temperature: 0.3,
      maxOutputTokens: 2048,
      system:
        "You are a sharp, concise writer. Summarize the following content in 2-3 sentences. " +
        "Focus on the key insight or takeaway. No filler, no fluff. Write like a human, not a bot.",
      prompt: title
        ? `Title: ${title}\n\nContent: ${content}`
        : content,
    });

    return text?.trim() || null;
  } catch (err) {
    console.error("[AI] Summarization failed:", err);
    return null;
  }
}

// ─── AUTO-TAGGING ──────────────────────────────────────────

/**
 * Analyzes content and suggests relevant tags.
 * Returns 3-6 lowercase, hyphenated tags.
 *
 * The prompt is tuned to avoid generic stuff like "information"
 * or "content" — we want useful, specific labels.
 */
export async function generateTags(
  content: string,
  title?: string
): Promise<string[]> {
  if (!isAIConfigured()) return [];

  try {
    // Truncate content to 1500 chars for tag generation — tags only need the gist
    const truncatedContent = content.length > 1500 
      ? content.slice(0, 1500) + "..." 
      : content;

    const inputText = title
      ? `Title: ${title}\n\nContent: ${truncatedContent}`
      : truncatedContent;

    const { text } = await generateText({
      model: google("gemini-2.5-flash"),
      temperature: 0.2,
      maxOutputTokens: 2048,
      prompt:
        "You are a knowledge organizer. Analyze the following text and generate 3-6 relevant tags.\n" +
        "Rules:\n" +
        "- Tags must be lowercase\n" +
        "- Use hyphens for multi-word tags (e.g. machine-learning)\n" +
        '- Avoid generic tags like "information" or "content"\n' +
        "- Return ONLY a JSON array of strings, nothing else\n" +
        '- Example output: ["javascript", "web-dev", "react-hooks"]\n\n' +
        "Text to analyze:\n" +
        inputText,
    });

    console.log("[AI] Tag generation raw response:", JSON.stringify(text));

    const raw = (text ?? "").trim();
    if (!raw) {
      console.warn("[AI] Empty response from tag generation");
      return [];
    }

    // Extract JSON array from response - handle markdown code blocks, extra text, etc.
    const jsonMatch = raw.match(/\[[\s\S]*?\]/);
    if (!jsonMatch) {
      console.warn("[AI] No JSON array found in response:", raw);
      // Fallback: try to parse comma-separated tags
      const fallbackTags = raw
        .replace(/["\[\]`]/g, '')
        .split(/[,\n]+/)
        .map(t => t.trim().toLowerCase())
        .filter(t => t.length > 0 && t.length < 30);
      return fallbackTags.slice(0, 6);
    }

    const parsed = JSON.parse(jsonMatch[0]);

    if (Array.isArray(parsed) && parsed.every((t: unknown) => typeof t === "string")) {
      return parsed.map((t: string) => t.toLowerCase().trim()).filter(t => t.length > 0);
    }

    return [];
  } catch (err) {
    console.error("[AI] Tag generation failed:", err);
    return [];
  }
}

// ─── CONVERSATIONAL QUERY ──────────────────────────────────

/**
 * Answer a user's question using their knowledge base as context.
 *
 * This is essentially RAG-lite: we feed relevant notes into
 * the prompt and let the model synthesize an answer. Not as
 * sophisticated as vector search + embeddings, but works
 * surprisingly well for moderate-sized knowledge bases.
 */
export async function queryKnowledgeBase(
  question: string,
  relevantItems: Array<{ title: string; content: string; id: string }>
): Promise<{ answer: string; sourceIds: string[] } | null> {
  if (!isAIConfigured()) {
    throw new Error("AI is not configured. Add your GOOGLE_GENERATIVE_AI_API_KEY to .env");
  }

  // Build context from relevant items
  const context = relevantItems
    .map((item, i) => `[${i + 1}] "${item.title}"\n${item.content}`)
    .join("\n\n---\n\n");

  // Retry logic for transient AI failures (rate limits, network glitches)
  const MAX_RETRIES = 2;
  let lastError: unknown = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      if (attempt > 0) {
        // Exponential backoff: 1s, 2s
        await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
        console.log(`[AI] Retrying query (attempt ${attempt + 1}/${MAX_RETRIES + 1})...`);
      }

      const { text } = await generateText({
        model: google("gemini-2.5-flash"),
        temperature: 0.4,
        maxOutputTokens: 4096,
        system:
          "You are a helpful personal knowledge assistant. Answer the user's question based ONLY " +
          "on the provided knowledge base entries. If the answer isn't in the provided context, " +
          "say so honestly. Reference which entries you used by their number [1], [2], etc. " +
          "Be conversational but precise.",
        prompt: `My knowledge base contains these entries:\n\n${context}\n\n---\n\nQuestion: ${question}`,
      });

      const answer = text?.trim();
      if (!answer) {
        throw new Error("AI returned an empty response");
      }

      // Extract referenced source numbers and map back to IDs
      const refPattern = /\[(\d+)\]/g;
      const matches = [...answer.matchAll(refPattern)];
      const sourceIds = [
        ...new Set(
          matches
            .map((m) => {
              const idx = parseInt(m[1], 10) - 1;
              return relevantItems[idx]?.id;
            })
            .filter(Boolean) as string[]
        ),
      ];

      return { answer, sourceIds };
    } catch (err) {
      lastError = err;
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[AI] Query attempt ${attempt + 1} failed:`, msg);

      // Don't retry on non-transient errors
      if (msg.includes("not configured") || msg.includes("API key")) {
        break;
      }
    }
  }

  // All retries exhausted — throw so the caller can return a proper error
  throw lastError instanceof Error
    ? lastError
    : new Error(String(lastError) || "AI query failed after retries");
}
