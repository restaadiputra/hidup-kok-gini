import type { Category, EventCard, Stat } from "../game/types";

// A second, lighter content layer keeps the main JSON decks readable while
// giving the table more modern millenial/Gen Z/Gen Alpha beats per category.
const TOPICS: Record<Category, string[]> = {
  kerja: ["meeting yang bisa jadi email", "side quest kantor", "printer minta perhatian", "deadline pakai aura", "presentasi mode darurat", "atasan kirim voice note", "kursi kantor rebutan", "satu revisi terakhir"],
  keluarga: ["voice note keluarga", "acara keluarga mendadak", "grup keluarga berbagi resep", "sepupu minta rekomendasi", "telepon orang tua malam-malam", "foto keluarga wajib hadir", "kerabat bawa pertanyaan", "jadwal kumpul berubah"],
  "anak-kos": ["kulkas kos misterius", "teman kos bawa tamu", "galon terakhir habis", "jemuran kena hujan", "kunci kamar nyelip", "wifi kos lemot", "iuran kebersihan", "mie instan tinggal satu"],
  kendaraan: ["ban dan lampu indikator", "parkir level boss", "bensin tinggal garis merah", "helm dipinjam tetangga", "macet mendadak", "servis kecil jadi besar", "tilang versi kamera", "spion kena drama"],
  nongkrong: ["reservasi viral", "teman ajak healing", "menu baru terlalu niat", "kopi ketiga hari ini", "tempat nongkrong pindah", "teman datang bawa teman", "playlist bikin debat", "foto grup wajib ulang"],
  "e-commerce": ["flash sale tengah malam", "paket salah alamat", "keranjang minta checkout", "voucher punya syarat", "unboxing meleset dari ekspektasi", "kurir datang saat mandi", "rating bintang lima", "live shopping lewat"],
  tagihan: ["notifikasi jatuh tempo", "autodebet mengejutkan", "meteran bunyi", "iuran grup menunggu", "langganan lama muncul", "denda kecil jadi besar", "invoice tanpa konteks", "saldo dipotong duluan"],
  "tanggal-tua": ["saldo tinggal dua digit", "promo ongkir terakhir", "bekal tiga hari", "dompet berbunyi kosong", "warteg kasih bonus", "teman ajak makan", "koin digital terkumpul", "resep hemat viral"],
  kondangan: ["dress code grup keluarga", "amplop digital", "kursi keluarga penuh", "foto pelaminan antre", "souvenir rebutan", "sambutan terlalu panjang", "teman lama menyapa", "undangan plus satu"],
  "grup-whatsapp": ["polling tanpa ujung", "admin grup panik", "stiker salah kirim", "chat dibalas semua", "nama grup berubah", "voice note tujuh menit", "pesan dihapus", "notifikasi jam dua pagi"],
  ojol: ["driver dan titik jemput", "promo tapi ada syarat", "hujan lima menit", "resto ganti menu", "saldo dompet digital tipis", "titik map bergeser", "helm cadangan hilang", "driver minta patokan"],
  internet: ["wifi ngambek", "password tetangga berubah", "video buffering", "meeting patah-patah", "kuota tinggal sedikit", "router minta restart", "FYP berhenti mendadak", "sinyal hilang di kamar"],
  mudik: ["tiket rebutan", "oleh-oleh titipan", "rest area penuh", "koper kelebihan muatan", "jadwal berangkat maju", "macet versi legenda", "kursi dekat toilet", "pesan keluarga bertambah"],
  "drama-kantor": ["calendar invite misterius", "chat kantor lewat tengah malam", "printer rapat ngambek", "kursi meeting berpindah", "status online dipantau", "presentasi mendadak", "atasan pakai emoji", "basa-basi jadi tugas"],
};

const STATS: Stat[] = ["kewarasan", "relasi", "hoki"];
const choice = (label: string, effects: Partial<Record<Stat | "dompet", number>>, result: string) => ({
  label, effects, result, requires: {}, requiresStatus: null, blockedByStatus: null,
  gains: [], clears: [], tags: [], target: "self" as const,
});

export const BONUS_EVENTS: EventCard[] = Object.entries(TOPICS).flatMap(([category, topics], categoryIndex) =>
  topics.map((topic, variant) => {
    const stat = STATS[(categoryIndex + variant) % STATS.length];
    const label = category.replace("-", " ");
    return {
      id: `bonus-${category}-${variant + 1}`,
      category: category as Category,
      theme: variant === 0 ? "gen-z" : "gen-alpha",
      crisis: null,
      requiresStatus: null,
      title: `${topic[0].toUpperCase()}${topic.slice(1)}`,
      description: `${topic} muncul di area ${label} pas kamu lagi mencoba terlihat santai; grup chat langsung aktif.`,
      choices: [
        choice("Ambil jalur hemat", { dompet: -50_000, [stat]: 4 }, `Kamu pilih versi hemat; ${topic} tetap jadi bahan cerita.`),
        choice("Gas tanpa mikir", { dompet: -150_000, [stat]: -5 }, `Kamu gas sekalian; ${topic} menang, saldo yang mengalah.`),
      ],
    } satisfies EventCard;
  }),
);
