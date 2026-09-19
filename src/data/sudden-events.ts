import type { EventCard } from "../game/types";

// These are deliberately high-variance table moments. They are drawn from a
// separate pool so the normal category decks stay readable and replayable.
export const SUDDEN_EVENTS: EventCard[] = [
  {
    id: "sudden-nonton-bareng", category: "krisis", theme: "table-social", crisis: null,
    title: "Nonton bareng, patungan bareng",
    description: "Kamu ngajak semua orang nonton. Tiket udah dibeli, tinggal satu soal: siapa yang bayar camilan.",
    requiresStatus: null,
    choices: [
      { label: "Aku traktir", effects: { dompet: -180_000, relasi: 8 }, result: "Popcorn jumbo dari kamu. Namamu disebut kayak sponsor utama.", requires: {}, requiresStatus: null, blockedByStatus: null, gains: [], clears: [], tags: [], target: "self" },
      { label: "Patungan camilan bareng", effects: { dompet: -75_000, relasi: -3 }, result: "Camilan patungan. Satu orang kirim bukti transfer berupa stiker.", requires: {}, requiresStatus: null, blockedByStatus: null, gains: [], clears: [], tags: [], target: "all" },
      { label: "Batal ikut", effects: { relasi: -8 }, result: "Kursimu dipakai buat naruh tas. Grup ramai bahas film yang nggak kamu tonton.", requires: {}, requiresStatus: null, blockedByStatus: null, gains: [], clears: [], tags: [], target: "self" },
    ],
  },
  {
    id: "sudden-rezeki-nyasar", category: "krisis", theme: "sudden-lucky", crisis: null,
    title: "Rezeki nyasar ke rekening",
    description: "Ada transfer masuk. Nominalnya cukup bikin senyum, tapi pengirimnya cuma nulis “makasih ya”.",
    requiresStatus: null,
    choices: [
      { label: "Tanya pengirimnya", effects: { dompet: 100_000, hoki: 4 }, result: "Ternyata bonus lama yang baru nyasar.", requires: {}, requiresStatus: null, blockedByStatus: null, gains: [], clears: [], tags: [], target: "self" },
      { label: "Anggap aja rezeki nomplok", effects: { dompet: 450_000, hoki: -6 }, result: "Kamu traktir satu meja. Besoknya pengirimnya nanya, “Eh, salah transfer ya?”", requires: {}, requiresStatus: null, blockedByStatus: null, gains: [], clears: [], tags: [], target: "self" },
    ],
  },
  {
    id: "sudden-anjlok", category: "krisis", theme: "sudden-bad", crisis: null,
    title: "Barang penting tumbang",
    description: "Laptop atau motor mendadak rusak. Teknisinya geleng-geleng, lalu bilang, “Wah, ini lumayan, Kak.”",
    requiresStatus: null,
    choices: [
      { label: "Bayar pakai tabungan", effects: { dompet: -500_000, kewarasan: -4 }, result: "Tabungan menipis, tapi hidup lanjut lagi.", requires: {}, requiresStatus: null, blockedByStatus: null, gains: [], clears: [], tags: [], target: "self" },
      { label: "Tunda dulu", effects: { kewarasan: -9, hoki: -5 }, result: "Bunyinya makin keras. Kamu nyalain musik biar nggak kedengaran.", requires: {}, requiresStatus: null, blockedByStatus: null, gains: [], clears: [], tags: [], target: "self" },
    ],
  },
  {
    id: "sudden-undangan", category: "krisis", theme: "sudden-social", crisis: null,
    title: "Undangan mendadak",
    description: "Besok ada acara besar. Kamu baru tahu dari story orang, lalu tiba-tiba namamu masuk grup panitia.",
    requiresStatus: null,
    choices: [
      { label: "Datang totalitas", effects: { dompet: -250_000, relasi: 8 }, result: "Kamu pulang bawa goodie bag dan gosip baru.", requires: {}, requiresStatus: null, blockedByStatus: null, gains: [], clears: [], tags: [], target: "self" },
      { label: "Kirim doa dan emoji", effects: { relasi: -7, dompet: -25_000 }, result: "Ucapanmu kebaca, lalu tenggelam di antara 200 foto acara.", requires: {}, requiresStatus: null, blockedByStatus: null, gains: [], clears: [], tags: [], target: "self" },
    ],
  },
];
