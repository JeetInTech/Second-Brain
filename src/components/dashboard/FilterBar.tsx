/**
 * Filter Bar
 *
 * Controls for searching, filtering by type/tag, and sorting
 * the knowledge dashboard. All filter state is lifted up to
 * the parent page — this component just renders the controls
 * and calls back on changes.
 */

"use client";

import { Search, SlidersHorizontal, Grid3X3, List, X } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import type { DashboardFilters, ItemType, SortOption, ViewMode } from "@/types";

interface FilterBarProps {
  filters: DashboardFilters;
  viewMode: ViewMode;
  allTags: string[];
  onFilterChange: (filters: Partial<DashboardFilters>) => void;
  onViewModeChange: (mode: ViewMode) => void;
  resultCount: number;
}

const typeOptions: Array<{ value: ItemType | "ALL"; label: string }> = [
  { value: "ALL", label: "All Types" },
  { value: "NOTE", label: "Notes" },
  { value: "LINK", label: "Links" },
  { value: "INSIGHT", label: "Insights" },
];

const sortOptions: Array<{ value: SortOption; label: string }> = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "title", label: "A → Z" },
];

export default function FilterBar({
  filters,
  viewMode,
  allTags,
  onFilterChange,
  onViewModeChange,
  resultCount,
}: FilterBarProps) {
  const hasActiveFilters =
    filters.type !== "ALL" || filters.tag !== null || filters.search !== "";

  return (
    <div className="space-y-3">
      {/* Main filter row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="flex-1">
          <Input
            placeholder="Search your knowledge..."
            value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            icon={<Search className="w-4 h-4" />}
          />
        </div>

        {/* Type filter */}
        <div className="flex gap-2">
          <select
            value={filters.type}
            onChange={(e) =>
              onFilterChange({ type: e.target.value as ItemType | "ALL" })
            }
            className="h-[42px] px-3 rounded-lg border border-border bg-card text-sm text-foreground hover:border-border-hover focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors cursor-pointer"
            aria-label="Filter by type"
          >
            {typeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={filters.sort}
            onChange={(e) =>
              onFilterChange({ sort: e.target.value as SortOption })
            }
            className="h-[42px] px-3 rounded-lg border border-border bg-card text-sm text-foreground hover:border-border-hover focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors cursor-pointer"
            aria-label="Sort order"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* View toggle */}
          <div className="hidden sm:flex items-center border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => onViewModeChange("grid")}
              className={cn(
                "p-2.5 transition-colors cursor-pointer",
                viewMode === "grid"
                  ? "bg-accent text-white"
                  : "bg-card text-muted-foreground hover:text-foreground"
              )}
              aria-label="Grid view"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange("list")}
              className={cn(
                "p-2.5 transition-colors cursor-pointer",
                viewMode === "list"
                  ? "bg-accent text-white"
                  : "bg-card text-muted-foreground hover:text-foreground"
              )}
              aria-label="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Tag filter chips */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 items-center">
          <SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground mr-1" />
          {allTags.slice(0, 12).map((tag) => (
            <button
              key={tag}
              onClick={() =>
                onFilterChange({
                  tag: filters.tag === tag ? null : tag,
                })
              }
              className={cn(
                "px-2.5 py-0.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer",
                filters.tag === tag
                  ? "bg-accent text-white"
                  : "bg-muted text-muted-foreground hover:bg-accent-light hover:text-accent"
              )}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Result count + clear filters */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {resultCount} {resultCount === 1 ? "item" : "items"}
        </span>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              onFilterChange({
                search: "",
                type: "ALL",
                tag: null,
                sort: "newest",
              })
            }
          >
            <X className="w-3 h-3" />
            Clear filters
          </Button>
        )}
      </div>
    </div>
  );
}
