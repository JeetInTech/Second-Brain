/**
 * Capture Page
 *
 * The knowledge entry point. A clean, focused form for
 * adding new items to your brain. Supports all three types
 * (note, link, insight) with appropriate fields for each.
 *
 * After successful creation, the user gets the option to
 * run AI processing (summarize + auto-tag) on the spot.
 */

"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Link2,
  Lightbulb,
  Sparkles,
  ArrowRight,
  Check,
  X,
  Tag,
} from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Badge from "@/components/ui/Badge";
import { cn, tagColor } from "@/lib/utils";
import type { ItemType } from "@/types";

// ─── Type Selector Data ────────────────────────────────────

const types = [
  {
    value: "NOTE" as ItemType,
    icon: FileText,
    label: "Note",
    desc: "A thought, idea, or reflection",
    color: "border-steel/30 bg-steel-light text-steel hover:border-steel",
    active: "border-steel bg-steel text-white",
  },
  {
    value: "LINK" as ItemType,
    icon: Link2,
    label: "Link",
    desc: "An article, video, or resource",
    color: "border-accent/30 bg-accent-light text-accent hover:border-accent",
    active: "border-accent bg-accent text-white",
  },
  {
    value: "INSIGHT" as ItemType,
    icon: Lightbulb,
    label: "Insight",
    desc: "A synthesized understanding",
    color: "border-sage/30 bg-sage-light text-sage hover:border-sage",
    active: "border-sage bg-sage text-white",
  },
];

export default function CapturePage() {
  const router = useRouter();

  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState<ItemType>("NOTE");
  const [sourceUrl, setSourceUrl] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [aiProcessing, setAiProcessing] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Tag management
  const addTag = () => {
    const cleaned = tagInput.toLowerCase().trim();
    if (cleaned && !tags.includes(cleaned)) {
      setTags((prev) => [...prev, cleaned]);
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    }
    // Backspace removes the last tag if input is empty
    if (e.key === "Backspace" && tagInput === "" && tags.length > 0) {
      setTags((prev) => prev.slice(0, -1));
    }
  };

  // Fetch link content when URL is provided for LINK type
  const fetchLinkContent = async (url: string): Promise<string | null> => {
    try {
      const res = await fetch("/api/fetch-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.content || null;
      }
    } catch (err) {
      console.warn("[Capture] Failed to fetch link content:", err);
    }
    return null;
  };

  // Form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      // For LINK type, try to fetch webpage content
      let finalContent = content;
      if (type === "LINK" && sourceUrl.trim()) {
        const fetched = await fetchLinkContent(sourceUrl);
        if (fetched) {
          finalContent = content.trim()
            ? `${content}\n\n--- Fetched from URL ---\n${fetched}`
            : fetched;
        }
      }

      const response = await fetch("/api/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content: finalContent,
          type,
          tags,
          sourceUrl: sourceUrl || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save");
      }

      const item = await response.json();
      setSuccess(item.id);

      // Trigger AI processing in the background
      runAIProcessing(item.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  // AI processing — runs after successful save
  const runAIProcessing = async (itemId: string) => {
    setAiProcessing(true);
    try {
      // Fire both requests in parallel
      await Promise.allSettled([
        fetch("/api/ai/summarize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ itemId }),
        }),
        fetch("/api/ai/auto-tag", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ itemId }),
        }),
      ]);
    } catch {
      // AI failures are non-blocking — the item is already saved
    } finally {
      setAiProcessing(false);
    }
  };

  // Reset form for another entry
  const resetForm = () => {
    setTitle("");
    setContent("");
    setType("NOTE");
    setSourceUrl("");
    setTagInput("");
    setTags([]);
    setSuccess(null);
    setError(null);
  };

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-foreground">
            Capture Knowledge
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Add something worth remembering. AI will process it automatically.
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {success ? (
            // ─── Success State ─────────────────────────────
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 rounded-full bg-sage-light flex items-center justify-center mx-auto mb-4">
                <Check className="w-7 h-7 text-sage" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Saved to your brain</h2>
              <p className="text-sm text-muted-foreground mb-1">
                {aiProcessing
                  ? "AI is processing your content..."
                  : "AI processing complete."}
              </p>
              {aiProcessing && (
                <div className="flex items-center justify-center gap-2 text-xs text-accent mb-4">
                  <Sparkles className="w-3 h-3 animate-pulse" />
                  Generating summary and tags...
                </div>
              )}
              <div className="flex justify-center gap-3 mt-6">
                <Button variant="secondary" onClick={resetForm}>
                  Add Another
                </Button>
                <Button onClick={() => router.push(`/item/${success}`)}>
                  View Item
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </motion.div>
          ) : (
            // ─── Capture Form ──────────────────────────────
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              {/* Type Selector */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  What kind of knowledge is this?
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {types.map((t) => {
                    const isSelected = type === t.value;
                    return (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => setType(t.value)}
                        className={cn(
                          "flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-200 cursor-pointer",
                          isSelected ? t.active : t.color
                        )}
                      >
                        <t.icon className="w-5 h-5" />
                        <span className="text-sm font-medium">{t.label}</span>
                        <span
                          className={cn(
                            "text-[11px] leading-tight text-center",
                            isSelected ? "opacity-80" : "opacity-60"
                          )}
                        >
                          {t.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title */}
              <Input
                label="Title"
                placeholder="What's the gist?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />

              {/* Content */}
              <Textarea
                label="Content"
                placeholder="Write your note, paste an article excerpt, describe your insight..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />

              {/* Source URL — only shown for LINK type */}
              {type === "LINK" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Input
                    label="Source URL"
                    placeholder="https://..."
                    type="url"
                    value={sourceUrl}
                    onChange={(e) => setSourceUrl(e.target.value)}
                    icon={<Link2 className="w-4 h-4" />}
                  />
                </motion.div>
              )}

              {/* Tags */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-foreground">
                  Tags
                  <span className="text-muted-foreground font-normal ml-1">
                    (optional — AI can auto-tag too)
                  </span>
                </label>
                <div className="flex flex-wrap gap-1.5 p-2.5 rounded-lg border border-border bg-card min-h-[42px] focus-within:ring-2 focus-within:ring-accent/20 focus-within:border-accent transition-all">
                  {tags.map((tag) => (
                    <Badge
                      key={tag}
                      className={tagColor(tag)}
                      removable
                      onRemove={() => removeTag(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    onBlur={addTag}
                    placeholder={tags.length === 0 ? "Type a tag and press Enter..." : ""}
                    className="flex-1 min-w-[100px] bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  Press Enter or comma to add. AI will suggest more after saving.
                </p>
              </div>

              {/* Error Display */}
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                  <X className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              {/* Submit */}
              <div className="flex gap-3 pt-2">
                <Button
                  type="submit"
                  loading={submitting}
                  className="flex-1 sm:flex-none"
                >
                  <Sparkles className="w-4 h-4" />
                  Save & Process with AI
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => router.push("/dashboard")}
                >
                  Cancel
                </Button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </AppShell>
  );
}
