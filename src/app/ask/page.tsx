/**
 * Ask Your Brain — Conversational Query Page
 *
 * This is the "talk to your notes" feature. Users type a
 * question, the system finds relevant knowledge items, feeds
 * them to the AI, and returns a synthesized answer with
 * references to the source material.
 *
 * The UI is chat-style to make it feel natural, but under
 * the hood it's a simple request-response pattern (not streaming).
 */

"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Brain,
  User,
  Sparkles,
  ArrowUpRight,
  MessageCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Array<{ id: string; title: string }>;
  isError?: boolean;
  timestamp: Date;
}

export default function AskPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load chat history from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("ask-brain-history");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const restored = parsed.map((msg: ChatMessage & { timestamp: string }) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
        setMessages(restored);
      } catch {
        console.error("[Chat] Failed to restore history");
      }
    }
  }, []);

  // Save chat history to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("ask-brain-history", JSON.stringify(messages));
    }
  }, [messages]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-focus input
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Clear chat history
  const clearHistory = () => {
    setMessages([]);
    localStorage.removeItem("ask-brain-history");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const question = input.trim();
    if (!question || loading) return;

    // Add user message
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: question,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Server returned an error — show it clearly as an error
        const assistantMsg: ChatMessage = {
          id: `err-${Date.now()}`,
          role: "assistant",
          content: data.error || `Request failed (${res.status}). Please try again.`,
          isError: true,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        const assistantMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          role: "assistant",
          content: data.answer || "I couldn't process that question.",
          sources: data.sources || [],
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      }
    } catch {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: "assistant",
        content: "Something went wrong. Check your connection and try again.",
        isError: true,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-8rem)] lg:h-[calc(100vh-6rem)]">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 shrink-0 flex items-start justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold text-foreground">Ask Your Brain</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Ask questions and get answers from your knowledge base.
            </p>
          </div>
          {messages.length > 0 && (
            <button
              onClick={clearHistory}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-muted cursor-pointer"
            >
              Clear history
            </button>
          )}
        </motion.div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto rounded-xl border border-border bg-card p-4 mb-4">
          {messages.length === 0 ? (
            // Welcome state
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="w-14 h-14 rounded-2xl bg-accent-light flex items-center justify-center mb-4">
                <MessageCircle className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                What would you like to know?
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm mb-6">
                Ask anything about your captured knowledge. I&apos;ll search your
                notes and synthesize an answer.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  "What have I learned about?",
                  "Summarize my recent notes",
                  "What are the key themes?",
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      setInput(suggestion);
                      inputRef.current?.focus();
                    }}
                    className="text-xs px-3 py-1.5 rounded-full bg-muted text-muted-foreground hover:bg-accent-light hover:text-accent transition-colors cursor-pointer"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            // Messages
            <div className="space-y-4">
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={cn(
                      "flex gap-3",
                      msg.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    {msg.role === "assistant" && (
                      <div className={cn(
                        "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                        msg.isError ? "bg-red-100" : "bg-accent-light"
                      )}>
                        {msg.isError ? (
                          <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                        ) : (
                          <Brain className="w-3.5 h-3.5 text-accent" />
                        )}
                      </div>
                    )}

                    <div
                      className={cn(
                        "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                        msg.role === "user"
                          ? "bg-accent text-white rounded-br-md"
                          : msg.isError
                            ? "bg-red-50 text-red-700 border border-red-200 rounded-bl-md"
                            : "bg-muted text-foreground rounded-bl-md"
                      )}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>

                      {/* Source references */}
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="mt-3 pt-2 border-t border-black/10">
                          <p className="text-[11px] font-medium opacity-70 mb-1">
                            Sources:
                          </p>
                          <div className="space-y-0.5">
                            {msg.sources.map((src) => (
                              <Link
                                key={src.id}
                                href={`/item/${src.id}`}
                                className="flex items-center gap-1 text-[11px] opacity-80 hover:opacity-100 transition-opacity"
                              >
                                <ArrowUpRight className="w-3 h-3" />
                                {src.title}
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {msg.role === "user" && (
                      <div className="w-7 h-7 rounded-lg bg-foreground/10 flex items-center justify-center shrink-0 mt-0.5">
                        <User className="w-3.5 h-3.5 text-foreground" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Typing indicator */}
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3"
                >
                  <div className="w-7 h-7 rounded-lg bg-accent-light flex items-center justify-center shrink-0">
                    <Brain className="w-3.5 h-3.5 text-accent" />
                  </div>
                  <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Searching your brain...
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <form onSubmit={handleSubmit} className="shrink-0">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question about your knowledge..."
                className="w-full rounded-xl border border-border bg-card px-4 py-3 pr-12 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors"
                disabled={loading}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <Sparkles className="w-4 h-4 text-accent/30" />
              </div>
            </div>
            <Button
              type="submit"
              disabled={!input.trim() || loading}
              className="px-4"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1.5 text-center">
            Answers are generated from your knowledge base using AI.
          </p>
        </form>
      </div>
    </AppShell>
  );
}
