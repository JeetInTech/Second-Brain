/**
 * Item Detail Page
 *
 * Full view of a single knowledge item. Shows all content,
 * metadata, AI summary, tags, and provides actions for
 * AI processing, editing (future), and deletion.
 *
 * This is where the AI features really shine — users can
 * trigger summarization and auto-tagging on demand.
 */

"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  FileText,
  Link2,
  Lightbulb,
  Sparkles,
  Tag,
  Trash2,
  ExternalLink,
  Clock,
  Calendar,
  Brain,
} from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { tagColor, timeAgo } from "@/lib/utils";
import type { KnowledgeItem } from "@/types";

const typeConfig = {
  NOTE: { icon: FileText, label: "Note", color: "text-steel bg-steel-light" },
  LINK: { icon: Link2, label: "Link", color: "text-accent bg-accent-light" },
  INSIGHT: { icon: Lightbulb, label: "Insight", color: "text-sage bg-sage-light" },
} as const;

interface ItemDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ItemDetailPage({ params }: ItemDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();

  const [item, setItem] = useState<KnowledgeItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [summarizing, setSummarizing] = useState(false);
  const [tagging, setTagging] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const fetchItem = useCallback(async () => {
    try {
      const res = await fetch(`/api/knowledge/${id}`);
      if (!res.ok) throw new Error("Not found");
      const data = await res.json();
      setItem(data);
    } catch {
      setItem(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchItem();
  }, [fetchItem]);

  // Show a toast notification
  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // AI: Generate summary
  const handleSummarize = async () => {
    if (!item) return;
    setSummarizing(true);
    try {
      const res = await fetch("/api/ai/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: item.id }),
      });
      if (res.ok) {
        const data = await res.json();
        setItem((prev) => (prev ? { ...prev, summary: data.summary } : prev));
        showNotification("Summary generated successfully!");
      } else {
        showNotification("Failed to generate summary");
      }
    } catch {
      showNotification("Failed to generate summary");
    } finally {
      setSummarizing(false);
    }
  };

  // AI: Auto-tag
  const handleAutoTag = async () => {
    if (!item) return;
    setTagging(true);
    try {
      const res = await fetch("/api/ai/auto-tag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: item.id }),
      });
      if (res.ok) {
        const data = await res.json();
        setItem((prev) => (prev ? { ...prev, tags: data.tags } : prev));
        showNotification("Tags generated successfully!");
      } else {
        showNotification("Failed to generate tags");
      }
    } catch {
      showNotification("Failed to generate tags");
    } finally {
      setTagging(false);
    }
  };

  // Delete item
  const handleDelete = async () => {
    if (!item || !window.confirm("Delete this item? This can't be undone.")) return;
    setDeleting(true);
    try {
      await fetch(`/api/knowledge/${item.id}`, { method: "DELETE" });
      router.push("/dashboard");
    } catch {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div className="max-w-3xl mx-auto space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </AppShell>
    );
  }

  if (!item) {
    return (
      <AppShell>
        <div className="max-w-3xl mx-auto text-center py-20">
          <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-40" />
          <h2 className="text-xl font-semibold mb-2">Item not found</h2>
          <p className="text-sm text-muted-foreground mb-6">
            This knowledge item may have been deleted.
          </p>
          <Link href="/dashboard">
            <Button variant="secondary">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </AppShell>
    );
  }

  const config = typeConfig[item.type];
  const TypeIcon = config.icon;

  return (
    <AppShell>
      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-card border border-border rounded-lg shadow-lg px-4 py-2.5 text-sm font-medium text-foreground"
          >
            {notification}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-3xl mx-auto">
        {/* Back navigation */}
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Dashboard
          </Link>
        </motion.div>

        <motion.article
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-6"
        >
          {/* Header */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${config.color}`}
              >
                <TypeIcon className="w-3.5 h-3.5" />
                {config.label}
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                {timeAgo(item.createdAt)}
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                {new Date(item.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
            </div>
            <h1 className="text-2xl font-bold text-foreground leading-tight">
              {item.title}
            </h1>
          </div>

          {/* Source URL for links */}
          {item.sourceUrl && (
            <a
              href={item.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-accent hover:text-accent-hover transition-colors group"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="group-hover:underline">{item.sourceUrl}</span>
            </a>
          )}

          {/* AI Summary */}
          {item.summary && (
            <div className="bg-accent-light/50 border border-accent/10 rounded-xl p-4">
              <div className="flex items-center gap-1.5 text-xs font-medium text-accent mb-2">
                <Sparkles className="w-3 h-3" />
                AI Summary
              </div>
              <p className="text-sm text-foreground leading-relaxed">
                {item.summary}
              </p>
            </div>
          )}

          {/* Main Content */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="prose-content text-foreground text-[15px] leading-relaxed space-y-3">
              {(() => {
                const shouldTruncate = item.content.length > 400;
                const displayContent = shouldTruncate && !expanded
                  ? item.content.slice(0, 400) + "..."
                  : item.content;
                return (
                  <>
                    {displayContent.split("\n").map((paragraph, i) => (
                      <p key={i} className="whitespace-pre-wrap">{paragraph}</p>
                    ))}
                    {shouldTruncate && (
                      <button
                        onClick={() => setExpanded(!expanded)}
                        className="mt-3 text-sm text-accent hover:underline font-medium transition-colors cursor-pointer"
                      >
                        {expanded ? "Show less" : "Show more"}
                      </button>
                    )}
                  </>
                );
              })()}
            </div>
          </div>

          {/* Tags */}
          <div>
            <div className="flex items-center gap-1.5 text-sm font-medium text-foreground mb-2">
              <Tag className="w-3.5 h-3.5" />
              Tags
            </div>
            <div className="flex flex-wrap gap-1.5">
              {item.tags.length > 0 ? (
                item.tags.map((tag) => (
                  <Badge key={tag} className={tagColor(tag)}>
                    {tag}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">
                  No tags yet. Use AI auto-tag to generate some.
                </span>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleSummarize}
              loading={summarizing}
              disabled={!!item.summary}
            >
              <Sparkles className="w-3.5 h-3.5" />
              {item.summary ? "Summarized" : "Generate Summary"}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleAutoTag}
              loading={tagging}
            >
              <Tag className="w-3.5 h-3.5" />
              Auto-Tag with AI
            </Button>
            <div className="flex-1" />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              loading={deleting}
              className="text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </Button>
          </div>
        </motion.article>
      </div>
    </AppShell>
  );
}
