/**
 * Client-side providers wrapper.
 *
 * Houses any global client components that need to live at the
 * root level — currently just the command palette. Using a
 * separate client boundary keeps the root layout as a server
 * component for better performance.
 */

"use client";

import dynamic from "next/dynamic";

/*
 * Dynamically import the command palette with SSR disabled.
 * It uses createPortal(document.body) which doesn't exist
 * on the server, so we skip rendering during SSR entirely.
 */
const CommandPalette = dynamic(
  () => import("@/components/CommandPalette"),
  { ssr: false }
);

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <CommandPalette />
    </>
  );
}
