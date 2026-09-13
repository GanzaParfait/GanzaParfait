<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Agent Instructions

Before making substantial changes to this repository, read:

1. `README.md`
2. `docs/PORTFOLIO_CONTEXT.md`
3. The relevant document under `docs/`

Do not copy the factual biography into this file. `docs/PORTFOLIO_CONTEXT.md` is the source of truth for who Prince Parfait GANZA is. This file tells agents how to work.

## Document Map

| File | Purpose |
|------|---------|
| `README.md` | Public repository explanation |
| `docs/PORTFOLIO_CONTEXT.md` | Biography, experience, projects, content rules |
| `docs/CONTENT_STRATEGY.md` | Voice, information architecture, page jobs |
| `docs/DESIGN_SYSTEM.md` | Visual rules, motion, components |
| `docs/SEO_STRATEGY.md` | Entity, metadata, structured data |
| `AGENTS.md` | How coding agents should work |
| `CLAUDE.md` | Claude-specific pointer only |

## Core Rules

- Never invent biographical or professional information.
- Never fabricate project results, clients, testimonials or statistics.
- Preserve the Prince Parfait GANZA brand identity.
- Prefer evidence and outcomes over marketing claims.
- Maintain mobile responsiveness, accessibility, SEO and performance.
- Reuse the existing design system and components.
- Never expose secrets or private information.
- Do not publish everything in `PORTFOLIO_CONTEXT.md` just because it exists there.
- Do not turn the public README into a personal database.
- Flag conflicting facts rather than silently choosing a value.

## Implementation Rules

- Read `docs/PORTFOLIO_CONTEXT.md` before content-heavy changes.
- Keep primary navigation focused: About, Work, Experience, Ventures, Contact. Services remains a secondary page. Insights belongs in the footer until verified articles exist.
- New SQL migrations go in `supabase/migrations/<YYYY-MM-DD_HHMMSS>/<name>.sql`. Do not add flat files beside that folder.
- Every public section must have meaningful, verified content.
- Homepage copy must answer who, what, where, proof, and action within about 10 seconds.
- Motion must be restrained and respect `prefers-reduced-motion`.
- Use consistent naming: **Prince Parfait GANZA**, **LERONY Ltd**, **Kigali, Rwanda**.
- Do not use "PPG" as a public brand abbreviation.
- Do not claim the ULK Computer Science degree is complete.
- Do not present LERONY Ltd as if this personal site were lerony.com.
- Stable structural copy may stay in `src/data/site-data.ts`. Do not move content to Supabase only because it can be dynamic.
