import type { EventCard } from "../game/types";

// These are deliberately high-variance table moments. They are drawn from a
// separate pool so the normal category decks stay readable and replayable.
export const SUDDEN_EVENTS: EventCard[] = [
  {
    id: "sudden-nonton-bareng", category: "krisis", theme: "table-social", crisis: null,
    title: "Nonton bareng, patungan bareng",
    description: "Kamu ngajak semua orang nonton. Kursinya sudah dibeli, tinggal menentukan siapa yang bayar camilan.",
    requiresStatus: null,
    choices: [
      { label: "Aku traktir", effects: { dompet: -180_000, relasi: 8 }, result: "Kamu jadi sponsor resmi malam ini.", requires: {}, requiresStatus: null, blockedByStatus: null, gains: [], clears: [], tags: [], target: "self" },
      { label: "Patungan satu meja", effects: { dompet: -75_000, relasi: -3 }, result: "Semua transfer. Satu orang mengirim bukti transfer berupa stiker.", requires: {}, requiresStatus: null, blockedByStatus: null, gains: [], clears: [], tags: [], target: "all" },
      { label: "Batal ikut", effects: { relasi: -8 }, result: "Kursimu dipakai tas. Tas itu tidak membalas chat.", requires: {}, requiresStatus: null, blockedByStatus: null, gains: [], clears: [], tags: [], target: "self" },
    ],
  },
  {
    id: "sudden-rezeki-nyasar", category: "krisis", theme: "sudden-lucky", crisis: null,
    title: "Rezeki nyasar ke rekening",
    description: "Ada transfer masuk. Nominalnya cukup buat senyum, tapi pengirimnya cuma nulis: ‘makasih ya’.",
    requiresStatus: null,
    choices: [
      { label: "Tanya pengirimnya", effects: { dompet: 100_000, hoki: 4 }, result: "Ternyata bonus lama yang baru nyasar.", requires: {}, requiresStatus: null, blockedByStatus: null, gains: [], clears: [], tags: [], target: "self" },
      { label: "Anggap ini hadiah semesta", effects: { dompet: 450_000, hoki: -6 }, result: "Kamu bayar makan satu meja. Semesta ikut kenyang.", requires: {}, requiresStatus: null, blockedByStatus: null, gains: [], clears: [], tags: [], target: "self" },
    ],
  },
  {
    id: "sudden-anjlok", category: "krisis", theme: "sudden-bad", crisis: null,
    title: "Barang penting tumbang",
    description: "Laptop, motor, atau harga diri: salah satunya mendadak minta servis. Teknisi bilang, ‘wah ini lumayan’. ",
    requiresStatus: null,
    choices: [
      { label: "Bayar pakai tabungan", effects: { dompet: -500_000, kewarasan: -4 }, result: "Tabungan menipis, tapi hidup bisa lanjut.", requires: {}, requiresStatus: null, blockedByStatus: null, gains: [], clears: [], tags: [], target: "self" },
      { label: "Tunda dulu", effects: { kewarasan: -9, hoki: -5 }, result: "Bunyinya makin keras. Kamu pura-pura nggak dengar.", requires: {}, requiresStatus: null, blockedByStatus: null, gains: [], clears: [], tags: [], target: "self" },
    ],
  },
  {
    id: "sudden-undangan", category: "krisis", theme: "sudden-social", crisis: null,
    title: "Undangan mendadak",
    description: "Ada acara besar besok. Kamu baru tahu dari story orang lain, lalu namamu muncul di grup panitia.",
    requiresStatus: null,
    choices: [
      { label: "Datang totalitas", effects: { dompet: -250_000, relasi: 8 }, result: "Kamu pulang bawa goodie bag dan gosip baru.", requires: {}, requiresStatus: null, blockedByStatus: null, gains: [], clears: [], tags: [], target: "self" },
      { label: "Kirim doa dan emoji", effects: { relasi: -7, dompet: -25_000 }, result: "Doamu dibaca. Emojinya di-like satu orang.", requires: {}, requiresStatus: null, blockedByStatus: null, gains: [], clears: [], tags: [], target: "self" },
    ],
  },
];
