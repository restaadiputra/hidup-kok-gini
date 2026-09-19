# Hidup Kok Gini?

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

The primary audience is Indonesian Gen Z friend groups playing a casual social game together on one shared phone. The user explicitly confirmed this audience during initialization. Desktop play is also supported.

## Product Purpose

Make an original, playable Indonesian comedy board game about navigating everyday adult life. Players take turns, face relatable situations, choose tradeoffs, and compare their fortunes after twelve in-game months. Success means a group can start easily, understand whose turn it is, resolve each decision, and complete a game together.

## Operating Context

- Two to four players share one browser and pass the device between turns: local hot-seat multiplayer.
- The core workflow is setup names → roll a die → move the pawn → encounter a tile event → choose a response → apply stat changes → pass the turn.
- A twelve-month timeline tracks progress. The game ends with final scores and humorous personal endings.
- Phone use is the priority; the interface must also work on desktop and use the available screen size without visible scrollbars.
- The game is played from a public static site, `https://hidup-kok-gini.pages.dev`, or from a phone home-screen install of it. During development, same-network phone access serves the app from the development computer. Neither provides synchronized multiplayer between devices.

## Capabilities and Constraints

### User requirements

- React, TypeScript, and Vite, with minimal dependencies.
- No backend yet; local multiplayer comes first.
- Four player stats: **Dompet**, **Kewarasan**, **Relasi**, and **Hoki**.
- Board/timeline progression, turn-based dice movement, and reusable event cards with two or three choices affecting stats.
- Passing **GAJIAN** grants salary and deducts living costs.
- Twelve in-game months, final scoring, and humorous endings.
- At least forty original Indonesian event cards covering kerja, keluarga, anak kos, kendaraan, nongkrong, e-commerce, tagihan, tanggal tua, kondangan, grup WhatsApp, ojol, internet, mudik, and drama kantor.
- Separate game data from UI; keep state deterministic and clean, and make cards easy to add.
- Responsive, mobile-first interaction with light animation, including moving pawns and card reveals.
- Keep a working project, README, and verified main gameplay loop.

### Current implementation evidence

These describe the existing implementation, not additional product decisions approved during initialization:

- 168 event cards, twelve per category, live in one JSON file per category under `src/data/content/cards/`. Their wording follows `docs/copy-guide.md`, enforced by `src/data/content.test.ts`.
- Each player receives one turn per month; a game has 24, 36, or 48 turns. A board lap is separate from a month.
- Crossing or landing on GAJIAN after a lap pauses the pawn for a congratulatory paycheck popover. Salary is Rp2.8–3.2 million, living costs Rp1.6–2 million, and the extra bill Rp50,000–750,000. An 8% rare mishap replaces the extra bill with Rp1.75–2.75 million, creating a negative net paycheck. Continue resumes remaining steps. Amounts are seeded, saved, and applied exactly once. The initial starting position does not pay.
- Kewarasan, Relasi, and Hoki are bounded from 0 to 100. Dompet may be negative; debt does not eliminate a player.
- Score is `floor(Dompet / 100,000) + Kewarasan + Relasi + Hoki`. Equal scores share a rank.
- A seeded reducer and version 4 action journal support deterministic replay and browser-local saves. Choice magnitudes vary within 60–140% of their base values, keeping their original stats and signs; amounts are fixed when the card is drawn. Old version 1–3 journals remain untouched and trigger a new-game notice. Theme preferences are saved separately.
- Fonts and artwork are bundled locally. A build-generated service worker precaches every built file, so after one online visit the game reloads and plays offline. It is registered in production builds only, never by the dev server. An unknown URL shows a themed 404 page (`public/404.html`) when online.
- Long panels and dialogs retain internal scrolling when necessary, while the page fits the viewport and hides scrollbars.
- Reduced-motion preferences skip animations. Motion is presentation only; a roll is saved before its animation starts.

### Hosting

The user chose free static hosting on Cloudflare Pages, deployed from the GitHub repository's `master` branch at `https://hidup-kok-gini.pages.dev`. There is still no backend. Security and cache headers live in `public/_headers`. The canonical URL appears in `index.html`, `public/robots.txt`, and `public/sitemap.xml`; change all three together if a custom domain is ever adopted.

### Open decisions

Monetization, online multiplayer architecture, accounts, and an explicit age rating have not been decided. Do not invent commitments in these areas.

## Brand Commitments

- Preserve the title **Hidup Kok Gini?**; the user explicitly likes it.
- Use **Roboto**, as explicitly requested.
- Support both light and dark modes.
- Keep a fun board-game identity with Gen Z energy and original Indonesian comedy/satire rooted in everyday life.
- Use researched current Indonesian pop-culture language sparingly; essential game actions must remain understandable.
- All cards, rules, names, text, and artwork must be original. Do not copy WNI Simulator material.
- Credit the inspiration openly: the rules dialog links to WNI Simulator by Hecticholic and states that this game is not official and not affiliated. Keep that credit while the game is public.

These are existing user constraints, not a new visual direction chosen by initialization.

## Evidence on Hand

- `README.md`: running instructions, current rules, architecture, save behavior, and validation details.
- `src/data/content/cards/`: 168 original events and their choice/outcome text, one JSON file per category.
- `docs/copy-guide.md`: the wording rules for all game jokes (voice, spelling, anti-AI-slop patterns, card anatomy, off-limits topics, and the sense/slop/humour checks every card must pass).
- `src/data/content/`: board route, categories, months and monthly flavor text, salary and bill ranges, payday jokes, starting stats, and ending rules, all as JSON.
- `src/game/` and its `*.test.ts` files: deterministic game rules (dice, deck, payday, reducer, scoring, replay) and automated coverage.
- `src/components/board/neighborhood.tsx`, `src/components/icon/icon.tsx`, and `public/favicon.svg`: existing original code-based artwork.
- `public/fonts/`: locally bundled Roboto and its license notice.
- `public/`: the social preview `og-image.png`, home-screen icons and `manifest.webmanifest`, `404.html`, `robots.txt`, `sitemap.xml`, and `_headers`, all generated for the public deploy from the existing favicon and tokens.
- `docs/design-notes.md`: research sources and reasoning for the existing Indonesian slang and motion treatment.

The existing interface is implemented and playable. There are no supplied testimonials, user research studies, adoption metrics, or external endorsements; future work must not fabricate them.

## Product Principles

1. Make shared-device play effortless: keep the active player, next action, and decision effects clear.
2. Let original Indonesian humor enrich the game without obscuring rules or controls.
3. Prioritize phone play and the available viewport while keeping all content reachable.
4. Keep game outcomes deterministic and independent of animation; preserve saved progress through presentation changes.
5. Keep local play lightweight and self-contained until online capabilities are explicitly requested.
