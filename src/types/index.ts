/**
 * Shared type definitions.
 *
 * These mirror the Prisma schema but are safe to import
 * on the client side (no server-only dependencies).
 * I keep them separate so components never accidentally
 * pull in the Prisma client.
 */

// ─── Knowledge Item ────────────────────────────────────────

export type ItemType = "NOTE" | "LINK" | "INSIGHT";

export interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  type: ItemType;
  tags: string[];
  sourceUrl: string | null;
  summary: string | null;
  createdAt: string; // ISO string from API
  updatedAt: string;
}

// ─── API Payloads ──────────────────────────────────────────

export interface CreateKnowledgePayload {
  title: string;
  content: string;
  type: ItemType;
  tags?: string[];
  sourceUrl?: string;
}

export interface UpdateKnowledgePayload {
  title?: string;
  content?: string;
  type?: ItemType;
  tags?: string[];
  sourceUrl?: string;
}

// ─── AI Responses ──────────────────────────────────────────

export interface SummarizeResponse {
  summary: string;
  itemId: string;
}

export interface AutoTagResponse {
  tags: string[];
  itemId: string;
}

export interface QueryResponse {
  answer: string;
  sources: Array<{
    id: string;
    title: string;
  }>;
}

// ─── Dashboard Filters ────────────────────────────────────

export type SortOption = "newest" | "oldest" | "title";
export type ViewMode = "grid" | "list";

export interface DashboardFilters {
  search: string;
  type: ItemType | "ALL";
  tag: string | null;
  sort: SortOption;
}

// ─── Public API ────────────────────────────────────────────

export interface PublicBrainQueryResponse {
  question: string;
  answer: string;
  sources: Array<{
    id: string;
    title: string;
    type: ItemType;
    summary: string | null;
  }>;
  timestamp: string;
}
