/**
 * Command Palette (Ctrl+K / Cmd+K)
 *
 * Power-user feature — a spotlight-style command palette for
 * quick navigation and actions. Registered globally via a
 * keyboard listener in the app layout.
 *
 * Commands include navigation shortcuts, creation actions, and
 * a quick-search through knowledge items.
 */

"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  LayoutDashboard,
  PenLine,
  MessageCircleQuestion,
  BookOpen,
  Plus,
  Home,
  Command,
  ArrowRight,
} from "lucide-react";

// ─── Command Definitions ───────────────────────────────────

interface PaletteCommand {
  id: string;
  label: string;
  description?: string;
  icon: React.ElementType;
  section: "navigation" | "actions";
  keywords: string[];
  action: () => void;
}

function useCommands() {
  const router = useRouter();

  return useMemo<PaletteCommand[]>(
    () => [
      // Navigation
      {
        id: "nav-home",
        label: "Go to Home",
        description: "Landing page",
        icon: Home,
        section: "navigation",
        keywords: ["home", "landing", "index"],
        action: () => router.push("/"),
      },
      {
        id: "nav-dashboard",
        label: "Go to Dashboard",
        description: "View all knowledge items",
        icon: LayoutDashboard,
        section: "navigation",
        keywords: ["dashboard", "items", "list", "browse"],
        action: () => router.push("/dashboard"),
      },
      {
        id: "nav-capture",
        label: "Go to Capture",
        description: "Create a new entry",
        icon: PenLine,
        section: "navigation",
        keywords: ["capture", "create", "new", "add", "write"],
        action: () => router.push("/capture"),
      },
      {
        id: "nav-ask",
        label: "Go to Ask AI",
        description: "Query your knowledge base",
        icon: MessageCircleQuestion,
        section: "navigation",
        keywords: ["ask", "ai", "query", "chat", "question"],
        action: () => router.push("/ask"),
      },
      {
        id: "nav-docs",
        label: "Go to Documentation",
        description: "Architecture & design principles",
        icon: BookOpen,
        section: "navigation",
        keywords: ["docs", "documentation", "architecture", "design"],
        action: () => router.push("/docs"),
      },
      // Actions
      {
        id: "action-new-note",
        label: "New Note",
        description: "Start capturing a note",
        icon: Plus,
        section: "actions",
        keywords: ["new", "note", "create", "add"],
        action: () => router.push("/capture?type=NOTE"),
      },
      {
        id: "action-new-link",
        label: "New Link",
        description: "Save a link with context",
        icon: Plus,
        section: "actions",
        keywords: ["link", "url", "save", "bookmark"],
        action: () => router.push("/capture?type=LINK"),
      },
      {
        id: "action-new-insight",
        label: "New Insight",
        description: "Record an insight or reflection",
        icon: Plus,
        section: "actions",
        keywords: ["insight", "idea", "reflection", "thought"],
        action: () => router.push("/capture?type=INSIGHT"),
      },
    ],
    [router]
  );
}

// ─── Command Palette Component ─────────────────────────────

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const commands = useCommands();

  // Filter commands based on search query
  const filtered = useMemo(() => {
    if (!query.trim()) return commands;

    const lower = query.toLowerCase();
    return commands.filter(
      (cmd) =>
        cmd.label.toLowerCase().includes(lower) ||
        cmd.description?.toLowerCase().includes(lower) ||
        cmd.keywords.some((kw) => kw.includes(lower))
    );
  }, [commands, query]);

  // Group filtered commands by section
  const grouped = useMemo(() => {
    const sections: { title: string; commands: PaletteCommand[] }[] = [];

    const nav = filtered.filter((c) => c.section === "navigation");
    const actions = filtered.filter((c) => c.section === "actions");

    if (nav.length) sections.push({ title: "Navigate", commands: nav });
    if (actions.length) sections.push({ title: "Actions", commands: actions });

    return sections;
  }, [filtered]);

  // Flat list for keyboard navigation
  const flatList = useMemo(
    () => grouped.flatMap((g) => g.commands),
    [grouped]
  );

  // Reset state when closing
  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setSelectedIndex(0);
  }, []);

  // Execute selected command
  const execute = useCallback(
    (cmd: PaletteCommand) => {
      close();
      /*
       * Small delay so the palette closes before navigation starts.
       * Without this, the route change feels jarring because the
       * palette overlay is still visible during the transition.
       */
      setTimeout(() => cmd.action(), 80);
    },
    [close]
  );

  // ─── Keyboard shortcut: Ctrl+K / Cmd+K ──────────────────

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const isMod = event.metaKey || event.ctrlKey;

      if (isMod && event.key === "k") {
        event.preventDefault();
        setOpen((prev) => !prev);
      }

      if (event.key === "Escape" && open) {
        event.preventDefault();
        close();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, close]);

  // Focus input when palette opens
  useEffect(() => {
    if (open) {
      // Tiny delay to let the animation start before focusing
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  // Clamp selected index when results change
  useEffect(() => {
    if (selectedIndex >= flatList.length) {
      setSelectedIndex(Math.max(0, flatList.length - 1));
    }
  }, [flatList.length, selectedIndex]);

  // ─── Keyboard navigation inside the palette ──────────────

  function handleInputKeyDown(event: React.KeyboardEvent) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, flatList.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (event.key === "Enter" && flatList[selectedIndex]) {
      event.preventDefault();
      execute(flatList[selectedIndex]);
    }
  }

  // Scroll selected item into view
  useEffect(() => {
    const container = listRef.current;
    if (!container) return;

    const selected = container.querySelector("[data-selected='true']");
    if (selected) {
      selected.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  // ─── Render ──────────────────────────────────────────────

  if (typeof window === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={close}
          />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-[20%] left-1/2 -translate-x-1/2 z-50 w-full max-w-lg"
          >
            <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
              {/* Search Input */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setSelectedIndex(0);
                  }}
                  onKeyDown={handleInputKeyDown}
                  placeholder="Type a command or search…"
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                />
                <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground bg-muted rounded">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div
                ref={listRef}
                className="max-h-72 overflow-y-auto p-2"
              >
                {grouped.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    No commands found
                  </p>
                )}

                {grouped.map((section) => (
                  <div key={section.title} className="mb-1 last:mb-0">
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-2 py-1.5">
                      {section.title}
                    </p>
                    {section.commands.map((cmd) => {
                      const globalIdx = flatList.indexOf(cmd);
                      const isSelected = globalIdx === selectedIndex;

                      return (
                        <button
                          key={cmd.id}
                          data-selected={isSelected}
                          onClick={() => execute(cmd)}
                          onMouseEnter={() => setSelectedIndex(globalIdx)}
                          className={`
                            w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left
                            transition-colors duration-75
                            ${
                              isSelected
                                ? "bg-accent/10 text-accent"
                                : "text-foreground hover:bg-muted/50"
                            }
                          `}
                        >
                          <cmd.icon className="w-4 h-4 shrink-0 opacity-60" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {cmd.label}
                            </p>
                            {cmd.description && (
                              <p className="text-xs text-muted-foreground truncate">
                                {cmd.description}
                              </p>
                            )}
                          </div>
                          {isSelected && (
                            <ArrowRight className="w-3.5 h-3.5 shrink-0 opacity-40" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* Footer hint */}
              <div className="px-4 py-2 border-t border-border flex items-center gap-4 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 bg-muted rounded text-[9px]">↑↓</kbd>
                  navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 bg-muted rounded text-[9px]">↵</kbd>
                  select
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 bg-muted rounded text-[9px]">esc</kbd>
                  close
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
