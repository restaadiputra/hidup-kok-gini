# Hidup Kok Gini?

An original Indonesian comedy board game for **2–4 local hot-seat players**. Built with React, TypeScript, and Vite. No accounts, backend, paid services, or network requests during gameplay. Fonts and original SVG artwork are bundled locally.

## Run locally

Use **Node.js 22.18+** (Node 24 recommended) and npm.

```sh
npm install
npm run dev
```

Open the URL printed by Vite (normally http://127.0.0.1:5173). Everyone plays on the same device. To test from a phone on your local network, run `npm run dev -- --host 0.0.0.0` and use the computer's LAN IP. Only expose the development server to a trusted network.

```sh
npm run typecheck   # Strict TypeScript checking, including the tests
npm test            # Vitest, run once in a Node environment
npm run build       # Typecheck and create the production build in dist/
npm run preview     # Serve the production build locally
```

The runtime dependencies are only `react` and `react-dom`. Development dependencies are TypeScript, Vite, its React plugin, Vitest, and type definitions. `package-lock.json` pins the installed tree; use `npm ci` for reproducible installs.

## Appearance

The interface is built as a board game spread out on a table: every tile, card, button, and pawn is a saturated printed piece with a near-black outline and a hard bottom edge, and loose dice, card fans, meeples, and coins are scattered in the empty table space around the board.

Use the sun/moon button in the header to switch between light and dark mode. Light is the game on a sunny cream table; dark is the same game under one lamp. The category tokens keep the same hues in both themes — printed pieces do not change color when the lights go down. The first visit follows the device's color preference; choosing a mode saves an override under `hidup-kok-gini:theme`, independently of game progress. The preference survives refresh and new games. If storage is blocked, the toggle still works for the current session. The theme is applied before the app renders to prevent a flash of the wrong background. Both themes use locally bundled Roboto, with Roboto Mono reserved for counters and tile numbers.

## How to play

The interface fills the screen with no page scrolling or visible scrollbars. On phones, turn controls sit below the board and decisions open in a bottom panel. Close that panel with **Lihat papan** to inspect the board, then reopen it to continue. **Skuad** opens all four stats for every player; **Riwayat** opens the game log. Long panels and dialogs support internal touch/keyboard scrolling when needed on small screens.

Large desktop screens use a wider board with larger tiles, labels, and pawns. Dice rolls, 300ms tile-to-tile pawn arcs, subtle board rotation toward the moving player, landing outlines, and card drops use lightweight CSS motion. Device reduced-motion preferences skip these animations. Refreshing during a move safely restores its pending event. See [design and wording research](docs/design-notes.md) for the original Gen Z copy and source notes.

1. Pick 2, 3, or 4 players and edit their names (up to 20 characters). Empty names receive defaults.
2. Everyone starts at **GAJIAN** with **Rp2,500,000**, **Kewarasan 60**, **Relasi 40**, and **Hoki 50**.
3. Each player gets **one turn per month**. Roll a six-sided die, move clockwise, and draw an event matching the landing tile. GAJIAN and Plot twist draw from all categories.
4. Pick one of 2–3 responses. Each choice amount is rolled once when its card appears, within 60–140% of its base magnitude (Rp5,000 steps for money, whole points otherwise). Affected stats and effect signs stay unchanged. The UI previews those fixed rolled effects; the result shows actual changes after clamping. Refreshing preserves the previews. Pass the device to the next player.
5. Each time a pawn **passes or lands on GAJIAN after moving around the board**, it stops at GAJIAN and opens a congratulatory paycheck popover. Salary varies from **Rp2,800,000–Rp3,200,000**, and living costs from **Rp1,600,000–Rp2,000,000**, both in Rp50,000 steps. A random bill adds **Rp50,000–Rp750,000** in Rp25,000 steps. On **8% of paydays**, a rare mishap replaces that bill with **Rp1,750,000–Rp2,750,000** in Rp50,000 steps, making the net paycheck negative. The popover shows the full breakdown, a funny explanation, and the signed net change. Money is applied once; Continue (or closing the popover) resumes only the remaining steps before the destination card appears. Refresh keeps an unacknowledged paycheck open with identical amounts. The starting position pays nothing. Salary is tied to crossing this tile, not the month counter. A lap is not a month.
6. When everyone has played, advance to the next month. After every player resolves their December turn, view the final rankings and individual humorous endings. A complete game has **24, 36, or 48 turns**, depending on player count.

Kewarasan, Relasi, and Hoki stay between 0 and 100. Dompet can go below zero: negative money is debt, and nobody is eliminated. Hoki contributes to the final score; it does not bias the die.

```text
Score = floor(Dompet / 100,000) + Kewarasan + Relasi + Hoki
```

The highest score wins. Equal scores share the same rank, including shared first place. Negative balances reduce the score. Endings consider debt, exhaustion, relationships, wealth, luck, and composure.

## Project structure

```text
src/
  main.tsx                  Mounts the app and loads the global stylesheets in order
  app.tsx                   Lays out the panels and decides which dialog is open
  app.css                   Page frame and the board/sidebar grid
  storage-keys.ts           localStorage keys for the save, theme, and upgrade notice
  styles/
    tokens.css              Light/dark semantic colour tokens
    base.css                Fonts, element reset, and .sr-only
    keyframes.css           Dice, pawn, card, and dialog animations
    shared.css              Classes used by several components: buttons, notes, tile colours
  data/
    content/                All game content as JSON
      cards/                140 original cards, one file per category (kerja.json, ojol.json, …)
      categories.json       Category labels, icons, and tile colours, in deck order
      board.json            The 16-tile route
      calendar.json         Months and monthly flavour text
      economy.json          Salary, living-cost, and bill ranges
      payday-reasons.json   Everyday and rare payday bill jokes
      players.json          Starting stats, seat colours, and default names
      endings.json          Ending rules, first match wins
    parse/                  Validates each JSON file into typed data; bad data fails with its path
    categories.ts, events.ts, economy.ts, calendar.ts, players.ts, endings.ts
                            Import the JSON once, validate it, and export typed constants
    content.test.ts         Card coverage and the wording rules from docs/copy-guide.md
    content-fingerprint.test.ts
                            Golden hashes that guard saved-game compatibility
  game/
    types.ts                Shared domain types
    random.ts               Seeded PRNG and range rolls
    stats.ts                Stat limits, effect application, and rolled choice amounts
    deck.ts                 Shared-deck event draws
    payday.ts               Paycheck rolls
    log-messages.ts         Game-log lines
    create-game.ts          New-game setup
    reducer.ts              The turn state machine and roll preview
    scoring.ts              Score, rankings, shared ranks, and endings
    replay.ts               Versioned action-journal replay
    session.ts              Store actions and local-save loading
    format.ts               Indonesian currency and stat formatting
    *.test.ts               Stats, reducer, replay, scoring, and session tests
  hooks/
    use-game.ts             Game store, persistence, turn motion, bottom sheet, and focus
    use-setup-draft.ts      Player count and names before a game starts
    use-theme.ts            Persisted light/dark preference and system theme support
    use-turn-motion.ts      Cancellable dice/pawn presentation sequence
  components/<name>/        One folder per component: <name>.tsx beside its <name>.css
    board/                  Board ring, tiles, centre, neighbourhood art, and table bits
    event-panel/            The drawn card and its choices
    squad-dialog/           Every player's stats, one player card each
    …                       Header, timeline, dock, sheet, turn panels, dialogs, footer
public/
  fonts/                    Self-hosted fonts and their SIL Open Font Licenses
  favicon.svg               Original game mark
```

## Deterministic state and saves

The gameplay reducer has no time, storage, or random side effects. A new game gets one unsigned 32-bit seed from `crypto.getRandomValues`. The reducer owns a small seeded PRNG and consumes it for dice, card draws, choice amounts, and payday deductions. The same names, seed, and action sequence reproduce the same game.

Transitions are explicit:

```text
ready → ROLL → [payday → CONTINUE_PAYDAY] → event → CHOOSE → resolved → NEXT → ready
                                                  └→ finished (end of December)
```

Actions in the wrong phase and invalid choices are ignored. Rendering and animation never determine game outcomes. A shared deck avoids redrawing a card from a category until that category's pool is exhausted; the two wildcard tiles use the same draw history.

The browser saves a versioned **seed + names + action journal** under `hidup-kok-gini:v4` after each accepted action. Refresh replays and validates the journal, including mid-event and result states. Corrupt or incompatible saves show a notice and allow a new game. Version 1–3 journals cannot replay against the current deck, rules and payday phase; they are left untouched under their old keys, with a notice to start a new game. This upgrade notice appears once per save version, tracked independently under `hidup-kok-gini:seen-version`; Mengerti dismisses it, and refreshing or resetting does not bring it back. Save corruption and storage errors still show their own warnings. If storage is unavailable, gameplay continues with a visible warning. Reset requires an in-app confirmation and replaces the existing save.

One active game per browser origin. Use one tab while playing: simultaneous tabs are not synchronized. Clearing browser data deletes the save. The app has no service worker; launch/refresh requires the local or production server to be running.

If rules or card data change incompatibly, update the save version and key, or add a migration. Existing action journals must continue to refer to the same ordered card pools for identical replay.

## Add an event card

Each category's jokes live in their own JSON file under `src/data/content/cards/`. Add an entry to that file's `cards` list; no code or UI changes are required:

```json
{
  "id": "kerja-11",
  "title": "Judul yang kayak caption meme",
  "description": "Satu situasi yang relate, dengan satu detail yang spesifik.",
  "choices": [
    { "label": "Pilihan pertama", "effects": { "dompet": -50000, "relasi": 8 }, "result": "Akibatnya, punchline di akhir." },
    { "label": "Pilihan kedua", "effects": { "kewarasan": 6, "hoki": -3 }, "result": "Akibat pilihan kedua." }
  ]
}
```

**Read [docs/copy-guide.md](docs/copy-guide.md) before writing.** It sets the voice (`kamu`, `nggak`, `udah`, `aja`), the phrases that make a line sound machine-translated, the card anatomy, and what not to joke about. `npm test` enforces the mechanical rules and names the exact card and rule that fails. A typo in the JSON itself (an unknown stat, a missing field, a duplicate id) stops the app at load with the file and path of the problem.

Use a unique, stable ID and 2–3 choices. `dompet` amounts are actual rupiah; other stats are integer points. The order of `effects` keys matters, because each key consumes one random draw.

The deck is part of the save format. Before shipping new cards:

1. Bump the save version: `SAVE_KEY` in `src/storage-keys.ts` (moving the old key into `LEGACY_SAVE_KEYS`), `SAVE_VERSION` in `src/game/replay.ts`, and the `version` literal in `src/game/types.ts`.
2. Update the per-category count in `src/data/content.test.ts`.
3. Update the golden hashes in `src/data/content-fingerprint.test.ts`. They fail on purpose whenever content or rules change.

To introduce a new category, add it to `src/data/content/categories.json`, create its card file in `src/data/content/cards/`, and add it to `DECKS` in `src/data/events.ts` in the same position.

The 14 categories are kerja, keluarga, anak kos, kendaraan, nongkrong, e-commerce, tagihan, tanggal tua, kondangan, grup WhatsApp, ojol, internet, mudik, and drama kantor. Each currently has ten original cards. Payday has 16 regular and 8 rare original bill jokes.

## Validation

`npm test` runs 31 tests in 8 files, including **90 complete simulated games** (30 seeds each with 2, 3, and 4 players). Tests cover content parsing, card integrity and wording rules, golden fingerprints of the content and of seeded game outcomes, seeded dice, input and phase guards, salary on landing/passing START, debt and stat limits, deck exhaustion, immutable transitions, exactly 12 turns per player, scores, endings, replay, and corrupt-save rejection.

Browser checks cover setup, dice → event → choice → next player, monthly rollover, stat and pawn updates, refresh recovery, rules/reset dialogs, final results, and responsive desktop/mobile layouts.

## Originality and credits

The game copy, 140 events, outcome text, rule implementation, icons, board design, and neighborhood artwork were created for this project. No WNI Simulator cards, rules, names, text, or artwork are used.

Roboto and Roboto Mono are distributed under the **SIL Open Font License 1.1**. Each license notice is included beside its locally bundled variable font in `public/fonts/`. No other external artwork is used.

## Future multiplayer

The pure reducer and serializable action protocol can be moved behind an authoritative server later. That version should validate whose turn it is, generate randomness server-side, and broadcast accepted state changes. This implementation intentionally stays local and does not include networking or a backend.
