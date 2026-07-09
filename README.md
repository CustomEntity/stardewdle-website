# stardewdle-website

Daily Stardew Valley guessing game — guess the villager from clues.

**Modes:** Classic (attribute grid) · Pixel (pixelated portrait) · Emoji (emoji clues). EN + FR.

## Stack
SvelteKit 2 + Svelte 5 (runes) · Tailwind v4 · PostgreSQL (`pg`).

## Dev
```bash
pnpm install
pnpm dev
```
Set `DATABASE_URL` and `PUBLIC_MEDIA_URL` in `.env` (not committed).

## Data pipeline (`scripts/`)
- `datamine/` — extract Stardew Valley 1.6 content from the game (XNB → JSON/PNG): villagers, portraits, emojis, and the full game-asset image dump for art direction.
- `db/` — `schema.sql` + `seed-villagers.mjs` (idempotent: villagers, translations, emojis, 60 days of daily puzzles).

Not affiliated with ConcernedApe / Stardew Valley. Fan project.
