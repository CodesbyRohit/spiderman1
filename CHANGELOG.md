# Changelog

All notable changes to **ARACHNID — The Web Guardian** are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] — 2026-08-05

### Added

- **Cinematic 3D hero** — instanced city with procedural windows, GPU rain,
  lightning bolts, fog banks, clouds, drones, cars, trains, birds, floating
  particles and a stylized Guardian figure; time-of-day cycle (auto-follows
  the visitor's clock), mouse-parallax camera, WebGL-less 2D fallback.
- **Scroll storytelling** — five chapters (*The Call → Power → Responsibility →
  Technology → Future*), each with its own lighting, particle system and
  progress rail.
- **Layered AI engine** — Demo Mode (local Lore Engine, TF-IDF vector RAG,
  citations, simulated streaming) and AI Mode (OpenAI / Anthropic / Gemini
  streaming with provider abstraction and memory layer).
- **AI Lab** — LUMEN assistant chat, Story Forge, Suit Forge with live SVG
  preview, Cover Forge with PNG export, Battle Simulator with probability
  graph, Mission generator, Trivia engine, Voice assistant (Web Speech API).
- **Interactive world** — saga timeline explorer, zoomable multiverse map,
  force-directed relationship graph, XP-powered skill tree.
- **Gamification** — XP & levels, 22 achievements, daily missions,
  suit/cover collections, toast notifications, procedural sounds.
- **Secrets & Easter eggs** — Konami code (8-bit mode), `arachnid.help()`
  console commands, hidden portal, dev mode, voice commands, spider-sense
  mode with heartbeat audio and screen shake.
- **Procedural audio engine** — rain, wind, city hum, generative pad and all
  SFX synthesized with the Web Audio API; zero audio assets.
- **GitHub integration** — stars/forks/issues, 52-week contribution heatmap,
  recent commits, caching and offline fallback.
- **PWA** — web manifest and service worker for installability/offline shell.
- **Performance** — code-splitting with manual chunks, lazy loading of the 3D
  scene and Lab modules, DPR clamping, frame gating, `prefers-reduced-motion`
  support, GPU resource disposal.
- **Docs** — README, CONTRIBUTING, MIT LICENSE, `.env.example`.

### Notes

- Original-IP universe throughout: no Marvel names, designs or plots.
- Demo Mode requires no API keys; AI Mode activates automatically when keys
  are present in `.env`.
