# Second Brain 🧠

A personal AI-powered knowledge management system built for the Altibbe / Hedamo internship assessment. Capture ideas, notes, and insights — then query them with natural language through an AI assistant.

---

## What it does

Second Brain is a full-stack application that lets you:

- **Capture knowledge** — save notes, links, and insights with tags and metadata
- **Organize with AI** — automatically summarize content and generate relevant tags using Google Gemini
- **Search & filter** — find entries by text, type, or tags with real-time filtering
- **Ask questions** — conversational AI interface that queries your knowledge base and synthesizes answers
- **Expose via API** — public REST endpoint lets external tools query your brain

## Tech stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Animations | Framer Motion |
| Database | PostgreSQL via Prisma ORM |
| AI | Google Gemini 2.5 Flash (via Vercel AI SDK) |
| Icons | Lucide React |

## Getting started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL instance (local or hosted, e.g. Neon, Supabase, Railway)
- Google Gemini API key (optional — app works without it, AI features just won't be available)

### Setup

```bash
# Clone the repo
git clone <your-repo-url>
cd second-brain

# Install dependencies
npm install

# Copy the environment template
cp .env.example .env
```

### Environment variables

Create a `.env` file in the project root:

```env
# PostgreSQL connection string
# For local: postgresql://user:password@localhost:5432/secondbrain
# For Neon/Supabase: use the connection string from your dashboard
DATABASE_URL="postgresql://user:password@localhost:5432/secondbrain"

# Google Gemini API key (optional — AI features degrade gracefully without it)
# Get one at: https://aistudio.google.com/apikey
GOOGLE_GENERATIVE_AI_API_KEY=""

# App URL (used for CORS and metadata)
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Database setup

```bash
# Generate Prisma client and push schema to database
npx prisma db push

# (Optional) Open Prisma Studio to browse your data
npx prisma studio
```

### Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/                # REST API route handlers
│   │   ├── knowledge/      # CRUD endpoints for knowledge items
│   │   ├── ai/             # AI processing (summarize, tag, query)
│   │   └── public/         # Public-facing API with CORS
│   ├── dashboard/          # Main dashboard with filtering
│   ├── capture/            # Knowledge capture form
│   ├── item/[id]/          # Individual item detail view
│   ├── ask/                # Conversational AI query interface
│   ├── docs/               # Architecture documentation
│   └── page.tsx            # Landing page
├── components/
│   ├── ui/                 # Reusable primitives (Button, Input, Badge, etc.)
│   ├── layout/             # App shell, sidebar navigation
│   └── dashboard/          # Dashboard-specific components
├── lib/
│   ├── ai.ts               # AI service (Gemini wrapper, provider-agnostic)
│   ├── db.ts               # Prisma client singleton
│   └── utils.ts            # Shared utilities (cn, timeAgo, slugify, etc.)
├── types/
│   └── index.ts            # Client-safe TypeScript interfaces
└── generated/
    └── prisma/             # Generated Prisma client
```

## Architecture notes

The project is built around four guiding principles (see the `/docs` page in the app for full details):

1. **Portable Architecture** — Every layer (UI, API, AI, DB) has a clean boundary. The AI provider can be swapped by editing one file. The database is abstracted through Prisma.

2. **Principles-Based UX** — AI interactions follow five explicit design principles: graceful degradation, progressive disclosure, transparency, non-blocking operations, and human override.

3. **Agent Thinking** — The system automates knowledge enrichment. New items are automatically summarized and tagged. The query engine extracts keywords, retrieves relevant context, and synthesizes answers.

4. **Infrastructure Mindset** — The public API endpoint (`GET /api/public/brain/query?q=...`) exposes the knowledge base for external consumption with CORS support.

## API reference

### Knowledge CRUD

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/knowledge` | List items (supports `?search=`, `?type=`, `?tag=`, `?sort=`) |
| POST | `/api/knowledge` | Create a new item |
| GET | `/api/knowledge/:id` | Get a single item |
| PUT | `/api/knowledge/:id` | Update an item |
| DELETE | `/api/knowledge/:id` | Delete an item |

### AI Processing

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/summarize` | Generate a summary for an item |
| POST | `/api/ai/auto-tag` | Auto-generate tags for an item |
| POST | `/api/ai/query` | Ask a question about your knowledge base |

### Public API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/public/brain/query?q=...` | Public endpoint for external queries (CORS enabled) |

## Design system

The app uses a warm editorial palette that feels intentional and human:

- **Background:** `#faf9f6` (warm off-white)
- **Foreground:** `#1a1a2e` (deep navy)
- **Accent:** `#e07a5f` (terracotta coral)
- **Steel:** `#3d5a80` (muted blue)
- **Sage:** `#81b29a` (soft green)

Typography uses the Geist font family. Animations are subtle and purposeful via Framer Motion.

## Development

```bash
# Development server with hot reload
npm run dev

# Production build
npm run build

# Start production server
npm start

# Type checking
npx tsc --noEmit

# Lint
npm run lint
```

## License

Built as an assessment submission for the Altibbe / Hedamo internship program.
