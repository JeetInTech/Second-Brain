/**
 * Textarea Component
 *
 * Auto-resizing textarea for content entry.
 * Shares visual style with Input for consistency.
 */

"use client";

import { forwardRef, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  autoResize?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, autoResize = true, id, onChange, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, "-");
    const internalRef = useRef<HTMLTextAreaElement | null>(null);

    // Combine forwarded ref with internal ref
    const setRef = (el: HTMLTextAreaElement | null) => {
      internalRef.current = el;
      if (typeof ref === "function") ref(el);
      else if (ref) ref.current = el;
    };

    const adjustHeight = () => {
      const el = internalRef.current;
      if (el && autoResize) {
        el.style.height = "auto";
        el.style.height = `${el.scrollHeight}px`;
      }
    };

    useEffect(() => {
      adjustHeight();
    });

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-foreground"
          >
            {label}
          </label>
        )}
        <textarea
          ref={setRef}
          id={textareaId}
          onChange={(e) => {
            adjustHeight();
            onChange?.(e);
          }}
          className={cn(
            "w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm",
            "placeholder:text-muted-foreground",
            "transition-colors duration-200",
            "hover:border-border-hover",
            "focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent",
            "min-h-[120px] resize-none leading-relaxed",
            error && "border-red-400 focus:ring-red-200 focus:border-red-400",
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-sm text-red-500" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
export default Textarea;
