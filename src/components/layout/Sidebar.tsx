/**
 * Sidebar Navigation
 *
 * Dark sidebar that anchors the app's navigation.
 * Collapses to icons on mobile (via the AppShell).
 *
 * The nav items are hardcoded here rather than coming
 * from a config — there's only 5 of them and they won't
 * change at runtime, so the simplicity is worth it.
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Brain,
  LayoutDashboard,
  PenLine,
  MessageCircle,
  FileText,
  Sparkles,
} from "lucide-react";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "View all your knowledge",
  },
  {
    label: "Capture",
    href: "/capture",
    icon: PenLine,
    description: "Add new knowledge",
  },
  {
    label: "Ask Brain",
    href: "/ask",
    icon: MessageCircle,
    description: "Query your knowledge",
  },
  {
    label: "Docs",
    href: "/docs",
    icon: FileText,
    description: "Architecture & principles",
  },
];

interface SidebarProps {
  collapsed?: boolean;
}

export default function Sidebar({ collapsed = false }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "h-screen bg-sidebar-bg flex flex-col border-r border-white/5",
        "transition-all duration-300 ease-in-out",
        collapsed ? "w-16" : "w-64"
      )}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Logo / Brand */}
      <Link
        href="/"
        className="flex items-center gap-3 px-4 py-5 border-b border-white/5 hover:bg-white/5 transition-colors"
      >
        <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shrink-0">
          <Brain className="w-4.5 h-4.5 text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-sidebar-active font-semibold text-sm tracking-tight">
              Second Brain
            </h1>
            <p className="text-sidebar-text text-[11px] opacity-60">
              knowledge engine
            </p>
          </div>
        )}
      </Link>

      {/* Nav Items */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm",
                "transition-all duration-200 group",
                isActive
                  ? "bg-white/10 text-sidebar-active"
                  : "text-sidebar-text hover:bg-white/5 hover:text-sidebar-active"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon
                className={cn(
                  "w-[18px] h-[18px] shrink-0",
                  isActive
                    ? "text-sidebar-accent"
                    : "text-sidebar-text group-hover:text-sidebar-active"
                )}
              />
              {!collapsed && <span>{item.label}</span>}
              {isActive && !collapsed && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-sidebar-accent" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section — AI status indicator */}
      <div className="p-3 border-t border-white/5">
        <div
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5",
            collapsed && "justify-center"
          )}
        >
          <Sparkles className="w-3.5 h-3.5 text-sidebar-accent" />
          {!collapsed && (
            <span className="text-[11px] text-sidebar-text">
              AI-Powered
            </span>
          )}
        </div>
      </div>
    </aside>
  );
}
