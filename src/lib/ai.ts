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
      model: google("gemini-2.0-flash"),
      temperature: 0.3,
      maxOutputTokens: 200,
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
    const { text } = await generateText({
      model: google("gemini-2.0-flash"),
      temperature: 0.2,
      maxOutputTokens: 100,
      system:
        "You are a knowledge organizer. Given the following content, return 3-6 relevant tags " +
        "as a JSON array of lowercase strings. Tags should be specific and useful for filtering. " +
        'Avoid generic tags like "information" or "content". Use hyphens for multi-word tags. ' +
        "Return ONLY the JSON array, nothing else.",
      prompt: title
        ? `Title: ${title}\n\nContent: ${content}`
        : content,
    });

    const raw = text?.trim() ?? "[]";
    const parsed = JSON.parse(raw);

    // Validate that we actually got an array of strings back
    if (Array.isArray(parsed) && parsed.every((t: unknown) => typeof t === "string")) {
      return parsed.map((t: string) => t.toLowerCase().trim());
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
  if (!isAIConfigured()) return null;

  // Build context from relevant items
  const context = relevantItems
    .map((item, i) => `[${i + 1}] "${item.title}"\n${item.content}`)
    .join("\n\n---\n\n");

  try {
    const { text } = await generateText({
      model: google("gemini-2.0-flash"),
      temperature: 0.4,
      maxOutputTokens: 500,
      system:
        "You are a helpful personal knowledge assistant. Answer the user's question based ONLY " +
        "on the provided knowledge base entries. If the answer isn't in the provided context, " +
        "say so honestly. Reference which entries you used by their number [1], [2], etc. " +
        "Be conversational but precise.",
      prompt: `My knowledge base contains these entries:\n\n${context}\n\n---\n\nQuestion: ${question}`,
    });

    const answer = text?.trim();
    if (!answer) return null;

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
    console.error("[AI] Query failed:", err);
    return null;
  }
}
