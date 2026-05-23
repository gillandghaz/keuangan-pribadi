import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import { Btn } from '../components/ui/Form';

const FAQS_ID = [
  { q: 'Apakah aplikasi ini benar-benar gratis?', a: 'Ya, 100% gratis. Menggunakan Firebase Spark Plan (gratis selamanya) dan Vercel free tier. Tidak ada biaya tersembunyi.' },
  { q: 'Data saya aman tidak?', a: 'Data tersimpan di Firebase Firestore milik akun Google Anda. Setiap pengguna hanya bisa mengakses data miliknya sendiri (dijamin oleh Firestore Security Rules).' },
  { q: 'Kenapa harga saham IDX tidak otomatis?', a: 'Yahoo Finance tidak menyediakan data IDX secara real-time gratis. Untuk saham IDX, Reksa Dana, dan Emas, input harga manual via tombol Edit di halaman Investasi.' },
  { q: 'Bagaimana cara mencatat dividen?', a: 'Buat transaksi baru → Jenis: Pemasukan → Subkategori: Dividen/Investasi. Data akan otomatis muncul di halaman Dividen.' },
  { q: 'Apakah bisa dipakai di HP?', a: 'Ya, aplikasi ini responsive dan memiliki bottom navigation khusus mobile. Bisa diakses via browser HP.' },
  { q: 'Bagaimana cara backup data?', a: 'Buka Settings → Data & Backup → Download Backup. File JSON akan tersimpan di perangkat Anda.' },
  { q: 'Kenapa watchlist indeks tidak muncul harganya?', a: 'Harga diambil via proxy Vercel → Yahoo Finance. Pastikan aplikasi di-deploy ke Vercel (bukan hanya dijalankan lokal) agar API proxy berfungsi.' },
  { q: 'Bagaimana cara mengatur PIN?', a: 'Settings → Keamanan → Aktifkan PIN Lock. Masukkan PIN 4 digit dan konfirmasi. Atur juga timeout sesuai kebutuhan.' },
];

const FAQS_EN = [
  { q: 'Is this app truly free?', a: 'Yes, 100% free. Uses Firebase Spark Plan (free forever) and Vercel free tier. No hidden costs.' },
  { q: 'Is my data safe?', a: 'Data is stored in Firebase Firestore under your Google account. Each user can only access their own data (guaranteed by Firestore Security Rules).' },
  { q: "Why can't IDX stock prices update automatically?", a: 'Yahoo Finance does not provide free real-time IDX data. For IDX stocks, Mutual Funds, and Gold, enter prices manually via the Edit button on the Investments page.' },
  { q: 'How do I record dividends?', a: 'Create a new transaction → Type: Income → Subcategory: Dividend/Investment. Data will automatically appear on the Dividends page.' },
  { q: 'Can I use it on mobile?', a: 'Yes, the app is responsive and has a dedicated mobile bottom navigation. Access it via your mobile browser.' },
  { q: 'How do I back up my data?', a: 'Go to Settings → Data & Backup → Download Backup. A JSON file will be saved to your device.' },
  { q: "Why don't index prices show in the watchlist?", a: 'Prices are fetched via Vercel proxy → Yahoo Finance. Make sure the app is deployed to Vercel (not just run locally) for the API proxy to work.' },
  { q: 'How do I set up a PIN?', a: 'Settings → Security → Enable PIN Lock. Enter a 4-digit PIN and confirm. Also set the timeout according to your needs.' },
];

const TIPS_ID = [
  { icon: '💡', tip: 'Gunakan Export CSV di halaman Transaksi untuk analisis lebih lanjut di Excel.' },
  { icon: '🎯', tip: 'Set target keuangan untuk dana darurat minimal 3x pengeluaran bulanan.' },
  { icon: '📅', tip: 'Cek halaman Anggaran setiap minggu agar tidak overspending.' },
  { icon: '🔄', tip: 'Klik "Perbarui Harga" di Investasi setelah jam pasar tutup untuk harga terkini.' },
  { icon: '📊', tip: 'Gunakan Laporan Tahunan di akhir tahun untuk evaluasi keuangan komprehensif.' },
  { icon: '🔒', tip: 'Aktifkan PIN Lock di Settings jika menggunakan perangkat bersama.' },
  { icon: '💾', tip: 'Lakukan backup data minimal sebulan sekali via Settings → Data & Backup.' },
  { icon: '🌍', tip: 'Watchlist indeks diupdate otomatis setiap 5 menit saat halaman dibuka.' },
];

const TIPS_EN = [
  { icon: '💡', tip: 'Use the CSV Export on the Transactions page for further analysis in Excel.' },
  { icon: '🎯', tip: 'Set a financial goal for an emergency fund of at least 3x monthly expenses.' },
  { icon: '📅', tip: 'Check the Budget page weekly to avoid overspending.' },
  { icon: '🔄', tip: 'Click "Update Prices" in Investments after market close for the latest prices.' },
  { icon: '📊', tip: 'Use the Annual Report at year-end for a comprehensive financial review.' },
  { icon: '🔒', tip: 'Enable PIN Lock in Settings if using a shared device.' },
  { icon: '💾', tip: 'Back up your data at least once a month via Settings → Data & Backup.' },
  { icon: '🌍', tip: 'Watchlist indices auto-update every 5 minutes when the page is open.' },
];

const GUIDE_STEPS_ID = [
  { icon: '📊', title: 'Dashboard', desc: 'Pusat informasi keuangan Anda. Tampilkan arus kas bulanan, rekap tahunan, skor kesehatan keuangan, dan grafik 12 bulan terakhir.' },
  { icon: '💸', title: 'Transaksi', desc: 'Catat semua pemasukan dan pengeluaran. Gunakan filter untuk mencari transaksi lama. Export ke CSV untuk analisis di Excel.' },
  { icon: '📅', title: 'Anggaran', desc: 'Tetapkan batas pengeluaran per kategori. Status badge menunjukkan Aman/Waspada/Kritis/Melebihi secara real-time.' },
  { icon: '📈', title: 'Investasi', desc: 'Pantau portofolio multi-aset dan multi-mata uang. Saham AS & kripto dapat diperbarui otomatis. IDX input manual.' },
  { icon: '🏦', title: 'Utang & Cicilan', desc: 'Kelola semua pinjaman. Kalkulator cicilan otomatis. Update pembayaran dengan riwayat dan fitur undo.' },
  { icon: '💰', title: 'Dividen', desc: 'Rekap otomatis dari transaksi bertipe Pemasukan dengan Subkategori Dividen/Investasi. Tambah catatan manual per bulan.' },
  { icon: '🌍', title: 'Watchlist', desc: 'Pantau 35 indeks saham global dalam satu halaman. Harga diperbarui otomatis setiap 5 menit.' },
  { icon: '🎯', title: 'Target Keuangan', desc: 'Buat dan pantau target keuangan (liburan, rumah, dana darurat). Update progress kapan saja.' },
  { icon: '📋', title: 'Laporan', desc: 'Buat laporan keuangan mingguan/bulanan/tahunan. Export ke PDF atau Excel dengan satu klik.' },
  { icon: '🔧', title: 'Pengaturan', desc: 'Atur profil, tema, bahasa, PIN lock, notifikasi, dan backup data semuanya di satu tempat.' },
];

const GUIDE_STEPS_EN = [
  { icon: '📊', title: 'Dashboard', desc: 'Your financial information hub. Shows monthly cash flow, yearly summary, financial health score, and 12-month trend chart.' },
  { icon: '💸', title: 'Transactions', desc: 'Record all income and expenses. Use filters to find past transactions. Export to CSV for Excel analysis.' },
  { icon: '📅', title: 'Budget', desc: 'Set spending limits per category. Status badges show Safe/Caution/Critical/Exceeded in real-time.' },
  { icon: '📈', title: 'Investments', desc: 'Track multi-asset and multi-currency portfolios. US stocks & crypto can be updated automatically. IDX requires manual input.' },
  { icon: '🏦', title: 'Debt & Loans', desc: 'Manage all loans. Automatic installment calculator. Update payments with history and undo feature.' },
  { icon: '💰', title: 'Dividends', desc: 'Auto-summary from Income transactions with Subcategory Dividend/Investment. Add manual notes per month.' },
  { icon: '🌍', title: 'Watchlist', desc: 'Monitor 35 global stock indices on one page. Prices auto-update every 5 minutes.' },
  { icon: '🎯', title: 'Financial Goals', desc: 'Create and track financial goals (vacation, house, emergency fund). Update progress anytime.' },
  { icon: '📋', title: 'Reports', desc: 'Generate weekly/monthly/yearly financial reports. Export to PDF or Excel with one click.' },
  { icon: '🔧', title: 'Settings', desc: 'Manage profile, theme, language, PIN lock, notifications, and data backup all in one place.' },
];

export default function Bantuan() {
  const { t, lang } = useLang();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('panduan');
  const [openFAQ, setOpenFAQ] = useState(null);

  const faqs = lang === 'id' ? FAQS_ID : FAQS_EN;
  const tips = lang === 'id' ? TIPS_ID : TIPS_EN;
  const steps = lang === 'id' ? GUIDE_STEPS_ID : GUIDE_STEPS_EN;

  function startGuidedTour() {
    localStorage.removeItem('tourCompleted');
    navigate('/dashboard');
    setTimeout(() => window.dispatchEvent(new CustomEvent('startTour')), 500);
  }

  const TABS = [
    { key: 'panduan', label: lang === 'id' ? '📖 Panduan' : '📖 Guide' },
    { key: 'faq', label: 'FAQ' },
    { key: 'tips', label: lang === 'id' ? '💡 Tips' : '💡 Tips' },
    { key: 'mulai', label: lang === 'id' ? '🚀 Mulai Cepat' : '🚀 Quick Start' },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
          ❓ {t('bantuan.title')}
        </h1>
        <Btn onClick={startGuidedTour}>🎯 {t('bantuan.mulaiTour')}</Btn>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-slate-200 dark:border-slate-700">
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-semibold transition-colors border-b-2 -mb-px
              ${activeTab === tab.key
                ? 'border-[#4a90d9] text-[#4a90d9]'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* PANDUAN */}
      {activeTab === 'panduan' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {steps.map((step, i) => (
            <div key={i}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700
                rounded-2xl p-5 hover:border-[#4a90d9] dark:hover:border-[#4a90d9] transition-colors">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1e3a5f]/10 dark:bg-[#4a90d9]/10
                  flex items-center justify-center text-xl shrink-0">
                  {step.icon}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-1">{step.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FAQ */}
      {activeTab === 'faq' && (
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
              <button
                onClick={() => setOpenFAQ(openFAQ === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left
                  hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                <span className="font-semibold text-sm text-slate-800 dark:text-slate-100 pr-4">{faq.q}</span>
                <span className={`text-[#4a90d9] text-lg shrink-0 transition-transform ${openFAQ === i ? 'rotate-180' : ''}`}>▾</span>
              </button>
              {openFAQ === i && (
                <div className="px-5 pb-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-700/50 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* TIPS */}
      {activeTab === 'tips' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tips.map((tip, i) => (
            <div key={i}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700
                rounded-2xl p-4 flex gap-3 items-start">
              <span className="text-2xl shrink-0">{tip.icon}</span>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{tip.tip}</p>
            </div>
          ))}
        </div>
      )}

      {/* MULAI CEPAT */}
      {activeTab === 'mulai' && (
        <div className="space-y-4">
          {[
            { step: 1, title: lang === 'id' ? 'Daftar & Login' : 'Register & Login', desc: lang === 'id' ? 'Buat akun dengan email dan password. Data awal (43 kategori + 13 anggaran) akan otomatis dimuat.' : 'Create an account with email and password. Initial data (43 categories + 13 budgets) will be automatically loaded.' },
            { step: 2, title: lang === 'id' ? 'Catat Transaksi' : 'Record Transactions', desc: lang === 'id' ? 'Mulai dari halaman Transaksi → klik "+ Tambah". Isi tanggal, jenis (pemasukan/pengeluaran), kategori, dan jumlah.' : 'Start on the Transactions page → click "+ Add". Fill in date, type (income/expense), category, and amount.' },
            { step: 3, title: lang === 'id' ? 'Atur Anggaran' : 'Set Budget', desc: lang === 'id' ? 'Buka Anggaran → sesuaikan nominal anggaran bulanan per kategori sesuai kebutuhan Anda.' : 'Open Budget → adjust the monthly budget amount per category to suit your needs.' },
            { step: 4, title: lang === 'id' ? 'Tambah Investasi' : 'Add Investments', desc: lang === 'id' ? 'Buka Investasi → "+ Tambah". Untuk saham AS/kripto, isi Kode Ticker dan harga akan diambil otomatis.' : 'Open Investments → "+ Add". For US stocks/crypto, fill in the Ticker Code and the price will be fetched automatically.' },
            { step: 5, title: lang === 'id' ? 'Pantau Dashboard' : 'Monitor Dashboard', desc: lang === 'id' ? 'Dashboard menampilkan semua ringkasan. Cek Skor Kesehatan Keuangan untuk evaluasi kondisi keuangan Anda.' : 'Dashboard shows all summaries. Check the Financial Health Score to evaluate your financial condition.' },
            { step: 6, title: lang === 'id' ? 'Deploy ke Vercel' : 'Deploy to Vercel', desc: lang === 'id' ? 'Untuk fitur watchlist indeks dan harga otomatis, deploy aplikasi ke Vercel (gratis). Lihat README.md untuk panduan lengkap.' : 'For index watchlist and automatic prices, deploy the app to Vercel (free). See README.md for the full guide.' },
          ].map(s => (
            <div key={s.step}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700
                rounded-2xl p-5 flex gap-4 items-start">
              <div className="w-10 h-10 rounded-full bg-[#1e3a5f] text-white font-bold
                flex items-center justify-center shrink-0 text-lg">
                {s.step}
              </div>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-1">{s.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}

          <div className="bg-[#1e3a5f] text-white rounded-2xl p-6 text-center">
            <p className="text-blue-200 text-sm mb-3">Ingin tur interaktif melalui semua fitur?</p>
            <Btn onClick={startGuidedTour} variant="accent">🎯 Mulai Guided Tour</Btn>
          </div>
        </div>
      )}
    </div>
  );
}
