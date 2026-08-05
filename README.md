# 🕸️ ARACHNID — The Web Guardian

> A cinematic, AI-powered, Spider-inspired interactive web experience. **Apple-grade design, AAA-game energy, zero copyrighted assets.**

![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square) ![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?style=flat-square) ![Vite](https://img.shields.io/badge/Vite-5-646cff?style=flat-square) ![Three.js](https://img.shields.io/badge/Three.js-0.169-000000?style=flat-square) ![Tailwind](https://img.shields.io/badge/Tailwind-3-06b6d4?style=flat-square) ![License](https://img.shields.io/badge/License-MIT-ff3b3b?style=flat-square)

**ARACHNID** is a flagship portfolio project: a fully original, arachnid-inspired universe presented as an interactive movie. A living 3D city with dynamic weather, a five-chapter scroll story, ten AI modules, gamification, hidden secrets and live GitHub statistics — all in one production-quality React codebase.

> **IP-safe by design.** Every character, universe and story here is original. No Marvel names, designs or plots. The aesthetic is *inspired by* the Spider-Verse; the content is 100% ours — publish and promote it freely.

---

## 📸 Screenshots

> Coming soon — replace these placeholders with real captures.

| Cinematic hero | Scroll storytelling | AI Lab |
| --- | --- | --- |
| ![Hero](https://placehold.co/640x360/050508/dc143c?text=ARACHNID+Hero) | ![Story](https://placehold.co/640x360/050508/2f6bff?text=Scroll+Story) | ![Lab](https://placehold.co/640x360/050508/7b2ff7?text=AI+Lab) |

| Multiverse map | Gamification | GitHub stats |
| --- | --- | --- |
| ![World](https://placehold.co/640x360/050508/ffb020?text=Multiverse+Map) | ![Progression](https://placehold.co/640x360/050508/ff3b3b?text=Achievements) | ![GitHub](https://placehold.co/640x360/050508/2f6bff?text=GitHub+Stats) |

---

## ✨ Features

| Area | What you get |
| --- | --- |
| 🏙️ **Cinematic 3D Hero** | Instanced city with procedural twinkling windows, GPU rain, lightning bolts, fog banks, clouds, drones, cars, birds, a moving train, floating energy particles and a stylized Guardian figure — all under a **time-of-day cycle** (auto-follows your clock) with mouse-parallax camera. WebGL-less 2D fallback included. |
| 📖 **Scroll Storytelling** | Five chapters (*The Call → Power → Responsibility → Technology → Future*), each with its own lighting, particle behavior and scrubbed progress rail. |
| 🤖 **Layered AI Engine** | Two modes. **Demo Mode** answers from a local Lore Engine with TF-IDF vector retrieval, citations and simulated streaming. **AI Mode** (add one key to `.env`) upgrades to real OpenAI / Anthropic / Gemini streaming with RAG context. |
| 🧪 **AI Lab** | Assistant chat · Story Forge · Suit Forge (live SVG preview) · Cover Forge (PNG export) · Battle Simulator (Monte Carlo + probability graph) · Mission generator · Trivia engine · Voice assistant (Web Speech API). |
| 🌌 **Interactive World** | Saga timeline explorer · zoomable multiverse map · force-directed relationship graph · XP-powered skill tree. |
| 🎮 **Gamification** | XP & levels, 22 achievements, rotating daily missions, suit/cover collections, toasts and sounds. |
| 🕹️ **Secrets** | Konami code (8-bit mode) · `arachnid.help()` console commands · hidden portal in the footer · dev mode (`D`) · voice commands · spider-sense mode (`X`) with heartbeat audio and screen shake. |
| 🔊 **Procedural Audio** | Rain, wind, city hum, generative soundtrack and every SFX synthesized with the Web Audio API — zero audio files. |
| 📊 **Live GitHub Stats** | Stars/forks/issues, 52-week contribution heatmap and recent commits from the GitHub API with caching + offline fallback. |
| ♿ **Accessibility & Performance** | 60–120 FPS, `prefers-reduced-motion` support, keyboard shortcuts, lazy-loading, code-splitting, DPR clamping, WCAG-minded contrast and focus states. |

---

## 🛠️ Tech stack

| Layer | Technology |
| --- | --- |
| Framework | React 18 · TypeScript (strict) |
| Build | Vite 5 · manual chunking |
| 3D | Three.js · React Three Fiber |
| Motion | Framer Motion · GSAP · Lenis smooth scroll |
| Styling | Tailwind CSS 3 · custom design system |
| State | Zustand (persisted) |
| AI | Provider abstraction (OpenAI / Anthropic / Gemini) + in-browser TF-IDF RAG |
| Audio | Web Audio API (fully procedural, zero assets) |
| PWA | Web manifest · service worker |

---

## 🚀 Installation

Requirements: **Node.js ≥ 18** and npm.

```bash
# 1. Clone
git clone https://github.com/CodesbyRohit/spiderman1.git
cd spiderman1

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev            # http://localhost:5173
```

That's it — the app runs in **Demo Mode** with no API keys required.

---

## 🧑‍💻 Development

```bash
npm run dev          # start Vite dev server with HMR
npm run typecheck    # strict TypeScript check (tsc -b)
npm run build        # typecheck + production bundle
npm run preview      # preview the production build locally
npm run lint         # alias for typecheck (project uses tsc as linter)
```

**Conventions**

- Strict TypeScript everywhere; `npm run typecheck` must pass before committing.
- Feature modules live in `src/components/<area>/` and are lazy-loaded.
- Scene world objects share one `update(dt, t, tod)` interface — see `src/components/hero/builders.ts`.
- All user-facing text keeps the original-IP universe (no Marvel references).

---

## 🔑 Environment variables

Copy `.env.example` to `.env` and uncomment what you need:

```bash
cp .env.example .env
```

| Variable | Default | Purpose |
| --- | --- | --- |
| `VITE_AI_PROVIDER` | `auto` | `auto` \| `openai` \| `anthropic` \| `gemini` — which provider to prefer |
| `VITE_AI_MODEL` | *(provider default)* | Optional model override, e.g. `gpt-4o` |
| `VITE_OPENAI_API_KEY` | — | Enables OpenAI streaming in AI Mode |
| `VITE_OPENAI_MODEL` | `gpt-4o` | OpenAI model name |
| `VITE_ANTHROPIC_API_KEY` | — | Enables Anthropic Claude in AI Mode |
| `VITE_ANTHROPIC_MODEL` | `claude-sonnet-4-20250514` | Claude model name |
| `VITE_GEMINI_API_KEY` | — | Enables Google Gemini in AI Mode |
| `VITE_GEMINI_MODEL` | `gemini-2.0-flash` | Gemini model name |
| `VITE_GITHUB_TOKEN` | — | GitHub API token (60 → 5000 requests/hr) |
| `VITE_GITHUB_REPO` | `CodesbyRohit/spiderman1` | Repo shown in the stats section |
| `VITE_ENABLE_VOICE` | `true` | Web Speech API assistant toggle |
| `VITE_ENABLE_SOUND_DEFAULT` | `true` | Start ambient sound after the first user gesture |

> ⚠️ **Security note.** `VITE_*` keys ship to the client bundle. For a public deployment, prefer a small proxy/backend that holds the key and forwards requests. Demo Mode works without any keys.

---

## 🧠 AI architecture

The intelligence layer is intentionally **layered and swappable**:

```
┌───────────────────────────── UI modules (chat, forges, battles…) ─┐
│                                │                                   │
│                    ┌───────────▼────────────┐                      │
│                    │  engine.ts (facade)     │                     │
│                    └───┬───────────────┬────┘                      │
│          ┌─────────────▼───┐    ┌──────▼────────────┐              │
│          │  AI Mode         │    │  Demo Mode         │             │
│          │  providers.ts    │    │  generator.ts      │             │
│          │  OpenAI/Anthropic│    │  curated answers + │             │
│          │  Gemini + stream │    │  simulated stream  │             │
│          └─────────┬────────┘    └─────────┬──────────┘             │
│                    │                       │                        │
│          ┌─────────▼───────────────────────▼──────────┐            │
│          │  Knowledge layer: lore.ts + vectorStore.ts │            │
│          │  (TF-IDF RAG, citations, semantic retrieval)│           │
│          └─────────────────────────────────────────────┘            │
│          Memory layer: memory.ts (profile, session, history)        │
└──────────────────────────────────────────────────────────────────────┘
```

- **Provider abstraction** — `providers.ts` exposes one typed `stream()` interface; switching models is a `.env` change, not a code change.
- **RAG in the browser** — a dependency-free TF-IDF vector store retrieves lore with cosine similarity; results are injected into LLM prompts as cited context, or answered directly in Demo Mode.
- **Memory layer** — long-term profile, session history and achievement data personalize recommendations.
- **Graceful degradation** — no keys? The local Lore Engine answers. API down? Streaming aborts cleanly. Everything typed, streaming, and cancellable.

---

## 🗂️ Folder structure

```
├── public/            # manifest, service worker, favicon
├── src/
│   ├── lib/
│   │   ├── ai/        # providers, knowledge base + RAG, memory, demo generator, streaming, engine facade
│   │   ├── audio/     # procedural Web Audio engine (rain/wind/hum/pad/SFX/heartbeat)
│   │   ├── gamification/  # achievements catalogue, XP store, daily missions, collections
│   │   ├── github/    # GitHub API client with caching + offline fallback
│   │   ├── hooks/     # lenis, media queries, mouse, reduced motion, storage
│   │   └── state/     # zustand stores (app settings, game progression)
│   ├── components/
│   │   ├── hero/      # R3F scene builders (city/weather/particles/guardian/life), fallback
│   │   ├── chapters/  # 5-chapter scroll storytelling
│   │   ├── world/     # timeline, multiverse map, relationship graph, skill tree
│   │   ├── ai/        # the eight Lab modules
│   │   ├── lab/       # tabbed Lab shell
│   │   ├── fx/        # cursor, grain, web-shoot, spider-sense, portal transitions
│   │   ├── ui/        # magnetic/liquid/glass buttons, panels, HUD, toasts, settings
│   │   └── gamification/  # profile hub (progress/achievements/missions/collection)
│   ├── secrets/       # Konami, console commands, dev overlay
│   └── styles/        # design system: glassmorphism 2.0, sky palettes, FX
├── index.html         # branded boot splash + fonts
├── vite.config.ts     # manual chunking for the 3D + motion deps
└── tailwind.config.js # design tokens
```

**Design decisions worth stealing**

- The 3D scene is built with **raw three.js scene builders** (imperative groups + `useFrame` drivers) rather than JSX soup — fast, portable, and the whole world updates through one `update(dt, t, tod)` interface.
- A **flash bus** object coordinates lightning between the weather layer and the lights.
- RAG works in the browser with a **dependency-free TF-IDF vector store** — no vector DB needed for the demo.
- Every overlay transition is a **portal flash**; every click fires a **web-shoot burst**; everything respects reduced motion.

---

## ⚡ Performance optimizations

| Technique | Where |
| --- | --- |
| Code-splitting + manual chunks | Three.js (176 kB gz), R3F, motion & GSAP isolated into lazy chunks |
| Lazy loading | Hero scene and every Lab module load on demand |
| GPU-friendly rendering | Instanced meshes, shared ShaderMaterial, additive point clouds |
| DPR clamping | `dpr` caps on mobile + quality setting |
| Frame gating | R3F `frameloop` pauses when the hero scrolls out of view |
| `prefers-reduced-motion` | Disables camera parallax, particles and heavy animations |
| Texture budget | All textures are small procedural canvas textures |
| Memory hygiene | Scene-graph `dispose()` on unmount / quality swap |
| Bundle targets | `es2020`, sourcemaps off in production |

---

## ⌨️ Keyboard shortcuts

| Key | Action |
| --- | --- |
| `X` | Spider-Sense danger mode |
| `M` | Toggle ambient sound |
| `T` | Cycle time of day |
| `L` | Open the AI Lab |
| `S` | Settings |
| `D` | Developer mode |
| `1–5` | Jump to story chapter |
| `Esc` | Close overlays |
| `↑↑↓↓←→←→BA` | 8-bit retro mode |

---

## 🗺️ Roadmap

- [ ] Real capture screenshots + a GIF showcase in the README
- [ ] Server-side AI proxy (Next.js/Express) so keys never ship to the client
- [ ] WebGPU particle system & post-processing pipeline (bloom, DOF)
- [ ] Multiplayer "hangout" mode on the city map
- [ ] More chapters, characters and universes in the lore corpus
- [ ] i18n (EN / ES / PT / HI)
- [ ] PWA offline-first polish + install prompt
- [ ] Unit tests (Vitest) for the AI, audio and gamification layers

---

## 🤝 Contributing

Contributions are welcome! See [CONTRIBUTING.md](./CONTRIBUTING.md) for the setup, conventions and pull-request process. Changes are tracked in [CHANGELOG.md](./CHANGELOG.md).

---

## 📄 License

MIT — see [LICENSE](./LICENSE). Free to use, modify and share with attribution.

---

## 🙏 Credits

Original IP and code created for this project. Arachnid-inspired aesthetics only — no affiliation with or endorsement by any existing franchise.

Built with React 18 · TypeScript · Vite · Three.js · React Three Fiber · GSAP · Framer Motion · Lenis · TailwindCSS · Zustand.
