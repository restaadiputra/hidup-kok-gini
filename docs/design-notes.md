# Design and wording notes

The September 2026 redesign keeps **Hidup Kok Gini?**, locally bundled Roboto, and light/dark themes. Its visual direction is a pocket board game: ink outlines, lime controls, pastel tiles, paper stickers, and numbered character pawns.

## Indonesian pop-culture research

- [RRI, “Mengenal Maksud dari Istilah Aura Farming” (11 February 2026)](https://rri.co.id/serui/berita-lain/2175278/mengenal-maksud-dari-istilah-aura-farming): recent Indonesian coverage of projecting a cool or charismatic image. Adapted into original financial-life jokes such as “Aura boleh +999. Saldo jangan −999.”
- [Kompas Buku, “Apa Arti Nonchalant dalam Bahasa Gaul?” (2 February 2026)](https://buku.kompas.com/read/5688/apa-arti-nonchalant-dalam-bahasa-gaul): contemporary coverage of the calm, unbothered persona. Adapted into the original line “Nonchalant di luar. Kalkulator di dalam.”

- [Kompas Lifestyle, “100 Bahasa Gaul Gen Z Viral yang Sering Muncul di FYP dan Artinya” (23 April 2026)](https://lifestyle.kompas.com/read/2026/04/23/110500720/100-bahasa-gaul-gen-z-viral-yang-sering-muncul-di-fyp-dan-artinya): the current slang baseline (FYP, spill, delulu, salfok, healing, mager, bucin, receh). Used to keep each card to one term the whole table already knows.
- [ANTARA, “Arti Rojali dan Rohana”](https://www.antaranews.com/berita/4989441/arti-rojali-dan-rohana-istilah-yang-viral-jadi-sorotan-di-medsos) and [Kompas.id on the rojali/rohana phenomenon](https://www.kompas.id/artikel/fenomena-rojali-dan-rohana-potret-pelemahan-daya-beli-atau-strategi-ekonomi): *rombongan jarang beli* at the mall. Became the card “Rombongan jarang beli” and the payday joke about six hours of mall parking for one iced tea.
- [Wikipedia (id), “Sound horeg”](https://id.wikipedia.org/wiki/Sound_horeg): wardrobe-sized street sound systems. Became the anak kos card about the neighbouring village's celebration. The religious controversy around it is deliberately left out.
- [GoPay, “Tren QRIS Amplop Kondangan”](https://gopay.co.id/blog/tren-qris-amplop-kondangan) and [AyoBandung on digital wedding envelopes](https://www.ayobandung.com/netizen/pr-793925501/musim-kondangan-dan-fenomena-amplop-digital): scanning a code instead of dropping an envelope, sometimes with totals shown on screen. Became “Amplop pakai scan”.
- [Detik on the 2026 Jakarta concert ticket war](https://www.detik.com/pop/korean-wave/d-8499963/daftar-harga-tiket-konser-bts-jakarta-2026-benefit-jadwal-war) and [SeaBank on ticket *jastip* risks](https://www.seabank.co.id/blog/mau-war-tiket-konser-awas-jasa-titip-jastip-palsu-duit-lenyap-akun-diblokir): *war tiket*, queues in the tens of thousands, paying a *jastip*. Became “War tiket konser”.
- [Gramedia on quiet quitting among Gen Z](https://gramedia.id/news/articles/read/fenomena-quiet-quitting-di-kalangan-gen-z-apa-artinya): working strictly to the job description. Became “Sesuai job desc aja”, alongside the familiar “fresh graduate, five years' experience” job-ad joke.

- [Akurat, “15 Istilah Gaul yang Sedang Viral di TikTok 2026”](https://www.akurat.co/trend/873710/15-istilah-gaul-yang-sedang-viral-di-tiktok-2026-lengkap-dengan-arti-dan-contohnya): delulu, aura farming, NPC, touch grass, *cooked*, brainrot. Only *cooked* made it in, as the word a Gen Z coworker teaches the millennial player.
- [IDN Times, “Meme Nasib Generasi Sandwich”](https://www.idntimes.com/hype/humor/meme-nasib-generasi-sandwich-c1c2-01-6q5sq-8zr8q4): millennial humour is self-deprecating and about being squeezed between parents, siblings and a mortgage. Became the salary that vanishes one minute after payday, “Kapan beli rumah?”, and now being the one who hands out Lebaran envelopes.
- Millennial nostalgia beats written from common experience, not copied: warnet by the hour, rewinding a cassette with a pencil, a 2009 password in alternating caps, gel-stiff hair in a 2008 farewell photo, 2000s pop Melayu and sinetron soundtracks, a kick-start motorbike, knees that crack at a dance-trend warm-up.

Topics found but deliberately not used: #KaburAjaDulu (began as political frustration), and anything tied to religious rulings, gambling or online loans beyond mocking them.

These articles informed vocabulary, not copied jokes or card text. Familiar internet expressions such as POV, FYP, main character, and year-end wrapped support original Indonesian lines. Essential actions retain clear labels: Lempar dadu, Lanjut giliran, Lihat hasil akhir, Skuad, and Riwayat.

## Screen and motion behavior

- The application occupies the dynamic viewport (`100dvh`); the page never requires scrolling and no scrollbars are shown.
- The board scales to available width **and** height. Portrait phones use bottom controls; event/setup/results panels can close to reveal the board without losing the current decision.
- Long cards, large text, short landscape screens, and dialogs retain internal touch/wheel/keyboard scrolling as an accessibility fallback. Content is not discarded to meet a fixed height.
- Dice roll for 480 ms, then pawns hop across each tile for 210 ms per step. Cards rotate slightly and drop into place over 480 ms. Only transforms/opacity animate; no animation dependency or continuous idle animation is used.
- Reduced-motion preferences skip the movement sequence and CSS transitions. Roll results are committed and saved before the visual sequence, so refreshing mid-animation restores the pending event.
- Motion is presentation state; the seeded game engine, card deck, score formula, and saved games are unaffected by it.
