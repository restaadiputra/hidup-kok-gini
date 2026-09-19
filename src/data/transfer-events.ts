import type { EventCard } from "../game/types";

// The former payday tile remains useful as a small economic wildcard. It is
// intentionally separate from monthly salary settlement.
export const TRANSFER_EVENTS: EventCard[] = [
  {
    id: "bonus-transfer-nyasar", category: "gajian", theme: "bonus", crisis: null, requiresStatus: null,
    title: "Transfer nyasar, senyum sebentar",
    description: "Ada uang masuk tanpa keterangan. Nominalnya kecil, tapi kamu cek rekening tiga kali.",
    choices: [
      { label: "Chat pengirimnya dulu", effects: { dompet: 75_000, hoki: 3 }, result: "Ternyata cashback lama. Kecil, tapi sah.", requires: {}, requiresStatus: null, blockedByStatus: null, gains: [], clears: [], tags: [], target: "self" },
      { label: "Pakai buat makan", effects: { dompet: 150_000, kewarasan: 3, hoki: -5 }, result: "Kamu traktir diri sendiri. Anggap aja healing versi 150 ribu.", requires: {}, requiresStatus: null, blockedByStatus: null, gains: [], clears: [], tags: [], target: "self" },
    ],
  },
  {
    id: "bonus-cashback-palsu", category: "gajian", theme: "bonus", crisis: null, requiresStatus: null,
    title: "Cashback pakai syarat",
    description: "Aplikasi janji cashback besar. Syaratnya cuma belanja dulu, langganan dulu, dan baca 17 halaman.",
    choices: [
      { label: "Ambil yang realistis", effects: { dompet: -50_000, hoki: 5 }, result: "Cashback kecil masuk. Kamu rayakan pakai screenshot.", requires: {}, requiresStatus: null, blockedByStatus: null, gains: [], clears: [], tags: [], target: "self" },
      { label: "Kejar nominal besar", effects: { dompet: -250_000, kewarasan: -5, hoki: -4 }, result: "Pas udah bayar, muncul syarat baru di halaman 18.", requires: {}, requiresStatus: null, blockedByStatus: null, gains: [], clears: [], tags: [], target: "self" },
    ],
  },
  {
    id: "bonus-patungan-kecil", category: "gajian", theme: "bonus", crisis: null, requiresStatus: null,
    title: "Patungan receh jadi serius",
    description: "Teman nemu promo paket keluarga. Semua bisa hemat, asal nggak ada yang lupa transfer.",
    choices: [
      { label: "Patungan paket keluarga", effects: { dompet: 50_000, relasi: 4 }, result: "Promo berhasil. Transfer terakhir datang besok.", requires: {}, requiresStatus: null, blockedByStatus: null, gains: [], clears: [], tags: [], target: "all" },
      { label: "Lewat dulu", effects: { relasi: -4, hoki: 2 }, result: "Kamu bebas dari grup patungan. Promonya juga bebas dari kamu.", requires: {}, requiresStatus: null, blockedByStatus: null, gains: [], clears: [], tags: [], target: "self" },
    ],
  },
  {
    id: "bonus-biaya-admin", category: "gajian", theme: "bonus", crisis: null, requiresStatus: null,
    title: "Biaya admin menyapa",
    description: "Transfer 20 ribu, biaya adminnya 6.500. Rasanya kayak bayar tiket masuk ke rekening sendiri.",
    choices: [
      { label: "Bayar dan lanjut", effects: { dompet: -25_000, kewarasan: 2 }, result: "Biayanya kecil. Rasa kesalnya tetap premium.", requires: {}, requiresStatus: null, blockedByStatus: null, gains: [], clears: [], tags: [], target: "self" },
      { label: "Cari jalur gratis", effects: { kewarasan: -4, hoki: -3 }, result: "Jalur gratis ketemu setelah 20 menit. Waktumu yang jadi biaya admin.", requires: {}, requiresStatus: null, blockedByStatus: null, gains: [], clears: [], tags: [], target: "self" },
    ],
  },
];
