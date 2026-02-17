/**
 * Knowledge Card
 *
 * The core display unit for the dashboard. Shows a knowledge
 * item's key info in a compact card format with type indicator,
 * tags, timestamp, and truncated content preview.
 *
 * Intentionally keeping this as a presentational component —
 * all data fetching and mutations happen at the page level.
 */

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FileText, Link2, Lightbulb, Sparkles, Clock } from "lucide-react";
import Badge from "@/components/ui/Badge";
import { truncate, timeAgo, tagColor } from "@/lib/utils";
import type { KnowledgeItem } from "@/types";

const typeConfig = {
  NOTE: { icon: FileText, label: "Note", className: "text-steel bg-steel-light" },
  LINK: { icon: Link2, label: "Link", className: "text-accent bg-accent-light" },
  INSIGHT: { icon: Lightbulb, label: "Insight", className: "text-sage bg-sage-light" },
} as const;

interface KnowledgeCardProps {
  item: KnowledgeItem;
  index?: number;
}

export default function KnowledgeCard({ item, index = 0 }: KnowledgeCardProps) {
  const config = typeConfig[item.type];
  const TypeIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        delay: index * 0.04,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <Link
        href={`/item/${item.id}`}
        className="block group"
      >
        <article className="bg-card border border-border rounded-xl p-5 hover:border-border-hover hover:shadow-md hover:shadow-black/[0.03] transition-all duration-250 h-full">
          {/* Header row — type badge + timestamp */}
          <div className="flex items-center justify-between mb-3">
            <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium ${config.className}`}>
              <TypeIcon className="w-3 h-3" />
              {config.label}
            </div>
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {timeAgo(item.createdAt)}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-[15px] font-semibold text-foreground mb-1.5 group-hover:text-accent transition-colors line-clamp-2">
            {item.title}
          </h3>

          {/* Summary or content preview */}
          <p className="text-sm text-muted-foreground leading-relaxed mb-3 line-clamp-3">
            {item.summary || truncate(item.content, 150)}
          </p>

          {/* AI summary indicator */}
          {item.summary && (
            <div className="flex items-center gap-1 text-[11px] text-accent mb-2">
              <Sparkles className="w-3 h-3" />
              AI Summary
            </div>
          )}

          {/* Tags */}
          {item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {item.tags.slice(0, 4).map((tag) => (
                <Badge key={tag} className={tagColor(tag)}>
                  {tag}
                </Badge>
              ))}
              {item.tags.length > 4 && (
                <Badge>+{item.tags.length - 4}</Badge>
              )}
            </div>
          )}
        </article>
      </Link>
    </motion.div>
  );
}
