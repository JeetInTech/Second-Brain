/**
 * Documentation Page
 *
 * Covers the four architectural concepts required:
 * 1. Portable Architecture
 * 2. Principles-Based UX
 * 3. Agent Thinking
 * 4. Infrastructure Mindset
 *
 * Written as a proper documentation page within the app
 * itself, using the same design system as the rest of the UI.
 */

"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import {
  Layers,
  Paintbrush,
  Cpu,
  Globe,
  ArrowLeft,
  ArrowRight,
  Database,
  Brain,
  Sparkles,
  Code,
  Boxes,
  Workflow,
} from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import Button from "@/components/ui/Button";

// ─── Section Component ─────────────────────────────────────

function DocSection({
  icon: Icon,
  number,
  title,
  children,
}: {
  icon: React.ElementType;
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="bg-card border border-border rounded-2xl p-6 lg:p-8"
    >
      <div className="flex items-start gap-4 mb-5">
        <div className="w-10 h-10 rounded-xl bg-accent-light text-accent flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-medium text-accent uppercase tracking-wider mb-0.5">
            {number}
          </p>
          <h2 className="text-xl font-bold text-foreground">{title}</h2>
        </div>
      </div>
      <div className="space-y-4 text-sm text-foreground leading-relaxed pl-14">
        {children}
      </div>
    </motion.section>
  );
}

// ─── Architecture Diagram Row ──────────────────────────────

function ArchLayer({
  label,
  items,
  icon: Icon,
}: {
  label: string;
  items: string[];
  icon: React.ElementType;
}) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-muted-foreground" />
      </div>
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {label}
        </p>
        <p className="text-sm text-foreground">{items.join(" → ")}</p>
      </div>
    </div>
  );
}

// ─── Page Component ────────────────────────────────────────

export default function DocsPage() {
  return (
    <AppShell>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Home
          </Link>
          <h1 className="text-3xl font-bold text-foreground">
            Architecture & Design
          </h1>
          <p className="text-muted-foreground mt-1">
            How Second Brain is built, the thinking behind it, and the principles
            that guide every decision.
          </p>
        </motion.div>

        <div className="space-y-6">
          {/* ─── 1. Portable Architecture ─────────────────── */}
          <DocSection icon={Layers} number="Principle 01" title="Portable Architecture">
            <p>
              The system is deliberately layered so that any component can be
              replaced without cascading changes. This isn&apos;t theoretical — every
              layer has a clear boundary and well-defined interface.
            </p>

            <div className="bg-muted/50 rounded-xl p-4 space-y-1">
              <ArchLayer
                icon={Paintbrush}
                label="Presentation"
                items={["Next.js App Router", "React Components", "Tailwind CSS", "Framer Motion"]}
              />
              <ArchLayer
                icon={Code}
                label="API Layer"
                items={["Next.js Route Handlers", "RESTful endpoints", "Input validation"]}
              />
              <ArchLayer
                icon={Brain}
                label="AI Service"
                items={["Google Gemini 2.5 Flash (swappable)", "Centralized in lib/ai.ts", "Provider-agnostic interface"]}
              />
              <ArchLayer
                icon={Database}
                label="Data Layer"
                items={["Prisma ORM", "PostgreSQL", "Clean schema with migrations"]}
              />
            </div>

            <p>
              <strong>Swappability in practice:</strong> The AI service lives entirely
              in <code className="text-xs bg-muted px-1.5 py-0.5 rounded">src/lib/ai.ts</code>.
              Switching from Gemini to Claude or OpenAI means changing one file.
              The database layer is abstracted through Prisma — switching from PostgreSQL
              to another SQL database requires only a connection string change.
              The frontend components consume typed interfaces, not raw database models,
              so the data layer and UI are fully decoupled.
            </p>
          </DocSection>

          {/* ─── 2. Principles-Based UX ───────────────────── */}
          <DocSection icon={Paintbrush} number="Principle 02" title="Principles-Based UX">
            <p>
              Every AI interaction follows these five design principles. They were
              defined before writing any code and serve as the decision framework
              for all UX choices:
            </p>

            <div className="space-y-3">
              {[
                {
                  name: "Graceful Degradation",
                  desc:
                    "AI features are optional enhancements, not requirements. The app works fully " +
                    "without an API key configured. When AI is unavailable, the UI adapts — showing " +
                    "manual tagging options instead of error states.",
                },
                {
                  name: "Progressive Disclosure",
                  desc:
                    "AI results appear inline, not in modal interruptions. Summaries show up in a subtle " +
                    "accent card. Auto-tags merge seamlessly with manual tags. The AI is helpful without " +
                    "being overwhelming.",
                },
                {
                  name: "Transparency",
                  desc:
                    'AI-generated content is always labeled. Summary cards show a "AI Summary" badge. ' +
                    "Conversational answers include source references so users can verify claims.",
                },
                {
                  name: "Non-Blocking Operations",
                  desc:
                    "AI processing never blocks the primary workflow. After creating a knowledge item, " +
                    "it's saved immediately — summarization and tagging happen asynchronously. The user " +
                    "sees a progress indicator but can navigate away.",
                },
                {
                  name: "Human Override",
                  desc:
                    "Users can always manually tag, edit, or delete AI-generated content. The AI suggests, " +
                    "the human decides. No auto-generated content is permanent without implicit user acceptance.",
                },
              ].map((principle) => (
                <div
                  key={principle.name}
                  className="border-l-2 border-accent/30 pl-4"
                >
                  <h4 className="font-semibold text-foreground text-sm">
                    {principle.name}
                  </h4>
                  <p className="text-muted-foreground text-[13px] mt-0.5">
                    {principle.desc}
                  </p>
                </div>
              ))}
            </div>
          </DocSection>

          {/* ─── 3. Agent Thinking ─────────────────────────── */}
          <DocSection icon={Cpu} number="Principle 03" title="Agent Thinking">
            <p>
              The system includes automated behaviors that maintain and improve
              the knowledge base over time, reducing manual upkeep and surfacing
              connections the user might miss.
            </p>

            <div className="space-y-3">
              <div className="bg-sage-light/50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-sage" />
                  <h4 className="font-semibold text-sm">Automatic Post-Save Processing</h4>
                </div>
                <p className="text-[13px] text-muted-foreground">
                  When a new knowledge item is created, the capture form automatically
                  triggers both summarization and auto-tagging in parallel. This runs
                  as a fire-and-forget background operation — the item is saved first,
                  AI enrichment follows.
                </p>
              </div>

              <div className="bg-steel-light/50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Boxes className="w-4 h-4 text-steel" />
                  <h4 className="font-semibold text-sm">Intelligent Tag Merging</h4>
                </div>
                <p className="text-[13px] text-muted-foreground">
                  When AI generates tags, they&apos;re merged with existing manual tags
                  rather than replacing them. Tags are deduplicated and normalized
                  (lowercased, trimmed) automatically. This means the tag taxonomy
                  improves organically over time without user intervention.
                </p>
              </div>

              <div className="bg-accent-light/50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Workflow className="w-4 h-4 text-accent" />
                  <h4 className="font-semibold text-sm">Context-Aware Query Routing</h4>
                </div>
                <p className="text-[13px] text-muted-foreground">
                  The conversational query system extracts keywords from questions,
                  fetches relevant items via database search, and feeds them as
                  structured context to the AI. Source references are automatically
                  extracted from the response and linked back to the originals.
                  It&apos;s a lightweight RAG pipeline that works without vector embeddings.
                </p>
              </div>
            </div>
          </DocSection>

          {/* ─── 4. Infrastructure Mindset ────────────────── */}
          <DocSection icon={Globe} number="Principle 04" title="Infrastructure Mindset">
            <p>
              Second Brain isn&apos;t just an app — it&apos;s a knowledge API. The system
              exposes its intelligence through a public endpoint that external
              systems can consume.
            </p>

            <div className="bg-muted/50 rounded-xl p-4 font-mono text-xs space-y-2">
              <p className="text-muted-foreground">
                # Public API Endpoint
              </p>
              <p className="text-foreground">
                GET /api/public/brain/query?q=your+question
              </p>
              <p className="text-muted-foreground mt-3">
                # Response format
              </p>
              <pre className="text-foreground whitespace-pre-wrap">
{`{
  "question": "What do I know about...",
  "answer": "Based on your knowledge...",
  "sources": [
    { "id": "...", "title": "...", "type": "NOTE", "summary": "..." }
  ],
  "timestamp": "2025-02-17T..."
}`}
              </pre>
            </div>

            <p>
              The endpoint includes CORS headers for cross-origin access, making
              it embeddable in any context — a personal website widget, a Slack bot,
              or a browser extension. The response format is
              self-documenting with typed source references.
            </p>

            <p>
              <strong>Embeddable use cases:</strong> A portfolio site could iframe
              a query widget that lets visitors ask questions about your expertise.
              A Chrome extension could query your brain while browsing. A team
              dashboard could aggregate knowledge across multiple brains.
            </p>
          </DocSection>
        </div>

        {/* Footer CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <Link href="/dashboard">
            <Button size="lg">
              Explore the Dashboard
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </AppShell>
  );
}
