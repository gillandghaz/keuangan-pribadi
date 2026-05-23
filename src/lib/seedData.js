// Seed data for first-time users — bilingual (ID/EN)

export const REFERENSI_DEFAULT_ID = [
  { kategori: 'Pemasukan', subkategori: 'Gaji Pokok', keterangan: '', sortOrder: 0 },
  { kategori: 'Pemasukan', subkategori: 'Bonus', keterangan: '', sortOrder: 1 },
  { kategori: 'Pemasukan', subkategori: 'Freelance', keterangan: '', sortOrder: 2 },
  { kategori: 'Pemasukan', subkategori: 'Dividen/Investasi', keterangan: '', sortOrder: 3 },
  { kategori: 'Pemasukan', subkategori: 'Bisnis', keterangan: '', sortOrder: 4 },
  { kategori: 'Pemasukan', subkategori: 'Sewa Properti', keterangan: '', sortOrder: 5 },
  { kategori: 'Pemasukan', subkategori: 'Cashback/Reward', keterangan: '', sortOrder: 6 },
  { kategori: 'Pemasukan', subkategori: 'Lainnya', keterangan: '', sortOrder: 7 },
  { kategori: 'Makanan & Minuman', subkategori: 'Belanja Dapur', keterangan: '', sortOrder: 0 },
  { kategori: 'Makanan & Minuman', subkategori: 'Makan di Luar', keterangan: '', sortOrder: 1 },
  { kategori: 'Makanan & Minuman', subkategori: 'Pesan Antar', keterangan: '', sortOrder: 2 },
  { kategori: 'Makanan & Minuman', subkategori: 'Kopi & Minuman', keterangan: '', sortOrder: 3 },
  { kategori: 'Transportasi', subkategori: 'BBM', keterangan: '', sortOrder: 0 },
  { kategori: 'Transportasi', subkategori: 'Ojek Online', keterangan: '', sortOrder: 1 },
  { kategori: 'Transportasi', subkategori: 'Parkir & Tol', keterangan: '', sortOrder: 2 },
  { kategori: 'Transportasi', subkategori: 'Perawatan Kendaraan', keterangan: '', sortOrder: 3 },
  { kategori: 'Transportasi', subkategori: 'Transportasi Umum', keterangan: '', sortOrder: 4 },
  { kategori: 'Rumah & Utilitas', subkategori: 'Sewa/Cicilan Rumah', keterangan: '', sortOrder: 0 },
  { kategori: 'Rumah & Utilitas', subkategori: 'Listrik', keterangan: '', sortOrder: 1 },
  { kategori: 'Rumah & Utilitas', subkategori: 'Air', keterangan: '', sortOrder: 2 },
  { kategori: 'Rumah & Utilitas', subkategori: 'Internet', keterangan: '', sortOrder: 3 },
  { kategori: 'Rumah & Utilitas', subkategori: 'Gas', keterangan: '', sortOrder: 4 },
  { kategori: 'Rumah & Utilitas', subkategori: 'Perawatan Rumah', keterangan: '', sortOrder: 5 },
  { kategori: 'Kesehatan', subkategori: 'Dokter & Klinik', keterangan: '', sortOrder: 0 },
  { kategori: 'Kesehatan', subkategori: 'Obat-obatan', keterangan: '', sortOrder: 1 },
  { kategori: 'Kesehatan', subkategori: 'BPJS', keterangan: '', sortOrder: 2 },
  { kategori: 'Kesehatan', subkategori: 'Olahraga', keterangan: '', sortOrder: 3 },
  { kategori: 'Pendidikan', subkategori: 'Biaya Sekolah/Kuliah', keterangan: '', sortOrder: 0 },
  { kategori: 'Pendidikan', subkategori: 'Kursus & Pelatihan', keterangan: '', sortOrder: 1 },
  { kategori: 'Pendidikan', subkategori: 'Buku & Alat Tulis', keterangan: '', sortOrder: 2 },
  { kategori: 'Hiburan & Gaya Hidup', subkategori: 'Streaming', keterangan: '', sortOrder: 0 },
  { kategori: 'Hiburan & Gaya Hidup', subkategori: 'Belanja Online', keterangan: '', sortOrder: 1 },
  { kategori: 'Hiburan & Gaya Hidup', subkategori: 'Pakaian', keterangan: '', sortOrder: 2 },
  { kategori: 'Hiburan & Gaya Hidup', subkategori: 'Liburan', keterangan: '', sortOrder: 3 },
  { kategori: 'Hiburan & Gaya Hidup', subkategori: 'Hobi', keterangan: '', sortOrder: 4 },
  { kategori: 'Keuangan', subkategori: 'Cicilan Utang', keterangan: '', sortOrder: 0 },
  { kategori: 'Keuangan', subkategori: 'Tabungan', keterangan: '', sortOrder: 1 },
  { kategori: 'Keuangan', subkategori: 'Tabungan Darurat', keterangan: '', sortOrder: 2 },
  { kategori: 'Keuangan', subkategori: 'Investasi', keterangan: '', sortOrder: 3 },
  { kategori: 'Keuangan', subkategori: 'Asuransi', keterangan: '', sortOrder: 4 },
  { kategori: 'Sosial', subkategori: 'Keluarga', keterangan: '', sortOrder: 0 },
  { kategori: 'Sosial', subkategori: 'Sedekah & Zakat', keterangan: '', sortOrder: 1 },
  { kategori: 'Sosial', subkategori: 'Hadiah & Kado', keterangan: '', sortOrder: 2 },
  { kategori: 'Lainnya', subkategori: 'Tidak Terkategori', keterangan: '', sortOrder: 0 },
];

// Keep backward compat
export const REFERENSI_DEFAULT = REFERENSI_DEFAULT_ID;

export const ANGGARAN_DEFAULT = [
  { kategori: 'Kebutuhan Pokok', subkategori: 'Makanan & Minuman', anggaranBulanan: 2000000 },
  { kategori: 'Kebutuhan Pokok', subkategori: 'Transportasi', anggaranBulanan: 800000 },
  { kategori: 'Kebutuhan Pokok', subkategori: 'Utilitas (Listrik/Air/Net)', anggaranBulanan: 600000 },
  { kategori: 'Kebutuhan Pokok', subkategori: 'Kesehatan', anggaranBulanan: 500000 },
  { kategori: 'Kebutuhan Pokok', subkategori: 'Perlengkapan Rumah', anggaranBulanan: 300000 },
  { kategori: 'Gaya Hidup', subkategori: 'Hiburan & Hobi', anggaranBulanan: 500000 },
  { kategori: 'Gaya Hidup', subkategori: 'Belanja Pakaian', anggaranBulanan: 400000 },
  { kategori: 'Gaya Hidup', subkategori: 'Makan di Luar', anggaranBulanan: 600000 },
  { kategori: 'Gaya Hidup', subkategori: 'Langganan (Streaming dll)', anggaranBulanan: 200000 },
  { kategori: 'Investasi', subkategori: 'Tabungan Darurat', anggaranBulanan: 1000000 },
  { kategori: 'Investasi', subkategori: 'Investasi Rutin', anggaranBulanan: 1500000 },
  { kategori: 'Lain-lain', subkategori: 'Sosial & Hadiah', anggaranBulanan: 300000 },
  { kategori: 'Lain-lain', subkategori: 'Tak Terduga', anggaranBulanan: 500000 },
];

export const METODE_BAYAR = [
  'Tunai', 'Transfer Bank', 'Kartu Debit', 'Kartu Kredit',
  'Dompet Digital (GoPay/OVO/Dana)', 'QRIS', 'Cicilan', 'Lainnya',
];

export const METODE_BAYAR_EN = [
  'Cash', 'Bank Transfer', 'Debit Card', 'Credit Card',
  'Digital Wallet', 'QRIS', 'Installment', 'Other',
];

export const JENIS_INVESTASI = [
  'Saham Indonesia (IDX)', 'Saham AS (NYSE/NASDAQ)',
  'Saham Asia (HKG/SGX/TYO/dll)', 'Saham Eropa (LSE/ETR/EPA/dll)',
  'ETF', 'Reksa Dana', 'Obligasi/SBN', 'Kripto', 'Emas', 'Deposito', 'Lainnya',
];

export const JENIS_INVESTASI_EN = [
  'Indonesian Stocks (IDX)', 'US Stocks (NYSE/NASDAQ)',
  'Asian Stocks (HKG/SGX/TYO/etc)', 'European Stocks (LSE/ETR/EPA/etc)',
  'ETF', 'Mutual Fund', 'Bonds/SBN', 'Crypto', 'Gold', 'Time Deposit', 'Other',
];

export const SATUAN_INVESTASI = ['Lot (=100 lembar)', 'Lembar', 'Unit', 'Gram', 'Keping', 'Lainnya'];
export const SATUAN_INVESTASI_EN = ['Lot (=100 shares)', 'Share', 'Unit', 'Gram', 'Piece', 'Other'];

export const PLATFORM_INVESTASI = [
  'Stockbit', 'BCA Sekuritas', 'Mandiri Sekuritas', 'Mirae Asset',
  'Bibit', 'Bareksa', 'Tokopedia Investasi', 'Pluang',
  'Indodax', 'Binance', 'Interactive Brokers', 'Lainnya',
];

export const JENIS_UTANG = [
  'KPR', 'KKB (Kredit Kendaraan)', 'Kartu Kredit', 'KTA (Kredit Tanpa Agunan)',
  'Pinjaman Keluarga/Teman', 'Pinjaman Online', 'Kredit Elektronik', 'Cicilan 0%', 'Lainnya',
];

export const JENIS_UTANG_EN = [
  'Mortgage', 'Vehicle Loan', 'Credit Card', 'Personal Loan',
  'Family/Friend Loan', 'Online Loan', 'Electronic Credit', '0% Installment', 'Other',
];

export function mataUangDariJenis(jenis) {
  const j = String(jenis || '').toLowerCase();
  if (j.includes('indonesia') || j.includes('idx')) return 'IDR';
  if (j.includes(' as') || j.includes('nyse') || j.includes('nasdaq') || j.includes('us stock')) return 'USD';
  if (j.includes('kripto') || j.includes('crypto') || j.includes('etf')) return 'USD';
  if (j.includes('hkg')) return 'HKD';
  if (j.includes('sgx')) return 'SGD';
  if (j.includes('tyo')) return 'JPY';
  if (j.includes('lon') || j.includes('lse')) return 'GBP';
  if (j.includes('etr') || j.includes('epa') || j.includes('eropa') || j.includes('european')) return 'EUR';
  return 'IDR';
}

export function isAutoFetchable(jenis) {
  const j = String(jenis || '').toLowerCase();
  return j.includes(' as') || j.includes('nyse') || j.includes('nasdaq') ||
    j.includes('kripto') || j.includes('crypto') || j.includes('etf') ||
    j.includes('asia') || j.includes('eropa') || j.includes('european');
}

export const GOAL_COLORS = [
  '#4a90d9', '#1e3a5f', '#10b981', '#f59e0b',
  '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4',
];

export const PIN_TIMEOUT_OPTIONS_ID = [
  { value: 'always', label: 'Selalu minta PIN' },
  { value: '1',      label: 'Setelah 1 menit' },
  { value: '5',      label: 'Setelah 5 menit' },
  { value: '15',     label: 'Setelah 15 menit' },
  { value: '30',     label: 'Setelah 30 menit' },
  { value: 'never',  label: 'Tidak perlu PIN' },
];

export const PIN_TIMEOUT_OPTIONS_EN = [
  { value: 'always', label: 'Always require PIN' },
  { value: '1',      label: 'After 1 minute' },
  { value: '5',      label: 'After 5 minutes' },
  { value: '15',     label: 'After 15 minutes' },
  { value: '30',     label: 'After 30 minutes' },
  { value: 'never',  label: 'Never require PIN' },
];
