/**
 * Landing Page
 *
 * The first impression. Warm, editorial, a little bit opinionated.
 * Uses Framer Motion for smooth reveal animations and a
 * parallax-ish scroll effect on the floating elements.
 *
 * This page doesn't use the AppShell — it's a standalone
 * marketing-style page with its own nav and full-width layout.
 */

"use client";

import { useRef } from "react";
import Link from "next/link";
import {
  motion,
  useScroll,
  useTransform,
  useInView,
} from "framer-motion";
import {
  Brain,
  PenLine,
  Search,
  Sparkles,
  Globe,
  ArrowRight,
  Zap,
  BookOpen,
  MessageCircle,
} from "lucide-react";
import Button from "@/components/ui/Button";

// ─── Animation Variants ────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  }),
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

// ─── Feature Data ──────────────────────────────────────────

const features = [
  {
    icon: PenLine,
    title: "Capture Everything",
    description:
      "Notes, links, insights — throw it all in. " +
      "Flexible tagging and metadata keep things findable.",
    color: "text-accent bg-accent-light",
  },
  {
    icon: Search,
    title: "Smart Dashboard",
    description:
      "Search, filter, sort. Your knowledge at a glance " +
      "with a UI that actually feels good to use.",
    color: "text-steel bg-steel-light",
  },
  {
    icon: Sparkles,
    title: "AI Intelligence",
    description:
      "Auto-summarize, auto-tag, and ask questions. " +
      "Your brain, but with superpowers.",
    color: "text-sage bg-sage-light",
  },
  {
    icon: Globe,
    title: "Public API",
    description:
      "Expose your knowledge via API or embeddable widget. " +
      "Your brain becomes infrastructure.",
    color: "text-violet-600 bg-violet-50",
  },
];

// ─── Page Component ────────────────────────────────────────

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const featuresInView = useInView(featuresRef, { once: true, margin: "-100px" });

  // Parallax scrolling for hero decorative elements
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* ─── Navigation ─────────────────────────────────── */}
      <motion.nav
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50"
      >
        <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <Brain className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="font-semibold text-foreground tracking-tight">
              Second Brain
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link href="/docs">
              <Button variant="ghost" size="sm">
                Docs
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="sm">
                Open App
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* ─── Hero Section ───────────────────────────────── */}
      <section ref={heroRef} className="relative pt-32 pb-20 lg:pt-44 lg:pb-32">
        {/* Decorative background elements with parallax */}
        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="absolute inset-0 overflow-hidden pointer-events-none"
          aria-hidden="true"
        >
          <div className="absolute top-20 left-[10%] w-72 h-72 bg-accent/5 rounded-full blur-3xl" />
          <div className="absolute top-40 right-[15%] w-96 h-96 bg-steel/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-sage/5 rounded-full blur-3xl" />
        </motion.div>

        <div className="relative max-w-6xl mx-auto px-6">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="max-w-3xl"
          >
            {/* Eyebrow tag */}
            <motion.div
              variants={fadeUp}
              custom={0}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-light text-accent text-xs font-medium mb-6"
            >
              <Zap className="w-3 h-3" />
              AI-powered knowledge management
            </motion.div>

            {/* Main headline */}
            <motion.h1
              variants={fadeUp}
              custom={1}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-[1.1] tracking-tight mb-6"
            >
              Your ideas deserve
              <br />
              <span className="text-accent">a better home.</span>
            </motion.h1>

            {/* Subheading */}
            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-lg text-muted-foreground leading-relaxed max-w-xl mb-8"
            >
              Capture notes, links, and insights in one place. Let AI
              summarize, tag, and connect the dots. Ask questions and
              get answers from your own knowledge base.
            </motion.p>

            {/* CTAs */}
            <motion.div
              variants={fadeUp}
              custom={3}
              className="flex flex-wrap gap-3"
            >
              <Link href="/dashboard">
                <Button size="lg">
                  Open Dashboard
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/capture">
                <Button variant="secondary" size="lg">
                  <PenLine className="w-4 h-4" />
                  Capture Something
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Floating stats — gives a sense of what the app does */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={5}
            className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl"
          >
            {[
              { label: "Types", value: "Notes, Links, Insights" },
              { label: "AI Features", value: "Summarize & Tag" },
              { label: "Search", value: "Full-text + Filters" },
              { label: "Access", value: "Public API" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-card border border-border rounded-xl px-4 py-3"
              >
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-0.5">
                  {stat.label}
                </p>
                <p className="text-sm font-medium text-foreground">
                  {stat.value}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── Features Section ───────────────────────────── */}
      <section ref={featuresRef} className="py-20 lg:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="mb-14"
          >
            <h2 className="text-3xl font-bold text-foreground mb-3">
              Everything you need to think better
            </h2>
            <p className="text-muted-foreground max-w-lg">
              Four pillars that turn scattered information into connected,
              searchable, AI-enhanced knowledge.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-5">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 24 }}
                animate={featuresInView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.5,
                  delay: i * 0.1,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="group bg-card border border-border rounded-2xl p-6 hover:border-border-hover hover:shadow-lg hover:shadow-black/[0.03] transition-all duration-300"
              >
                <div
                  className={`w-10 h-10 rounded-xl ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ───────────────────────────────── */}
      <section className="py-20 bg-muted/50">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl font-bold text-foreground mb-3">
              Deceptively simple workflow
            </h2>
            <p className="text-muted-foreground">
              Three steps. That&apos;s it.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: BookOpen,
                title: "Capture",
                desc: "Drop in a note, paste a link, jot down an insight. Add tags if you want, or let AI handle it.",
              },
              {
                step: "02",
                icon: Sparkles,
                title: "Process",
                desc: "AI summarizes your content, suggests tags, and makes everything searchable. Runs in the background.",
              },
              {
                step: "03",
                icon: MessageCircle,
                title: "Retrieve",
                desc: "Search your brain, filter by type, or just ask a question in plain English. Your knowledge, on demand.",
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="text-center"
              >
                <div className="text-5xl font-bold text-border mb-4">
                  {item.step}
                </div>
                <div className="w-12 h-12 rounded-2xl bg-card border border-border flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-5 h-5 text-accent" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Section ────────────────────────────────── */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-sidebar-bg rounded-3xl p-12 lg:p-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Start building your second brain
            </h2>
            <p className="text-sidebar-text max-w-md mx-auto mb-8">
              Every great idea you&apos;ve ever had deserves to be remembered,
              connected, and made useful again.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/dashboard">
                <Button size="lg">
                  Open Dashboard
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/docs">
                <Button
                  variant="secondary"
                  size="lg"
                  className="border-white/30 bg-white/5 text-white hover:bg-white/15 hover:text-white hover:border-white/50"
                >
                  Read the Docs
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Footer ─────────────────────────────────────── */}
      <footer className="border-t border-border py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Brain className="w-4 h-4" />
            <span>Second Brain — Built with care, powered by AI.</span>
          </div>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <Link href="/docs" className="hover:text-foreground transition-colors">
              Docs
            </Link>
            <Link href="/api/public/brain/query?q=hello" className="hover:text-foreground transition-colors">
              Public API
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
