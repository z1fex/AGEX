<p align="center">
  <h1 align="center">AGEX</h1>
  <p align="center"><strong>Your AI Agency. One Conversation.</strong></p>
  <p align="center">
    113 agents &middot; 8 teams &middot; 9 workflows &middot; Any LLM
  </p>
</p>

<p align="center">
  <a href="#quick-start"><img src="https://img.shields.io/badge/Quick_Start-000?style=for-the-badge&logo=rocket&logoColor=white" alt="Quick Start" /></a>
  <a href="#features"><img src="https://img.shields.io/badge/Features-000?style=for-the-badge&logo=sparkles&logoColor=white" alt="Features" /></a>
  <a href="#architecture"><img src="https://img.shields.io/badge/Architecture-000?style=for-the-badge&logo=blueprint&logoColor=white" alt="Architecture" /></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-white?style=flat-square&labelColor=000" alt="Version" />
  <img src="https://img.shields.io/badge/agents-113+-white?style=flat-square&labelColor=000" alt="Agents" />
  <img src="https://img.shields.io/badge/teams-8-white?style=flat-square&labelColor=000" alt="Teams" />
  <img src="https://img.shields.io/badge/workflows-9-white?style=flat-square&labelColor=000" alt="Workflows" />
  <img src="https://img.shields.io/badge/license-MIT-white?style=flat-square&labelColor=000" alt="License" />
</p>

---

## What is AGEX?

AGEX is a self-hosted AI agency platform. You talk to it. It deploys the right agents. You get professional output.

It's not a chatbot. It's not a workflow builder. It's a complete AI agency with 113 specialized agents across 8 teams that reads your message, figures out what needs to be done, and does it.

```
You: "Write cold outreach emails for selling AI tools to CTOs"

AGEX: Sales Team activated.
      → ICP Analyst refining target persona
      → Cold Email Writer crafting the sequence
      → Follow-up Automator building the cadence

      Here are your 3 emails...
```

**Works with any LLM** — OpenAI, Anthropic, Google, Groq (free), OpenRouter, or local models via Ollama.

---

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) 20+
- [pnpm](https://pnpm.io/) 9+
- An API key from any supported LLM provider

### Install

```bash
git clone https://github.com/z1fex/agex.git
cd agex
pnpm install
```

### Run

```bash
cd apps/web
npx next dev -p 3000
```

### Configure

1. Open **http://localhost:3000**
2. Click **"Start talking"**
3. Go to **Settings** in the sidebar
4. Add your API key (Groq is free — [get a key here](https://console.groq.com))
5. Go to **Chat** and talk to your agency

That's it. No Docker. No database setup. No configuration files.

---

## Features

### Chat-First Interface

The primary interface is a conversation. You don't navigate menus or configure pipelines. You describe what you need, and AGEX figures out which of its 113 agents to deploy.

- Real-time streaming responses
- Conversation history persists across sessions
- Run workflows directly from chat
- Context-aware — remembers previous messages

### 8 Specialized Teams

| Team | Agents | What They Do |
|------|--------|-------------|
| **Marketing** | 60 | SEO, Social Media, Email, PPC, PR, Influencer, Events, Affiliate, Brand, Analytics, CRO, Community, Partnerships |
| **Sales** | 10 | Cold outreach, lead scoring, proposals, follow-ups, CRM, objection handling |
| **Intelligence** | 10 | Competitor monitoring, news, sentiment analysis, trend tracking |
| **Research** | 8 | Market sizing, competitor teardowns, customer research, tech scouting |
| **Strategy** | 7 | SWOT, positioning, pricing, go-to-market, market entry |
| **Content** | 10 | Blogs, social posts, newsletters, case studies, scripts, whitepapers |
| **Direction** | 4 | OKRs, roadmaps, quarterly planning, priorities |
| **Managing** | 4 | Project tracking, timelines, resource allocation |

### 9 Battle-Tested Workflows

| Workflow | Steps | What You Get |
|----------|-------|-------------|
| Content Month | 7 | Trend report, content calendar, 4 blog posts, 12 social posts |
| Product Launch | 11 | Market research, positioning, landing page, launch emails, PR brief |
| Competitor Report | 5 | Competitor profiles, SWOT analysis, strategic recommendations |
| Lead Generation | 6 | Lead magnets, email sequences, cold outreach scripts |
| Full Strategy | 10 | Market analysis, SWOT, positioning, go-to-market plan |
| Email Sequence | 5 | Welcome series, nurture emails, sales follow-ups |
| SEO Overhaul | 7 | SEO audit, keyword strategy, content briefs, meta tags |
| Social Media Blitz | 6 | Platform strategy, content calendar, 30 posts, hashtag sets |
| Brand Audit | 5 | Brand analysis, perception report, recommendations |

### Any LLM Provider

| Provider | Models | Notes |
|----------|--------|-------|
| **OpenAI** | GPT-4o, GPT-4o-mini, o3-mini | |
| **Anthropic** | Claude Sonnet, Haiku, Opus | |
| **Google** | Gemini 2.5 Pro, Flash | |
| **Groq** | Llama 3.3 70B, Mixtral, Gemma | Free tier available |
| **OpenRouter** | 200+ models | One key, all models |
| **Ollama** | Llama, Mistral, DeepSeek, Phi | Free, runs locally |

### Premium UI

- Pitch black theme with blinking stars
- Glassmorphism cards
- Animated page transitions (Framer Motion)
- Responsive sidebar with collapse
- Real-time streaming text in chat

---

## Architecture

```
┌─────────────────────────────────────────────┐
│                   AGEX                       │
├─────────────────────────────────────────────┤
│                                             │
│   User types a message in Chat              │
│           │                                 │
│           ▼                                 │
│   /api/chat (Next.js API Route)             │
│           │                                 │
│           ▼                                 │
│   Brain Builder                             │
│   ├── Reads 105 agent .md files             │
│   ├── Builds system prompt with:            │
│   │   ├── 8 team descriptions               │
│   │   ├── 113+ agent identities             │
│   │   └── 9 workflow definitions            │
│   └── Selects full/compact brain            │
│       based on model context window         │
│           │                                 │
│           ▼                                 │
│   LLM Router                                │
│   ├── OpenAI  (api.openai.com)              │
│   ├── Anthropic (api.anthropic.com)         │
│   ├── Google  (generativelanguage.google)   │
│   ├── Groq    (api.groq.com)               │
│   ├── OpenRouter (openrouter.ai)            │
│   └── Ollama  (localhost:11434)             │
│           │                                 │
│           ▼                                 │
│   Streaming response back to Chat UI        │
│                                             │
└─────────────────────────────────────────────┘
```

### How the Brain Works

AGEX doesn't use a framework like LangChain or CrewAI. The LLM itself IS the agency.

1. On every chat message, the server reads all 105 agent markdown files from the `content/` directory
2. It builds a system prompt that tells the LLM: "You are AGEX, an agency with 8 teams and 113 agents. Here are your teams and capabilities."
3. The LLM receives this brain + the user's message
4. The LLM determines which team/agents are relevant and executes the work directly
5. Response streams back to the browser in real-time

**Premium models** (GPT-4o, Claude Sonnet, Gemini Pro) get the full brain with agent identities and detailed instructions. **Free/small models** (Groq free tier, small Ollama models) get a compact brain that fits within token limits.

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React 19, TypeScript |
| Styling | Tailwind CSS v4, Framer Motion |
| Components | Radix UI, class-variance-authority |
| State | Zustand (persisted to localStorage) |
| Backend | Next.js API Routes |
| LLM | Direct API calls (no LangChain, no LiteLLM) |
| Monorepo | Turborepo, pnpm workspaces |
| Database | SQLite + Drizzle ORM (schema ready, not yet wired) |

---

## Project Structure

```
agex/
├── apps/
│   └── web/                    # Next.js 15 app
│       ├── app/
│       │   ├── page.tsx        # Landing page
│       │   ├── api/chat/       # LLM chat endpoint (streaming)
│       │   └── dashboard/
│       │       ├── chat/       # Chat interface (primary)
│       │       ├── agents/     # Agent team browser
│       │       ├── workflows/  # Workflow cards + detail
│       │       ├── clients/    # Client management
│       │       ├── vault/      # Markdown file browser
│       │       ├── outputs/    # Generated deliverables
│       │       ├── analytics/  # Cost & usage tracking
│       │       └── settings/   # LLM provider config
│       ├── src/
│       │   ├── components/     # UI, chat, layout, animations
│       │   ├── stores/         # Zustand stores (chat, sidebar)
│       │   └── lib/            # Utilities
│       └── package.json
│
├── packages/
│   ├── shared/                 # Types, parsers, constants
│   ├── db/                     # Drizzle ORM schema (14 tables)
│   └── vault-engine/           # Vault read/write/index
│
├── content/                    # The brain — 105 agent/workflow .md files
│   ├── agents/                 # 75 agent files across 8 teams
│   │   ├── marketing/          # 13 sub-team agents
│   │   ├── sales/              # 10 agents
│   │   ├── intelligence/       # 10 agents
│   │   ├── research/           # 8 agents
│   │   ├── strategy/           # 7 agents
│   │   ├── content/            # 10 agents
│   │   ├── direction/          # 4 agents
│   │   └── managing/           # 4 agents
│   ├── workflows/              # 9 workflow definitions
│   ├── templates/              # 12 output templates
│   ├── tools/                  # 7 tool guides
│   ├── onboarding/             # Client interview flow
│   └── quality/                # QA checklist
│
├── vault/                      # Runtime vault (Obsidian-compatible)
├── output/                     # Generated deliverables
├── turbo.json
├── package.json
└── pnpm-workspace.yaml
```

---

## Pages

| Page | URL | Description |
|------|-----|-------------|
| Landing | `/` | AGEX branding, "Start talking" CTA |
| **Chat** | `/dashboard/chat` | **Primary interface** — talk to your agency |
| Dashboard | `/dashboard` | Overview stats, quick actions, recent activity |
| Agents | `/dashboard/agents` | Browse 8 teams, see all agents |
| Agent Team | `/dashboard/agents/[team]` | Individual agents with "Chat" buttons |
| Workflows | `/dashboard/workflows` | 9 workflow cards with step counts |
| Workflow Detail | `/dashboard/workflows/[slug]` | Step breakdown, "Run in Chat" button |
| Clients | `/dashboard/clients` | Client list, onboard via chat |
| Vault | `/dashboard/vault` | Obsidian-compatible file browser |
| Outputs | `/dashboard/outputs` | All generated deliverables |
| Analytics | `/dashboard/analytics` | Cost tracking, usage metrics |
| Settings | `/dashboard/settings` | API keys, model selection |

---

## Simulation Results

AGEX was tested with 3 simulations and 13 individual tests before release.

### Simulation 1: B2B SaaS Product Launch (CloudShield)

| Task | Team Used | Result |
|------|-----------|--------|
| Strategic positioning vs Wiz/Orca/Lacework | Strategy | PASS — 4 sections, competitor-specific differentiators |
| 3-email cold outreach sequence for CISOs | Sales | PASS — all under word limits, subject lines included |
| Landing page copy with hero/features/social proof | Content | PASS — markdown formatted, mentions real compliance standards |

### Simulation 2: D2C Fashion Brand (VelvetThread)

| Task | Team Used | Result |
|------|-----------|--------|
| Competitor analysis of Everlane/Reformation/Patagonia | Intelligence | PASS — 5 specific messaging gaps identified |
| 400-word editorial blog in Kinfolk tone | Content | PASS — zero exclamation marks, sensory details, quiet tone |
| 4-week LinkedIn content calendar (12 posts) | Content | PASS — narrative arc across weeks, all fields present |

### Simulation 3: Stress Test

| Test | Result |
|------|--------|
| Empty message | PASS — graceful response asking for context |
| No API key | PASS — clear error: "Go to Settings to add one" |
| Invalid provider | PASS — "Unknown provider" error |
| Wrong API key | PASS — "Invalid API Key" from provider |
| Missing model | PASS — "Provider and model required" |
| 3 concurrent requests | PASS — handled correctly |
| All 10 pages after stress | PASS — 10/10 return 200 |

---

## Supported LLM Providers

### Groq (Free)

The easiest way to start. Groq offers free API access with fast inference.

1. Go to [console.groq.com](https://console.groq.com)
2. Create an account and copy your API key
3. In AGEX Settings, select **Groq** and paste the key
4. Model: `llama-3.3-70b-versatile`

### OpenAI

1. Go to [platform.openai.com](https://platform.openai.com)
2. Create an API key
3. In AGEX Settings, select **OpenAI** and paste the key
4. Model: `gpt-4o` (recommended)

### Anthropic

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create an API key
3. In AGEX Settings, select **Anthropic** and paste the key
4. Model: `claude-sonnet-4-20250514` (recommended)

### Google

1. Go to [aistudio.google.com](https://aistudio.google.com)
2. Get an API key
3. In AGEX Settings, select **Google** and paste the key
4. Model: `gemini-2.5-flash` (recommended)

### OpenRouter

1. Go to [openrouter.ai](https://openrouter.ai)
2. Create an account and get an API key
3. In AGEX Settings, select **OpenRouter** and paste the key
4. Access 200+ models through one key

### Ollama (Local, Free)

1. Install [Ollama](https://ollama.com)
2. Run `ollama pull llama3.1`
3. In AGEX Settings, select **Ollama**
4. No API key needed — runs on your machine

---

## Security

AGEX handles your LLM API keys. Here's how we protect them:

- **API keys are stored in your browser's localStorage** — never sent to any server except the LLM provider
- **The `/api/chat` route runs on YOUR machine** — keys are only used server-side in your Next.js instance
- **No telemetry, no analytics, no external calls** — AGEX only talks to the LLM provider you configure
- **Vault files stay on your filesystem** — nothing leaves your machine

For production deployment, see the [Security section](docs/security.md) of the documentation.

---

## Development

### Prerequisites

```bash
node --version  # Must be 20+
pnpm --version  # Must be 9+
```

### Setup

```bash
git clone https://github.com/z1fex/agex.git
cd agex
pnpm install
```

### Development Server

```bash
cd apps/web
npx next dev -p 3000
```

### Build

```bash
pnpm build
```

### Project Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Production build |
| `pnpm lint` | Run linting |
| `pnpm clean` | Clean build artifacts |

---

## Roadmap

### v1.0 (Current)

- [x] Chat-first interface with streaming
- [x] 113 agents across 8 teams
- [x] 9 pre-built workflows
- [x] 6 LLM providers (OpenAI, Anthropic, Google, Groq, OpenRouter, Ollama)
- [x] Full/compact brain for premium/free models
- [x] Dashboard, agents, workflows, vault, analytics pages
- [x] Pitch black theme with blinking stars
- [x] Chat history persistence

### v1.1 (Planned)

- [ ] Client onboarding wizard (interactive form)
- [ ] Output saving to vault after chat responses
- [ ] Cost tracking per conversation
- [ ] Export outputs as PDF/DOCX
- [ ] Agent performance metrics

### v2.0 (Future)

- [ ] CLI version (`npx agex`)
- [ ] Docker deployment
- [ ] Web search integration (Tavily/SearXNG)
- [ ] Workflow builder (drag-and-drop)
- [ ] Multi-user with auth
- [ ] Scheduled recurring tasks
- [ ] 3D visualizations (React Three Fiber)

---

## Contributing

Contributions are welcome. Here's how:

1. Fork the repository
2. Create your branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Ideas for Contributions

- New agent prompt files in `content/agents/`
- New workflow definitions in `content/workflows/`
- Additional LLM provider support
- UI improvements and themes
- Documentation

---

## FAQ

**Q: Is this free?**
A: AGEX is free and open source (MIT license). You pay for LLM API usage based on your provider. Groq and Ollama offer free tiers.

**Q: Do I need Docker?**
A: No. Just Node.js and pnpm. Run `pnpm install` and start the dev server.

**Q: How is this different from ChatGPT/Claude?**
A: ChatGPT is a general assistant. AGEX is a specialized agency with 113 pre-built agent identities trained for marketing, sales, content, research, and strategy work. It knows which team to deploy for which task.

**Q: Can I add my own agents?**
A: Yes. Create a new `.md` file in `content/agents/[team]/` following the existing format. AGEX will automatically include it in the brain.

**Q: Can I use this commercially?**
A: Yes. MIT license. Use it however you want.

**Q: Does my data leave my machine?**
A: Only your chat messages go to the LLM provider you choose. Everything else (vault files, settings, history) stays on your machine.

---

## License

MIT License. See [LICENSE](LICENSE) for details.

---

<p align="center">
  <strong>AGEX</strong> &mdash; Stop managing agents. Start talking to your agency.
</p>
