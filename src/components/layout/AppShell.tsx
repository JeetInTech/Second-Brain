/**
 * App Shell
 *
 * Wraps the sidebar + main content area for all
 * authenticated/app pages. The landing page doesn't
 * use this — it has its own full-width layout.
 *
 * Handles the mobile hamburger toggle and content area
 * scrolling separately from the sidebar.
 */

"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      {/* Desktop sidebar — always visible */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile sidebar — slides in from left */}
      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden transition-opacity duration-300",
          mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/40"
          onClick={() => setMobileOpen(false)}
        />
        {/* Drawer */}
        <div
          className={cn(
            "absolute inset-y-0 left-0 w-64 transition-transform duration-300 ease-out",
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <Sidebar />
        </div>
      </div>

      {/* Main content area */}
      <main className="flex-1 overflow-y-auto">
        {/* Mobile header with hamburger */}
        <div className="lg:hidden sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors cursor-pointer"
            aria-label="Open navigation"
          >
            {mobileOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
          <span className="text-sm font-semibold">Second Brain</span>
        </div>

        {/* Page content with comfortable padding */}
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
