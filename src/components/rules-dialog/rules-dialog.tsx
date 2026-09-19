import { Dialog } from "../dialog/dialog";
import { Icon } from "../icon/icon";
import "./rules-dialog.css";

function Rules({ onClose }: { onClose: () => void }) {
  return (
    <div className="rules-content">
      <p className="dialog-lead">
        Main 12 bulan. Jaga Dompet, Kewarasan, Relasi, dan Hoki sambil
        menjawab satu pertanyaan: <strong>kok gini?</strong>
      </p>
      <ol>
        <li>
          <strong>Siapkan skuad 2–4 orang.</strong> Pakai satu perangkat dan
          operasikan sesuai urutan pemain. Semua mulai dengan Dompet Rp2,5 juta,
          Kewarasan 60, Relasi 40, dan Hoki 50.
        </li>
        <li>
          <strong>Lempar → jalan → pilih.</strong> Dadu 1–6 mengantarkanmu ke
          petak dan kartu yang sesuai. Efek setiap opsi diacak saat kartu muncul,
          lalu angka yang terlihat tetap sampai kamu memilih.
        </li>
        <li>
          <strong>Satu giliran berarti satu bulan.</strong> Semua pemain mendapat
          tepat satu giliran. Setelah pilihan terakhir selesai, bulan berganti;
          putaran pion di papan bukan hitungan bulan.
        </li>
        <li>
          <strong>Payday muncul di akhir bulan.</strong> Setelah semua pemain
          menyelesaikan gilirannya, tiap pemain melihat slip gaji secara bergantian
          dan memilih satu opsi payday. Sesudah semua memilih, muncul satu event
          bersama untuk seluruh meja. Gaji Rp2,8–3,2 juta dipotong biaya hidup
          Rp1,6–2 juta dan tagihan dadakan Rp50–750 ribu. Ada peluang 8% kena
          musibah dengan tagihan Rp1,75–2,75 juta. Posisi awal tidak mendapat gaji.
        </li>
        <li>
          <strong>Bokek bukan game over.</strong> Kalau Dompet tidak cukup, sisanya
          otomatis menjadi Hutang dengan biaya 20%. Saat payday, Hutang berbunga
          10% dan dicicil sampai Rp500 ribu bila ada uangnya. Kewarasan, Relasi,
          dan Hoki selalu berada di 0–100; status tertentu bisa membuka atau
          mengunci opsi. Hoki menambah skor, tetapi tidak memengaruhi dadu.
        </li>
        <li>
          <strong>Desember = audit tahunan.</strong> Setelah semua giliran selesai,
          skor = ⌊(Dompet − Hutang) ÷ Rp100 rb⌋ + Kewarasan + Relasi + Hoki.
          Skor tertinggi menang; skor seri berarti juara bersama.
        </li>
      </ol>
      <div className="rules-tip">
        <Icon name="sparkles" size={19} />
        <p>
          Progres otomatis tersimpan di browser ini. Gunakan satu tab untuk
          bermain. Refresh aman, hapus data browser = mulai dari nol.
        </p>
      </div>
      <div className="rules-footer">
        <p className="rules-credit">
          Terinspirasi <a href="https://wnisimulator.hecticholic.com/" target="_blank" rel="noopener noreferrer">WNI Simulator</a> karya Hecticholic.
          Bukan produk resmi dan tidak berafiliasi.
        </p>
        <a
          className="rules-source"
          href="https://github.com/restaadiputra/hidup-kok-gini"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span>Kode terbuka di GitHub</span>
          <Icon name="arrow" size={16} />
        </a>
      </div>
      <button className="primary-button" onClick={onClose}>
        Paham. Gas aja dulu <Icon name="arrow" size={18} />
      </button>
    </div>
  );
}

export function RulesDialog({ onClose }: { onClose: () => void }) {
  return (
    <Dialog title="Tutorial jadi dewasa" onClose={onClose}>
      <Rules onClose={onClose} />
    </Dialog>
  );
}
