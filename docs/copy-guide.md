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

## 5. The three checks every card must pass

A card ships only when it passes all three. The first two can fail a line on their own. The third is why the card exists at all.

### A. It makes sense in Indonesian (*nyambung*)

1. **Read it aloud once, at talking speed.** If you have to reread a sentence to understand it, rewrite it. The player reads it once, out loud, to the table.
2. **Every sentence says who does what.** No pronoun puzzles. “Bapaknya nitip salam buat kamu. Ke kamu.” makes the reader stop and work out who is who; “Bilangin sepupumu, saya balik Jumat,” katanya sambil natap kamu.” doesn't.
3. **The result follows from the label.** Try saying “Kamu pilih *[label]*, terus *[result]*.” If that doesn't sound like one story, the result belongs to a different choice.
4. **The setup lives in the description.** A punchline can't rely on something the player was never told. If the joke is that the discount was fake, the description has to show the real price first.
5. **The money has a visible reason.** If a choice costs Dompet, the label or the result shows what was paid for. If it earns Relasi, somebody was helped. See §3.
6. **Build sentences the Indonesian way, not the English way.** Use short main clauses and plain verbs (`dapat`, `bikin`, `nyari`, `pakai`), and avoid stacked `yang` clauses. Written-register words such as `menjadi`, `sebagai`, `tersebut`, `bahwa`, `akan`, `telah`, `mampu`, `mencoba` or `terhadap` make narration sound like a translated essay **[tested]**. Speech inside “quotes” may use them, since an HR memo or a WhatsApp notice really does talk like that.

### B. It is not AI slop

1. **Write every card by hand.** Never generate cards by dropping a topic into a fixed sentence. A generator gives itself away twice: the same choice labels on many cards, and the title echoed back in the result. Both are **[tested]**: every choice label is unique across the deck, and a result may not repeat its card's title.
2. **No semicolons** **[tested]**. In this deck they only ever appeared in template sentences.
3. **No moral of the story** **[tested]**: no `pelajaran`, no `hikmah`. End on the joke, not on the lesson.
4. **Don't explain the joke.** If the last clause tells the reader why it was funny (“Prioritas jelas.”, “Ironis.”), cut it and see if the line still lands. It usually lands harder.
5. **No abstract nouns doing the work.** `kenyataan`, `harapan`, `takdir` and `kehidupan` feel deep and show nothing. Replace them with the object, the number or the person.
6. **Vary the shape** (see §2.4). If three cards in a row end in “X. Y.”, rewrite one as a quote or a number.

### C. It is funny, and sarcastic where it counts

Pick one technique per line. Two in one sentence usually cancel out.

| Technique | How it works | From the deck |
|---|---|---|
| **The exact number** | A precise, slightly absurd figure is funnier than an adjective. | “Admin ATM beda bank 6.500, parkirnya dua ribu. Ongkos buat bayar parkir: 8.500.” |
| **Deadpan sarcasm** | State the unfair thing calmly, as if it were normal. The reader supplies the outrage. | “Naik 150 ribu setelah tiga kali rapat. Kata HR, itu “angka yang kompetitif”.” |
| **Take the phrase literally** | Hold a corporate or marketing phrase to its own words. | “Kita di sini keluarga” → “Keluarga asli nggak pernah nyuruh kamu revisi jam sembilan malam.” |
| **The reversal** | The sensible choice goes wrong or the silly one works out, and the result flips the expectation in its last words. | “Tutup pancinya ternyata pas buat panci di kos. Penjualnya benar juga.” |
| **The callback** | A detail from the description comes back in the result. | “Pesan “P” dari Ibu” → “Besoknya Ibu kirim “P”, lalu “PING”, lalu telepon tiga kali.” |
| **The quote as punchline** | Let a character say the absurd line, then stop. | “Makasih udah datang ke acara kecil kami.” (800 guests) |
| **The list of three** | The first two items are normal and the third is off. | “Isinya receh, kancing, dan kertas bertuliskan “jangan dibuka”.” |
| **Escalation** | The fix creates a bigger version of the same problem. | “Postinganmu rame. Besoknya harga coretnya naik jadi 599 ribu.” |

**Who the sarcasm is aimed at.** Aim it at systems and the people who hold the power in a scene: the boss, HR, the bank, the promo small print, admin fees, the marketplace, the relative asking questions at Lebaran, and the player's own bad decisions. Never aim it at someone for being poor, their body, their religion, their region or their identity (§4).

**Millennial and Gen Z beats.** A millennial joke lands on a *shared memory* (warnet by the hour, a cassette rewound with a pencil, an SMS limit, a 2009 password in alternating caps) or on being the *sandwich generation* (salary gone a minute after payday, now the one handing out Lebaran envelopes). A Gen Z joke lands on the *gap between the two*, for example a thumbs-up emoji that reads as angry, or a voice note that is “for old people”. Use one reference per card, one the whole table recognises without an explanation.

**The screenshot test.** Would someone screenshot this result and send it to their group chat with “ini gue banget”? If not, sharpen the detail or cut a clause.

| Before (template, no joke) | After |
|---|---|
| Meeting yang bisa jadi email muncul di area kerja pas kamu lagi mencoba terlihat santai; grup chat langsung aktif. | Rapat satu jam buat bahas satu hal yang bisa beres lewat satu email. Kamera wajib nyala. |
| Kamu gas sekalian; meeting yang bisa jadi email menang, saldo yang mengalah. | Semua kenyang, rapatnya malah betah. Molor sampai sore. |
| Uangnya hilang, tokonya fiktif. Pelajaran mahal soal email aneh. | Uangnya hilang, tokonya fiktif. Yang asli cuma nomor invoice-nya. |

## 6. Adding a card

1. Open the category's file in `src/data/content/cards/` and add an entry to its `cards` list with a new, unique id (`kerja-13`).
2. Read it aloud and run it through the three checks in §5. Would a friend say it like that, and would they laugh?
3. Run `npm test`. The wording test names the exact card and rule it trips.
4. The deck is part of the save format. Before shipping new cards, bump the save version (`src/storage-keys.ts`, `src/game/replay.ts` and `src/game/types.ts`) so old saves get the "start a new game" notice instead of replaying into different cards, then update the golden hashes in `src/data/content-fingerprint.test.ts`. The README's "Add an event card" section has the full checklist.
