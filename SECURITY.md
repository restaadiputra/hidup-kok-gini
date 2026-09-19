# Kebijakan Keamanan

`Hidup Kok Gini?` adalah proyek hobi independen tanpa backend, akun, atau pengumpulan data. Semua data permainan tersimpan di `localStorage` browser pemain. Meski begitu, laporan keamanan tetap kami sambut.

## Versi yang didukung

Hanya versi terbaru di branch `master` (yang tayang di situs produksi) yang mendapat perbaikan keamanan.

## Cara melapor

Jangan buka issue publik untuk celah keamanan. Gunakan pelaporan privat GitHub:

<https://github.com/restaadiputra/hidup-kok-gini/security/advisories/new>

Sertakan:

- deskripsi masalah dan dampaknya,
- langkah untuk mereproduksi (atau contoh data simpanan yang bermasalah),
- browser dan versi yang dipakai.

Ini proyek hobi, jadi tidak ada jaminan waktu respons. Kami berusaha membalas dalam beberapa hari dan mengumumkan perbaikan setelah tersedia.

## Ruang lingkup

Relevan, misalnya:

- XSS atau injeksi lewat nama pemain, data simpanan, atau konten kartu,
- data simpanan yang dimanipulasi sehingga merusak atau mengeksploitasi aplikasi,
- kelemahan pada header keamanan atau Content Security Policy (`public/_headers`),
- kerentanan pada dependensi yang benar-benar terpakai di build produksi.

Di luar lingkup:

- kecurangan dengan mengubah data simpanan di browser sendiri (permainan lokal tanpa papan peringkat),
- serangan yang memerlukan akses fisik ke perangkat pemain,
- laporan otomatis tanpa dampak nyata yang bisa didemonstrasikan.

Uang dan utang dalam game bersifat virtual. Tidak ada transaksi atau data pribadi yang diproses.
