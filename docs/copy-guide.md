# Copy guide: how the cards should sound

Every card, payday note and monthly caption in **Hidup Kok Gini?** should read like a friend texting you about something that happened to them this week. If a line would sound odd said out loud in Bahasa Indonesia, it is wrong, however clever it looks in writing.

Cards live in one JSON file per category under [`src/data/content/cards/`](../src/data/content/cards). The rules marked **[tested]** are enforced by [`src/data/content.test.ts`](../src/data/content.test.ts), so `npm test` fails when a line breaks them. The rest need a human read.

## 1. Voice

- **Talk like a person, not a press release.** Use relaxed spoken Indonesian (*ragam santai*) that people across Indonesia understand, not heavy regional slang.
- **The player is always `kamu`.** Never `Anda` **[tested]**. Narration never uses `gue`/`lo`. People inside a quote may talk however they talk: “Bukan punyaku”, “Aman, Bos”.
- **One spelling per word** **[tested]**:

  | Write | Not |
  |---|---|
  | `nggak` | tidak, gak, ga, enggak |
  | `udah` | sudah |
  | `aja` | saja |
  | `bikin` | membuat |
  | `banget` | sangat |

  Other everyday forms are welcome where they sound natural: `gimana`, `kenapa`, `pengin`, `dikit`, `bareng`, `ngobrol`, `nyari`.

## 2. Things that make a line sound like AI

These patterns are the main reason earlier cards felt translated. Avoid them:

1. **Translated English.** “Ponsel *memilih* memperbarui sistem” is English grammar with Indonesian words. People say “HP tiba-tiba update”.
2. **Objects acting like people as the punchline.** “Kulkas bisa melanjutkan kariernya”, “Kalkulator menjadi moderator hubungan sosial”. One object doing something funny is fine. Making it the default joke is not.
3. **Stiff formal words in a casual joke.** “merdeka secara sirkulasi udara”, “kemajuannya 2%, keyakinannya 100%”, “mempertanyakan harga diri jaket”.
4. **The same punchline shape on every card.** A two-beat “X. Y.” antithesis is fine now and then. Mix it with a quote, a specific number, a callback, an understatement, or a plain reversal.
5. **Essay and filler words** **[tested]**: `namun`, `tentunya`, `sebuah`, `merupakan`, `adalah`, `hal ini`, `tidak hanya`, `bukan sekadar`, `di era`, `perjalanan hidup`, `momen`, `semesta`, `memutuskan untuk`, `memilih untuk`, `sang`, `sosok`, `menjadi saksi`, `melakukan`.
6. **Punctuation tells** **[tested]**: no em dash (`—`) and no `!!`. Use a full stop or comma.

| Before | After |
|---|---|
| Ponsel memilih memperbarui sistem saat kamu ingin membuka tiket. Kemajuannya 2%, keyakinannya 100%. | HP tiba-tiba update sistem pas kamu mau buka tiket. Progresnya 2 persen dari tadi. |
| Baju datang sesuai foto. Sayangnya fotonya mungkin diambil di dunia dengan penggaris berbeda. | Baju datang. Labelnya L, tapi cuma muat buat boneka. |
| Kalkulator menjadi moderator hubungan sosial. | Kamu buka kalkulator. Suasana langsung kayak ujian. |
| Keheningan kembali. Kulkas bisa melanjutkan kariernya. | Sunyi lagi. Kamu bisa tidur tanpa mimpi bunyi tit-tit. |
| Kamu merdeka secara sirkulasi udara. | Kamu bebas dari urusan AC selamanya. |

## 3. Card anatomy

| Part | Job | Limit **[tested]** |
|---|---|---|
| **Title** | Name the situation, like a meme caption. | ≤ 42 characters |
| **Description** | Set up one relatable situation with one concrete detail. End on the tension, not the joke. | 25–150 characters |
| **Choice label** | A short command the player could say out loud, starting with a verb. No full stop. | ≤ 40 characters |
| **Result** | Pay off *this* choice. Put the punchline last. Don't repeat the label. | ≤ 110 characters |

- **2–3 choices, and every one is a real temptation.** No obviously right answer, and no moral lesson.
- **The numbers must match the story.** Buying something costs Dompet. Being helpful earns Relasi. Enduring something costs Kewarasan. Luck and gambles move Hoki.
- **Every card costs something somewhere** **[tested]**: at least one negative effect on the card.
- **Effect sizes** **[tested]**: stat points 3–20, money in multiples of Rp5.000 of at least Rp20.000. This keeps the ±40% randomization meaningful.
- **No sentence may appear twice** anywhere in the deck **[tested]**.

## 4. Where the humour comes from

- **Specific beats clever.** 43 slides, 87 photos of the ceiling, the fourth forgotten wallet this month. A precise, true-to-life detail gets the laugh; wordplay rarely does.
- **Rooted in everyday Indonesian life**: kos, galon, token listrik, grup RT, kondangan, the family WhatsApp group, ojol, tanggal tua, THR, mudik, arisan.
- **Current pop culture, lightly**: at most one Gen Z term per card, and only terms the whole table knows without an explanation (`healing`, `FYP`, `spill`, `delulu`, `rojali`, `war tiket`). The research behind the current vocabulary is in [design-notes.md](design-notes.md).
- **Laugh with the player, not at a group.** Keep out politics, religion, ethnicity or region stereotypes, bodies, gender, disability, and poverty-shaming. Don't make gambling or online loans look attractive; jokes about them are only fine when the loan or gamble is the thing being laughed at.
- **No real brands, apps, public figures or copied jokes.** Write “aplikasi ojol”, “marketplace”, “mi instan”, “kaleng biskuit”. Every line must be original.

## 5. Adding a card

1. Open the category's file in `src/data/content/cards/` and add an entry to its `cards` list with a new, unique id (`kerja-11`).
2. Read it aloud. Would a friend say it like that?
3. Run `npm test`. The wording test names the exact card and rule it trips.
4. The deck is part of the save format. Before shipping new cards, bump the save version (`src/storage-keys.ts`, `src/game/replay.ts` and `src/game/types.ts`) so old saves get the "start a new game" notice instead of replaying into different cards, then update the golden hashes in `src/data/content-fingerprint.test.ts`. The README's "Add an event card" section has the full checklist.
