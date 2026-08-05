# Contributing to ARACHNID — The Web Guardian

Thanks for wanting to make this web a little bigger. 🕸️

## Getting started

1. **Fork** the repository and clone your fork.
2. Install dependencies: `npm install`
3. Run the dev server: `npm run dev`
4. Create a branch with a descriptive name: `git checkout -b feat/your-feature`

## Before you code

- **Original IP only.** This project deliberately contains no Marvel/Spider-Man
  names, characters, plots or designs. Keep it that way — new lore should fit
  the existing original universe (ARACHNID, Silkspire, the Weaver Syndicate).
- **Strict TypeScript.** The whole codebase compiles under `strict`. There is
  no separate linter config; `npm run typecheck` IS the lint gate.

## Development loop

```bash
npm run dev          # HMR dev server
npm run typecheck    # must pass before you commit
npm run build        # full production build (also runs typecheck)
```

## Commit convention

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new villain to the lore corpus
fix: dispose GPU resources on quality swap
perf: reduce rain particle count on low quality
docs: expand README roadmap
```

## Pull request process

1. Keep changes focused — one logical change per PR.
2. Run `npm run typecheck` and `npm run build` locally; both must pass.
3. Write a short PR description: what changed, why, and how to verify.
4. If you touch the 3D scene, note the FPS impact and any reduced-motion behavior.
5. A maintainer will review; address review comments and re-request review.

## Reporting bugs & ideas

Open an issue and include:

- What you expected vs what happened
- Browser/OS and steps to reproduce
- Console errors, if any
- For feature ideas: the problem you're solving, not just the solution

## Code of conduct

Be kind, constructive and generous with context. The web catches everyone. 🕷️
