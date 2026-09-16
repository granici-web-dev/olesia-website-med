# AGENTS.md — olesia-website-med

Rules that hold in every part of the repository. Rules specific to one app live next to
it: `apps/frontend/AGENTS.md`, `apps/api/CLAUDE.md`, `apps/back-office/CLAUDE.md`.
Claude Code loads those only when you work inside that app.

## §0 Read order

1. `CLAUDE.md` — the map.
2. `PLAN.md` — the current step.
3. The app's own rules file, when the task touches that app.
4. The file you are about to change, before changing it.

## §1 Binding rules

### R1 — Shape before code

For a new page, section, significant UI change or new API module: run `/rigorous shape`,
save the result as `docs/shape-<slug>.md`, get it approved, then `/rigorous craft`. The
shape says what the slice does, what it deliberately does not do, which files it touches
and how it is verified. One page. Carve-outs: typos, copy edits, dependency bumps,
formatter reflows, documentation.

### R2 — Origin is read-only

`apps/frontend/origin/` holds the reference prototypes. Never edit them; implement in
`apps/frontend/components/` and `apps/frontend/app/`.

### R3 — Three locales, everywhere a visitor reads

The site is `ro` (default), `en`, `ru`. Every user-facing string has all three branches;
nothing falls back for a missing one. API content is RO and EN required, `*Ru` nullable
with a RU → RO fallback that the client fills herself. Never invent a translation for her
content. Where each string lives on the site: `apps/frontend/AGENTS.md`.

### R4 — TypeScript strict

No `any`, no `@ts-ignore`. `as unknown as X` only where a value genuinely leaves the type
system, with a comment saying why; `PRINCIPLES.md` names each one.

### R5 — No premature abstractions

Rule of three: extract a helper or component at the third occurrence. Two similar blocks
beat an abstraction.

### R6 — Truthful content

Nothing a visitor reads is invented: no placeholder testimonials, statistics, articles or
prices. An empty state says so; it never renders a made-up value. Placeholders visible to
staff are derived from data, not toggled by a flag.

## §2 Commit discipline

`type(optional-scope): subject`. Types: `feat`, `fix`, `docs`, `chore`, `refactor`, `ci`,
`test`. The subject is a finished sentence about the outcome, lower case, no trailing
period, ≤ 72 characters. The body explains why; a commit that reverses a documented
decision names it. Branches `feat/<slug>`, `fix/<slug>`, `chore/<slug>`. No `--no-verify`.

```
feat(api): let people change their own password, and brake second-factor guessing
docs: close plan step 5b
```

## §3 Forbidden everywhere

- A user-facing string with fewer than three locale branches.
- `any`, `@ts-ignore`, default exports for components.
- Editing `apps/frontend/origin/`.
- `TODO` without a plan next to it.
- Committing anything under `screenshots/` or the files `next dev` generates
  (`apps/frontend/AGENTS.md` carries a generated block; keep it, do not remove it).
