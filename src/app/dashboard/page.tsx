/**
 * Dashboard Page
 *
 * The main hub. Displays all knowledge items in a searchable,
 * filterable grid. This is where users spend most of their time.
 *
 * Filter state is managed locally (no URL params for now —
 * that'd be a nice progressive enhancement). Data is fetched
 * client-side so the dashboard feels snappy with just a
 * loading skeleton on first paint.
 */

"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, Brain, RefreshCw } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import FilterBar from "@/components/dashboard/FilterBar";
import KnowledgeCard from "@/components/dashboard/KnowledgeCard";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { KnowledgeCardSkeleton } from "@/components/ui/Skeleton";
import type { KnowledgeItem, DashboardFilters, ViewMode } from "@/types";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [filters, setFilters] = useState<DashboardFilters>({
    search: "",
    type: "ALL",
    tag: null,
    sort: "newest",
  });

  // Fetch items from the API
  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filters.type !== "ALL") params.set("type", filters.type);
      if (filters.tag) params.set("tag", filters.tag);
      if (filters.search) params.set("search", filters.search);
      params.set("sort", filters.sort);

      const response = await fetch(`/api/knowledge?${params}`);
      if (!response.ok) throw new Error("Failed to load items");

      const data = await response.json();
      setItems(data);
    } catch (err) {
      setError("Couldn't load your knowledge items. Try refreshing.");
      console.error("[Dashboard] Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Extract all unique tags for the filter bar
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    items.forEach((item) => item.tags.forEach((tag) => tagSet.add(tag)));
    return Array.from(tagSet).sort();
  }, [items]);

  const handleFilterChange = (partial: Partial<DashboardFilters>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
  };

  return (
    <AppShell>
      {/* Page Header */}
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6"
        >
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Your knowledge, all in one place.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchItems}
              disabled={loading}
            >
              <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
              Refresh
            </Button>
            <Link href="/capture">
              <Button size="sm">
                <Plus className="w-4 h-4" />
                New Item
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Filters */}
        <FilterBar
          filters={filters}
          viewMode={viewMode}
          allTags={allTags}
          onFilterChange={handleFilterChange}
          onViewModeChange={setViewMode}
          resultCount={items.length}
        />
      </div>

      {/* Content Area */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        // Skeleton loading state
        <div
          className={cn(
            "gap-4",
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
              : "flex flex-col"
          )}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <KnowledgeCardSkeleton key={i} />
          ))}
        </div>
      ) : items.length === 0 ? (
        // Empty state
        <EmptyState
          icon={<Brain className="w-12 h-12" />}
          title="Your brain is empty"
          description="Start capturing notes, links, and insights. Your AI-powered knowledge base begins with the first entry."
          action={
            <Link href="/capture">
              <Button>
                <Plus className="w-4 h-4" />
                Add Your First Item
              </Button>
            </Link>
          }
        />
      ) : (
        // Knowledge grid/list
        <div
          className={cn(
            "gap-4",
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
              : "flex flex-col"
          )}
        >
          {items.map((item, i) => (
            <KnowledgeCard key={item.id} item={item} index={i} />
          ))}
        </div>
      )}
    </AppShell>
  );
}
