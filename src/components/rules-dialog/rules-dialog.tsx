import { Dialog } from "../dialog/dialog";
import { Icon } from "../icon/icon";
import "./rules-dialog.css";

function Rules({ onClose }: { onClose: () => void }) {
  return (
    <div className="rules-content">
      <p className="dialog-lead">
        12 bulan. Empat modal hidup. Satu pertanyaan: <strong>kok gini?</strong>
      </p>
      <ol>
        <li>
          <strong>Ajak 2–4 manusia.</strong> Satu perangkat, main gantian.
          Bekal: Rp2,5 juta, Kewarasan 60, Relasi 40, Hoki 50.
        </li>
        <li>
          <strong>Lempar → jalan → pilih.</strong> Dadu 1–6, petak menentukan
          kartu. Besar efek diacak saat kartu muncul, lalu angkanya tetap sampai
          kamu memilih. GAJIAN dan Plot twist
          mengambil kategori acak.
        </li>
        <li>
          <strong>Satu giliran per bulan.</strong> Semua pemain main sekali,
          baru ganti bulan. Putaran papan bukan hitungan bulan.
        </li>
        <li>
          <strong>Mampir gajian tiap selesai satu putaran papan.</strong> Pion
          berhenti di GAJIAN untuk melihat slip gaji, lalu lanjutkan sisa langkah.
          Gaji Rp2,8–3,2 juta dipotong biaya hidup Rp1,6–2 juta dan tagihan dadakan
          Rp50–750 ribu. Ada peluang 8% kena musibah dengan tagihan Rp1,75–2,75 juta
          yang menggantikan tagihan dadakan biasa. Kalau tagihan melebihi gaji,
          sisanya jadi Hutang! Posisi awal nggak dapat gaji.
        </li>
        <li>
          <strong>Bokek bukan game over.</strong> Kalau Dompet nggak cukup, sisanya
          jadi Hutang (kena biaya 20%). Tiap gajian Hutang berbunga 10% dan dicicil
          sampai Rp500 ribu, sisanya mengurangi skor akhir.
          Kewarasan, Relasi, dan Hoki tetap 0–100. Efek pilihan bisa naik atau
          turun hingga 40% dari nilai dasarnya. Hoki nambah skor, tapi nggak memengaruhi dadu.
        </li>
        <li>
          <strong>Desember = audit tahunan.</strong> Setelah semua selesai: skor
          = ⌊Dompet ÷ Rp100 rb⌋ + Kewarasan + Relasi + Hoki. Skor tertinggi
          menang; seri jadi juara bersama.
        </li>
      </ol>
      <div className="rules-tip">
        <Icon name="sparkles" size={19} />
        <p>
          Progres otomatis tersimpan di browser ini. Gunakan satu tab untuk
          bermain. Refresh aman, hapus data browser = mulai dari nol.
        </p>
      </div>
      <a
        className="rules-source"
        href="https://github.com/restaadiputra/hidup-kok-gini"
        target="_blank"
        rel="noopener noreferrer"
      >
        Kode terbuka di GitHub
        <Icon name="arrow" size={16} />
      </a>
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
