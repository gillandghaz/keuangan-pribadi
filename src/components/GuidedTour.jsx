import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { useLang } from '../context/LangContext';

export default function GuidedTour() {
  const navigate = useNavigate();
  const location = useLocation();
  const { lang } = useLang();

  useEffect(() => {
    // Only show once — on first login or when manually triggered
    const completed = localStorage.getItem('tourCompleted');
    const isFirstLogin = localStorage.getItem('isFirstLogin') === 'true';

    function startTour() {
      const isID = lang === 'id';

      const driverObj = driver({
        showProgress: true,
        animate: true,
        overlayColor: 'rgba(0,0,0,0.6)',
        smoothScroll: true,
        allowClose: true,
        progressText: isID ? 'Langkah {{current}} dari {{total}}' : 'Step {{current}} of {{total}}',
        nextBtnText: isID ? 'Lanjut →' : 'Next →',
        prevBtnText: isID ? '← Kembali' : '← Back',
        doneBtnText: isID ? '✅ Selesai' : '✅ Done',
        onDestroyStarted: () => {
          localStorage.setItem('tourCompleted', 'true');
          localStorage.removeItem('isFirstLogin');
          driverObj.destroy();
        },
        steps: [
          {
            popover: {
              title: isID ? '👋 Selamat Datang!' : '👋 Welcome!',
              description: isID
                ? 'Ini adalah tur singkat Keuangan Pribadi. Kami akan menunjukkan fitur-fitur utama. Klik "Lanjut" untuk memulai, atau "Selesai" untuk melewati.'
                : 'This is a quick tour of Keuangan Pribadi. We\'ll show you the main features. Click "Next" to start, or "Done" to skip.',
              side: 'center',
            },
          },
          {
            element: '[data-tour="sidebar"]',
            popover: {
              title: isID ? '🗂️ Menu Navigasi' : '🗂️ Navigation Menu',
              description: isID
                ? 'Gunakan menu ini untuk berpindah antar halaman. Di desktop, klik ◀ di pojok kiri atas untuk memperkecil sidebar.'
                : 'Use this menu to navigate between pages. On desktop, click ◀ in the top left to collapse the sidebar.',
              side: 'right',
            },
          },
          {
            element: '[data-tour="dashboard-cashflow"]',
            popover: {
              title: isID ? '💵 Arus Kas' : '💵 Cash Flow',
              description: isID
                ? 'Ringkasan pemasukan, pengeluaran, dan saldo bersih bulan ini. Rasio tabungan dihitung otomatis.'
                : 'Summary of income, expenses, and net balance this month. Savings rate is calculated automatically.',
              side: 'bottom',
            },
          },
          {
            element: '[data-tour="health-score"]',
            popover: {
              title: isID ? '💯 Skor Kesehatan' : '💯 Health Score',
              description: isID
                ? 'Skor 0–100 berdasarkan 5 metrik: rasio tabungan, rasio cicilan, anggaran, dana darurat, dan investasi aktif.'
                : 'A score of 0–100 based on 5 metrics: savings rate, debt ratio, budget, emergency fund, and active investments.',
              side: 'bottom',
            },
          },
          {
            element: '[data-tour="add-transaksi"]',
            popover: {
              title: isID ? '💸 Tambah Transaksi' : '💸 Add Transaction',
              description: isID
                ? 'Klik tombol ini untuk mencatat pemasukan atau pengeluaran. Tersedia filter, pencarian, dan export CSV.'
                : 'Click this button to record income or expenses. Filter, search, and CSV export are available.',
              side: 'left',
            },
          },
          {
            element: '[data-tour="anggaran-status"]',
            popover: {
              title: isID ? '📅 Status Anggaran' : '📅 Budget Status',
              description: isID
                ? 'Status badge menunjukkan kondisi anggaran: Aman (≤50%), Waspada (≤80%), Kritis (≤100%), Melebihi (>100%).'
                : 'Status badges show budget condition: Safe (≤50%), Caution (≤80%), Critical (≤100%), Exceeded (>100%).',
              side: 'right',
            },
          },
          {
            element: '[data-tour="investasi-perbarui"]',
            popover: {
              title: isID ? '📈 Perbarui Harga Otomatis' : '📈 Auto-Update Prices',
              description: isID
                ? 'Klik tombol ini untuk mengambil harga terkini saham AS, kripto, dan indeks global via Yahoo Finance.'
                : 'Click this button to fetch the latest prices for US stocks, crypto, and global indices via Yahoo Finance.',
              side: 'bottom',
            },
          },
          {
            element: '[data-tour="notif-bell"]',
            popover: {
              title: isID ? '🔔 Notifikasi' : '🔔 Notifications',
              description: isID
                ? 'Notifikasi peringatan anggaran, jatuh tempo utang, dan pencapaian target muncul di sini — tidak mengganggu UI.'
                : 'Budget warnings, debt due dates, and goal achievements appear here — without disrupting the UI.',
              side: 'bottom',
            },
          },
          {
            element: '[data-tour="watchlist"]',
            popover: {
              title: isID ? '🌍 Watchlist Indeks' : '🌍 Index Watchlist',
              description: isID
                ? 'Pantau 35 indeks saham global. Harga diperbarui otomatis setiap 5 menit. Tambah/hapus indeks sesuai kebutuhan.'
                : 'Monitor 35 global stock indices. Prices auto-update every 5 minutes. Add/remove indices as needed.',
              side: 'right',
            },
          },
          {
            element: '[data-tour="settings"]',
            popover: {
              title: isID ? '🔧 Pengaturan' : '🔧 Settings',
              description: isID
                ? 'Atur profil, foto, dark mode, bahasa, PIN lock, backup data, dan notifikasi semuanya di sini.'
                : 'Manage profile, photo, dark mode, language, PIN lock, data backup, and notifications all here.',
              side: 'right',
            },
          },
          {
            popover: {
              title: isID ? '🎉 Siap!' : '🎉 Ready!',
              description: isID
                ? 'Tur selesai! Mulailah dengan mencatat transaksi pertama Anda. Jika butuh bantuan, kunjungi halaman ❓ Bantuan.'
                : 'Tour complete! Start by recording your first transaction. If you need help, visit the ❓ Help page.',
              side: 'center',
            },
          },
        ],
      });

      driverObj.drive();
    }

    // Listen for manual trigger from Bantuan page
    function handleStartTour() { startTour(); }
    window.addEventListener('startTour', handleStartTour);

    // Auto-start for first-time users on dashboard
    if (isFirstLogin && location.pathname === '/dashboard') {
      setTimeout(startTour, 1000);
    }

    return () => window.removeEventListener('startTour', handleStartTour);
  }, [lang, location.pathname]);

  return null; // No UI — just logic
}
