// Internationalization — supports 'id' (Bahasa Indonesia) and 'en' (English)

export const TRANSLATIONS = {
  id: {
    // Navigation
    nav: {
      dashboard: 'Dashboard', transaksi: 'Transaksi', anggaran: 'Anggaran',
      investasi: 'Investasi', dividen: 'Dividen', utang: 'Utang & Cicilan',
      watchlist: 'Watchlist', goals: 'Target Keuangan', laporan: 'Laporan',
      referensi: 'Referensi', settings: 'Pengaturan', bantuan: 'Bantuan',
      profil: 'Profil',
    },
    // Common
    common: {
      simpan: 'Simpan', batal: 'Batal', hapus: 'Hapus', edit: 'Edit',
      tambah: 'Tambah', tutup: 'Tutup', ya: 'Ya', tidak: 'Tidak',
      loading: 'Memuat...', kosong: 'Belum ada data', cari: 'Cari...',
      export: 'Export', import: 'Import', filter: 'Filter', reset: 'Reset',
      semua: 'Semua', konfirmasi: 'Konfirmasi', lanjut: 'Lanjutkan',
      kembali: 'Kembali', selesai: 'Selesai', skip: 'Lewati',
      berhasil: 'Berhasil', gagal: 'Gagal', peringatan: 'Peringatan',
      opsional: 'Opsional', wajib: 'Wajib', total: 'Total',
      tanggal: 'Tanggal', keterangan: 'Keterangan', jumlah: 'Jumlah',
      status: 'Status', aksi: 'Aksi', catatan: 'Catatan', nama: 'Nama',
      keluar: 'Keluar', masuk: 'Masuk', daftar: 'Daftar',
    },
    // Auth
    auth: {
      login: 'Masuk', register: 'Daftar Akun', logout: 'Keluar',
      email: 'Email', password: 'Password', confirmPassword: 'Konfirmasi Password',
      forgotPassword: 'Lupa password?', resetPassword: 'Reset Password',
      loginTitle: 'Masuk ke Akun', registerTitle: 'Buat Akun Baru',
      noAccount: 'Belum punya akun?', hasAccount: 'Sudah punya akun?',
      resetSent: 'Link reset telah dikirim ke email Anda',
      verifyEmail: 'Verifikasi email telah dikirim',
    },
    // Dashboard
    dashboard: {
      title: 'Dashboard', arusKas: 'Arus Kas Bulan Ini',
      rekapTahun: 'Rekap Tahun', kontrolAnggaran: 'Kontrol Anggaran',
      ringkasanUtang: 'Ringkasan Utang Aktif', portofolio: 'Portofolio Investasi',
      topPengeluaran: 'Top 5 Pengeluaran Bulan Ini',
      trendChart: 'Pemasukan vs Pengeluaran (12 Bulan)',
      dividenRingkasan: 'Dividen Ringkasan', healthScore: 'Skor Kesehatan Keuangan',
      netWorth: 'Kekayaan Bersih', pemasukan: 'Pemasukan', pengeluaran: 'Pengeluaran',
      saldoBersih: 'Saldo Bersih', rasioTabungan: 'Rasio Tabungan',
      totalDividen: 'Total Dividen', totalAnggaran: 'Total Anggaran',
      terpakai: 'Terpakai', sisaAnggaran: 'Sisa Anggaran',
      kategoriMelebihi: 'Kategori Melebihi', totalSisaUtang: 'Total Sisa Utang',
      totalCicilan: 'Cicilan/Bulan', ratioCicilan: 'Rasio Cicilan',
      totalModal: 'Total Modal', nilaiSekarang: 'Nilai Sekarang',
      untungRugi: 'Untung/Rugi', returnTotal: 'Return Total',
      aman: 'Aman', waspada: 'WASPADA',
    },
    // Transaksi
    transaksi: {
      title: 'Transaksi', tambah: 'Tambah Transaksi', edit: 'Edit Transaksi',
      jenis: 'Jenis', kategori: 'Kategori', subkategori: 'Subkategori',
      metodeBayar: 'Metode Pembayaran', pemasukan: 'Pemasukan', pengeluaran: 'Pengeluaran',
      lampirStruk: 'Lampirkan Struk', lihatStruk: 'Lihat Struk',
      exportCSV: 'Export CSV', importCSV: 'Import CSV',
      filterPanel: 'Panel Filter', dariTanggal: 'Dari Tanggal', sampaiTanggal: 'Sampai Tanggal',
      tipDividen: 'Untuk dividen: Jenis=Pemasukan, Subkategori=Dividen/Investasi',
      hapusKonfirmasi: 'Yakin menghapus transaksi ini?',
    },
    // Anggaran
    anggaran: {
      title: 'Anggaran', anggaranBulanan: 'Anggaran Bulanan',
      terpakai: 'Terpakai', sisa: 'Sisa', pctTerpakai: '% Terpakai',
      terapkanFilter: 'Terapkan Filter', belumTerpakai: 'Belum Terpakai',
      melebihi: 'MELEBIHI ANGGARAN', kritis: 'Kritis',
      perbandingan: 'Perbandingan Periode', bulanIni: 'Bulan Ini',
      bulanLalu: 'Bulan Lalu', rata3Bulan: 'Rata-rata 3 Bulan',
    },
    // Investasi
    investasi: {
      title: 'Investasi', namaAset: 'Nama Aset', kodeTicker: 'Kode Ticker',
      jenis: 'Jenis Aset', platform: 'Platform', tanggalBeli: 'Tanggal Beli',
      satuan: 'Satuan', hargaBeli: 'Harga Beli', hargaSekarang: 'Harga Sekarang',
      mataUang: 'Mata Uang', modalTotal: 'Modal Total', nilaiSekarang: 'Nilai Sekarang',
      untungRugi: 'Untung/Rugi', returnPct: 'Return %',
      perbarui: 'Perbarui Harga', semuaAset: 'Semua Aset',
      dalamNegeri: 'Dalam Negeri', luarNegeri: 'Luar Negeri',
      konversiKe: 'Konversi ke', disclaimer: '* Total bersifat estimasi (multi-mata uang)',
      idxInfo: 'Harga IDX tidak tersedia otomatis — input manual via Edit',
    },
    // Dividen
    dividen: {
      title: 'Dividen', totalTahunIni: 'Total Dividen Tahun Ini',
      bulanTerbanyak: 'Bulan Terbanyak', rataPerBulan: 'Rata-rata / Bulan',
      jumlahTransaksi: 'Jumlah Transaksi',
      infoBanner: 'Data diambil dari Transaksi dengan Subkategori "Dividen/Investasi"',
    },
    // Utang
    utang: {
      title: 'Utang & Cicilan', namaPinjaman: 'Nama Pinjaman',
      kreditor: 'Kreditor/Bank', pokokPinjaman: 'Pokok Pinjaman',
      bunga: 'Bunga %/Tahun', sisaTenor: 'Sisa Tenor (Bulan)',
      tanggalMulai: 'Tanggal Mulai', jatuhTempo: 'Jatuh Tempo',
      cicilanPerBulan: 'Cicilan/Bulan', sisaPokok: 'Sisa Pokok',
      sudahDibayar: 'Sudah Dibayar', updateBayar: 'Update Pembayaran',
      riwayat: 'Riwayat Pembayaran', undoBayar: 'Batalkan Pembayaran Terakhir',
      undoKonfirmasi: 'Yakin membatalkan pembayaran terakhir? Sisa pokok akan dikembalikan.',
      lunas: 'Lunas', aktif: 'Aktif', macet: 'Macet',
    },
    // Watchlist
    watchlist: {
      title: 'Watchlist Indeks', tambahIndeks: 'Tambah Indeks',
      hapusIndeks: 'Hapus dari Watchlist', region: 'Region',
      nilaiTerakhir: 'Nilai Terakhir', perubahan: 'Perubahan',
      pctPerubahan: '% Perubahan', terakhirUpdate: 'Terakhir Update',
      autoRefresh: 'Auto-refresh 5 menit', naik: 'Naik', turun: 'Turun',
      asia: 'Asia', eropa: 'Eropa', amerika: 'Amerika',
      timurTengah: 'Timur Tengah', lainnya: 'Lainnya',
    },
    // Goals
    goals: {
      title: 'Target Keuangan', namaTarget: 'Nama Target',
      jumlahTarget: 'Jumlah Target', jumlahTerkumpul: 'Terkumpul',
      deadline: 'Target Tanggal', progress: 'Progress',
      estimasiTercapai: 'Estimasi Tercapai', tercapai: 'Tercapai!',
      hampirTercapai: 'Hampir Tercapai', belumMulai: 'Belum Mulai',
      updateProgress: 'Update Progress',
    },
    // Laporan
    laporan: {
      title: 'Laporan Keuangan', mingguan: 'Mingguan', bulanan: 'Bulanan',
      tahunan: 'Tahunan', exportPDF: 'Export PDF', exportExcel: 'Export Excel',
      pilihPeriode: 'Pilih Periode', generate: 'Buat Laporan',
      ringkasan: 'Ringkasan', breakdown: 'Breakdown Kategori',
      perbandingan: 'Perbandingan', topPengeluaran: 'Top Pengeluaran',
      kinerjaInvestasi: 'Kinerja Investasi', statusUtang: 'Status Utang',
    },
    // Referensi
    referensi: {
      title: 'Referensi Kategori', tambah: 'Tambah Referensi',
      hapusKonfirmasi: 'Menghapus referensi akan mempengaruhi semua dropdown di aplikasi.',
      urutkan: 'Geser untuk mengurutkan',
    },
    // Settings
    settings: {
      title: 'Pengaturan', profil: 'Profil', tampilan: 'Tampilan',
      keamanan: 'Keamanan', notifikasi: 'Notifikasi', data: 'Data & Backup',
      tentang: 'Tentang Aplikasi', darkMode: 'Mode Gelap', bahasa: 'Bahasa',
      sidebarDefault: 'Sidebar Default', pinLock: 'PIN Lock',
      pinTimeout: 'Timeout PIN', aktifkanPIN: 'Aktifkan PIN Lock',
      gantiPIN: 'Ganti PIN', backupData: 'Backup Data', restoreData: 'Restore Data',
      hapusSemua: 'Hapus Semua Data', hapusSemuaKonfirmasi: 'Tindakan ini tidak dapat dibatalkan! Semua data Anda akan dihapus permanen.',
      versi: 'Versi',
    },
    // Notifikasi
    notif: {
      title: 'Notifikasi', tandaiDibaca: 'Tandai Dibaca', bacaSemua: 'Baca Semua',
      kosong: 'Tidak ada notifikasi baru',
      budgetWarning: 'Anggaran {{kategori}} sudah {{pct}}% terpakai',
      budgetExceeded: 'Anggaran {{kategori}} telah melebihi batas!',
      debtDue7: 'Utang "{{nama}}" jatuh tempo dalam 7 hari',
      debtDueToday: 'Utang "{{nama}}" jatuh tempo hari ini!',
      healthLow: 'Skor kesehatan keuangan Anda rendah ({{score}}). Lihat saran perbaikan.',
      goalAchieved: 'Selamat! Target "{{nama}}" telah tercapai! 🎉',
      goalNear: 'Target "{{nama}}" sudah 90% tercapai!',
    },
    // Health Score
    health: {
      title: 'Skor Kesehatan Keuangan', sehat: 'Sehat', perluPerhatian: 'Perlu Perhatian',
      kritis: 'Kritis', saranPerbaikan: 'Saran Perbaikan',
      rasioTabungan: 'Rasio Tabungan ≥ 20%', ratioCicilan: 'Rasio Cicilan < 30%',
      anggaran: 'Anggaran Terkontrol', danadarurat: 'Dana Darurat ≥ 3 Bulan',
      investasi: 'Investasi Aktif',
    },
    // Bantuan
    bantuan: {
      title: 'Panduan Penggunaan', mulaiCepat: 'Mulai Cepat',
      faq: 'FAQ', tips: 'Tips & Trik', mulaiTour: 'Mulai Guided Tour',
    },
    // Pin
    pin: {
      title: 'Masukkan PIN', setup: 'Buat PIN Baru', confirm: 'Konfirmasi PIN',
      wrong: 'PIN salah, coba lagi', mismatch: 'PIN tidak cocok',
      success: 'PIN berhasil diatur', forgot: 'Lupa PIN? Login ulang',
    },
    // Profil
    profil: {
      title: 'Profil Saya', username: 'Username', fotoProfil: 'Foto Profil',
      ubahFoto: 'Ubah Foto', ubahEmail: 'Ubah Email', ubahPassword: 'Ubah Password',
      emailBaru: 'Email Baru', passwordLama: 'Password Lama', passwordBaru: 'Password Baru',
      verifikasiDikirim: 'Email verifikasi telah dikirim',
    },
  },

  en: {
    nav: {
      dashboard: 'Dashboard', transaksi: 'Transactions', anggaran: 'Budget',
      investasi: 'Investments', dividen: 'Dividends', utang: 'Debt & Loans',
      watchlist: 'Watchlist', goals: 'Financial Goals', laporan: 'Reports',
      referensi: 'Categories', settings: 'Settings', bantuan: 'Help',
      profil: 'Profile',
    },
    common: {
      simpan: 'Save', batal: 'Cancel', hapus: 'Delete', edit: 'Edit',
      tambah: 'Add', tutup: 'Close', ya: 'Yes', tidak: 'No',
      loading: 'Loading...', kosong: 'No data yet', cari: 'Search...',
      export: 'Export', import: 'Import', filter: 'Filter', reset: 'Reset',
      semua: 'All', konfirmasi: 'Confirm', lanjut: 'Continue',
      kembali: 'Back', selesai: 'Done', skip: 'Skip',
      berhasil: 'Success', gagal: 'Failed', peringatan: 'Warning',
      opsional: 'Optional', wajib: 'Required', total: 'Total',
      tanggal: 'Date', keterangan: 'Description', jumlah: 'Amount',
      status: 'Status', aksi: 'Actions', catatan: 'Notes', nama: 'Name',
      keluar: 'Sign Out', masuk: 'Sign In', daftar: 'Register',
    },
    auth: {
      login: 'Sign In', register: 'Create Account', logout: 'Sign Out',
      email: 'Email', password: 'Password', confirmPassword: 'Confirm Password',
      forgotPassword: 'Forgot password?', resetPassword: 'Reset Password',
      loginTitle: 'Sign In to Your Account', registerTitle: 'Create New Account',
      noAccount: "Don't have an account?", hasAccount: 'Already have an account?',
      resetSent: 'Password reset link has been sent to your email',
      verifyEmail: 'Verification email has been sent',
    },
    dashboard: {
      title: 'Dashboard', arusKas: 'Cash Flow This Month',
      rekapTahun: 'Year Summary', kontrolAnggaran: 'Budget Control',
      ringkasanUtang: 'Active Debt Summary', portofolio: 'Investment Portfolio',
      topPengeluaran: 'Top 5 Expenses This Month',
      trendChart: 'Income vs Expenses (12 Months)',
      dividenRingkasan: 'Dividend Summary', healthScore: 'Financial Health Score',
      netWorth: 'Net Worth', pemasukan: 'Income', pengeluaran: 'Expenses',
      saldoBersih: 'Net Balance', rasioTabungan: 'Savings Rate',
      totalDividen: 'Total Dividends', totalAnggaran: 'Total Budget',
      terpakai: 'Used', sisaAnggaran: 'Budget Remaining',
      kategoriMelebihi: 'Categories Exceeded', totalSisaUtang: 'Total Remaining Debt',
      totalCicilan: 'Monthly Payment', ratioCicilan: 'Debt-to-Income',
      totalModal: 'Total Cost', nilaiSekarang: 'Current Value',
      untungRugi: 'Gain/Loss', returnTotal: 'Total Return',
      aman: 'Safe', waspada: 'WARNING',
    },
    transaksi: {
      title: 'Transactions', tambah: 'Add Transaction', edit: 'Edit Transaction',
      jenis: 'Type', kategori: 'Category', subkategori: 'Subcategory',
      metodeBayar: 'Payment Method', pemasukan: 'Income', pengeluaran: 'Expense',
      lampirStruk: 'Attach Receipt', lihatStruk: 'View Receipt',
      exportCSV: 'Export CSV', importCSV: 'Import CSV',
      filterPanel: 'Filter Panel', dariTanggal: 'From Date', sampaiTanggal: 'To Date',
      tipDividen: 'For dividends: Type=Income, Subcategory=Dividend/Investment',
      hapusKonfirmasi: 'Are you sure you want to delete this transaction?',
    },
    anggaran: {
      title: 'Budget', anggaranBulanan: 'Monthly Budget',
      terpakai: 'Used', sisa: 'Remaining', pctTerpakai: '% Used',
      terapkanFilter: 'Apply Filter', belumTerpakai: 'Not Used',
      melebihi: 'BUDGET EXCEEDED', kritis: 'Critical',
      perbandingan: 'Period Comparison', bulanIni: 'This Month',
      bulanLalu: 'Last Month', rata3Bulan: '3-Month Average',
    },
    investasi: {
      title: 'Investments', namaAset: 'Asset Name', kodeTicker: 'Ticker Symbol',
      jenis: 'Asset Type', platform: 'Platform', tanggalBeli: 'Purchase Date',
      satuan: 'Unit', hargaBeli: 'Buy Price', hargaSekarang: 'Current Price',
      mataUang: 'Currency', modalTotal: 'Total Cost', nilaiSekarang: 'Current Value',
      untungRugi: 'Gain/Loss', returnPct: 'Return %',
      perbarui: 'Update Prices', semuaAset: 'All Assets',
      dalamNegeri: 'Domestic', luarNegeri: 'International',
      konversiKe: 'Convert to', disclaimer: '* Total is approximate (multi-currency)',
      idxInfo: 'IDX prices not available automatically — use Edit for manual input',
    },
    dividen: {
      title: 'Dividends', totalTahunIni: 'Total Dividends This Year',
      bulanTerbanyak: 'Best Month', rataPerBulan: 'Average / Month',
      jumlahTransaksi: 'Transactions',
      infoBanner: 'Data sourced from Transactions with Subcategory "Dividend/Investment"',
    },
    utang: {
      title: 'Debt & Loans', namaPinjaman: 'Loan Name',
      kreditor: 'Lender/Bank', pokokPinjaman: 'Principal Amount',
      bunga: 'Interest %/Year', sisaTenor: 'Remaining Tenor (Months)',
      tanggalMulai: 'Start Date', jatuhTempo: 'Due Date',
      cicilanPerBulan: 'Monthly Payment', sisaPokok: 'Remaining Principal',
      sudahDibayar: 'Amount Paid', updateBayar: 'Update Payment',
      riwayat: 'Payment History', undoBayar: 'Undo Last Payment',
      undoKonfirmasi: 'Are you sure you want to undo the last payment? The remaining principal will be restored.',
      lunas: 'Paid Off', aktif: 'Active', macet: 'Defaulted',
    },
    watchlist: {
      title: 'Index Watchlist', tambahIndeks: 'Add Index',
      hapusIndeks: 'Remove from Watchlist', region: 'Region',
      nilaiTerakhir: 'Last Value', perubahan: 'Change',
      pctPerubahan: '% Change', terakhirUpdate: 'Last Updated',
      autoRefresh: 'Auto-refresh every 5 min', naik: 'Up', turun: 'Down',
      asia: 'Asia', eropa: 'Europe', amerika: 'Americas',
      timurTengah: 'Middle East', lainnya: 'Other',
    },
    goals: {
      title: 'Financial Goals', namaTarget: 'Goal Name',
      jumlahTarget: 'Target Amount', jumlahTerkumpul: 'Saved',
      deadline: 'Target Date', progress: 'Progress',
      estimasiTercapai: 'Estimated Completion', tercapai: 'Achieved!',
      hampirTercapai: 'Almost There', belumMulai: 'Not Started',
      updateProgress: 'Update Progress',
    },
    laporan: {
      title: 'Financial Reports', mingguan: 'Weekly', bulanan: 'Monthly',
      tahunan: 'Yearly', exportPDF: 'Export PDF', exportExcel: 'Export Excel',
      pilihPeriode: 'Select Period', generate: 'Generate Report',
      ringkasan: 'Summary', breakdown: 'Category Breakdown',
      perbandingan: 'Comparison', topPengeluaran: 'Top Expenses',
      kinerjaInvestasi: 'Investment Performance', statusUtang: 'Debt Status',
    },
    referensi: {
      title: 'Category References', tambah: 'Add Reference',
      hapusKonfirmasi: 'Deleting this reference will affect all dropdowns in the application.',
      urutkan: 'Drag to reorder',
    },
    settings: {
      title: 'Settings', profil: 'Profile', tampilan: 'Display',
      keamanan: 'Security', notifikasi: 'Notifications', data: 'Data & Backup',
      tentang: 'About', darkMode: 'Dark Mode', bahasa: 'Language',
      sidebarDefault: 'Default Sidebar', pinLock: 'PIN Lock',
      pinTimeout: 'PIN Timeout', aktifkanPIN: 'Enable PIN Lock',
      gantiPIN: 'Change PIN', backupData: 'Backup Data', restoreData: 'Restore Data',
      hapusSemua: 'Delete All Data', hapusSemuaKonfirmasi: 'This action cannot be undone! All your data will be permanently deleted.',
      versi: 'Version',
    },
    notif: {
      title: 'Notifications', tandaiDibaca: 'Mark as Read', bacaSemua: 'Read All',
      kosong: 'No new notifications',
      budgetWarning: '{{kategori}} budget is {{pct}}% used',
      budgetExceeded: '{{kategori}} budget has been exceeded!',
      debtDue7: 'Loan "{{nama}}" is due in 7 days',
      debtDueToday: 'Loan "{{nama}}" is due today!',
      healthLow: 'Your financial health score is low ({{score}}). See improvement tips.',
      goalAchieved: 'Congratulations! Goal "{{nama}}" has been achieved! 🎉',
      goalNear: 'Goal "{{nama}}" is 90% complete!',
    },
    health: {
      title: 'Financial Health Score', sehat: 'Healthy', perluPerhatian: 'Needs Attention',
      kritis: 'Critical', saranPerbaikan: 'Improvement Tips',
      rasioTabungan: 'Savings Rate ≥ 20%', ratioCicilan: 'Debt-to-Income < 30%',
      anggaran: 'Budget Controlled', danadarurat: 'Emergency Fund ≥ 3 Months',
      investasi: 'Active Investments',
    },
    bantuan: {
      title: 'User Guide', mulaiCepat: 'Quick Start',
      faq: 'FAQ', tips: 'Tips & Tricks', mulaiTour: 'Start Guided Tour',
    },
    pin: {
      title: 'Enter PIN', setup: 'Create New PIN', confirm: 'Confirm PIN',
      wrong: 'Wrong PIN, try again', mismatch: 'PINs do not match',
      success: 'PIN set successfully', forgot: 'Forgot PIN? Sign in again',
    },
    profil: {
      title: 'My Profile', username: 'Username', fotoProfil: 'Profile Photo',
      ubahFoto: 'Change Photo', ubahEmail: 'Change Email', ubahPassword: 'Change Password',
      emailBaru: 'New Email', passwordLama: 'Current Password', passwordBaru: 'New Password',
      verifikasiDikirim: 'Verification email has been sent',
    },
  },
};

// Template interpolation: t('notif.budgetWarning', { kategori: 'Makanan', pct: 80 })
export function interpolate(str, vars = {}) {
  return str.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? '');
}

export function getT(lang) {
  const tr = TRANSLATIONS[lang] || TRANSLATIONS.id;
  return function t(path, vars) {
    const keys = path.split('.');
    let val = tr;
    for (const k of keys) { val = val?.[k]; }
    const str = typeof val === 'string' ? val : path;
    return vars ? interpolate(str, vars) : str;
  };
}
