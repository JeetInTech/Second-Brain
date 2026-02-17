/**
 * Badge Component
 *
 * Used primarily for tags on knowledge items. Supports an
 * optional onRemove callback that shows a tiny × button —
 * useful in the capture form where users manage tags manually.
 *
 * Colors are deterministic per-tag using the tagColor utility,
 * so "react" always looks the same everywhere in the app.
 */

import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface BadgeProps {
  label?: string;
  children?: React.ReactNode;
  removable?: boolean;
  onRemove?: () => void;
  className?: string;
}

export default function Badge({ label, children, removable, onRemove, className }: BadgeProps) {
  const content = children ?? label;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium",
        "transition-colors duration-150",
        className
      )}
    >
      {content}
      {(removable || onRemove) && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
          className="ml-0.5 rounded-full p-0.5 hover:bg-black/10 transition-colors"
          aria-label="Remove tag"
        >
          <X className="w-2.5 h-2.5" />
        </button>
      )}
    </span>
  );
}
