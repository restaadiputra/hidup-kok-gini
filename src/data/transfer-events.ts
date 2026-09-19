import type { EventCard } from "../game/types";

// The former payday tile remains useful as a small economic wildcard. It is
// intentionally separate from monthly salary settlement.
export const TRANSFER_EVENTS: EventCard[] = [
  {
    id: "bonus-transfer-nyasar", category: "gajian", theme: "bonus", crisis: null, requiresStatus: null,
    title: "Transfer nyasar, senyum sebentar",
    description: "Ada uang masuk tanpa caption. Nominalnya kecil, tapi cukup bikin kamu cek rekening tiga kali.",
    choices: [
      { label: "Tanya pengirimnya", effects: { dompet: 75_000, hoki: 3 }, result: "Ternyata cashback lama. Kecil, tapi sah.", requires: {}, requiresStatus: null, blockedByStatus: null, gains: [], clears: [], tags: [], target: "self" },
      { label: "Pakai buat makan", effects: { dompet: 150_000, kewarasan: 3, hoki: -5 }, result: "Kamu mentraktir diri sendiri. Rekening ikut healing.", requires: {}, requiresStatus: null, blockedByStatus: null, gains: [], clears: [], tags: [], target: "self" },
    ],
  },
  {
    id: "bonus-cashback-palsu", category: "gajian", theme: "bonus", crisis: null, requiresStatus: null,
    title: "Cashback pakai syarat",
    description: "Aplikasi menjanjikan cashback besar. Syaratnya cuma belanja dulu, langganan dulu, dan baca 17 halaman.",
    choices: [
      { label: "Ambil yang realistis", effects: { dompet: -50_000, hoki: 5 }, result: "Cashback kecil masuk. Kamu merayakannya dengan screenshot.", requires: {}, requiresStatus: null, blockedByStatus: null, gains: [], clears: [], tags: [], target: "self" },
      { label: "Kejar nominal besar", effects: { dompet: -250_000, kewarasan: -5, hoki: -4 }, result: "Syarat terakhir muncul setelah pembayaran.", requires: {}, requiresStatus: null, blockedByStatus: null, gains: [], clears: [], tags: [], target: "self" },
    ],
  },
  {
    id: "bonus-patungan-kecil", category: "gajian", theme: "bonus", crisis: null, requiresStatus: null,
    title: "Patungan receh jadi serius",
    description: "Teman satu meja menemukan promo paket keluarga. Semua bisa hemat kalau transfernya tidak lupa.",
    choices: [
      { label: "Patungan paket keluarga", effects: { dompet: 50_000, relasi: 4 }, result: "Promo berhasil. Transfer terakhir datang besok.", requires: {}, requiresStatus: null, blockedByStatus: null, gains: [], clears: [], tags: [], target: "all" },
      { label: "Lewat dulu", effects: { relasi: -4, hoki: 2 }, result: "Kamu aman dari admin patungan, tapi kehilangan promo.", requires: {}, requiresStatus: null, blockedByStatus: null, gains: [], clears: [], tags: [], target: "self" },
    ],
  },
  {
    id: "bonus-biaya-admin", category: "gajian", theme: "bonus", crisis: null, requiresStatus: null,
    title: "Biaya admin menyapa",
    description: "Transfer kecil berubah jadi pengingat bahwa semua hal punya biaya admin.",
    choices: [
      { label: "Bayar dan lanjut", effects: { dompet: -25_000, kewarasan: 2 }, result: "Biayanya kecil. Rasa kesalnya tetap premium.", requires: {}, requiresStatus: null, blockedByStatus: null, gains: [], clears: [], tags: [], target: "self" },
      { label: "Cari jalur gratis", effects: { kewarasan: -4, hoki: -3 }, result: "Kamu menemukan jalur gratis setelah 20 menit.", requires: {}, requiresStatus: null, blockedByStatus: null, gains: [], clears: [], tags: [], target: "self" },
    ],
  },
];
