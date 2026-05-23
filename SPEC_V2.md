# MASTER SPECIFICATION — Keuangan Pribadi v2.0
# Generated: 2026-05 | Status: APPROVED & FINAL

## TECH STACK CHANGES
- Frontend  : React 18 + Vite + Tailwind CSS (unchanged)
- Hosting   : Vercel (moved from Firebase Hosting)
- API Proxy : Vercel Serverless /api/quotes.js → Yahoo Finance
- Database  : Firebase Firestore (unchanged)
- Auth      : Firebase Authentication (unchanged)
- Storage   : Firebase Storage (NEW — foto profil + struk)
- Charts    : Recharts (unchanged)
- New libs  : @dnd-kit/core, driver.js, html2pdf.js, SheetJS, date-fns

## NEW DEPENDENCIES
- @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities → drag & drop referensi
- driver.js → guided tour (lightweight, no framework dep)
- html2pdf.js → PDF export laporan
- xlsx (SheetJS) → Excel export laporan (already in pkg?)
- firebase/storage → foto profil + struk

## FIRESTORE NEW COLLECTIONS
users/{uid}/
  profile/          → { username, photoURL, displayName, lang, pinHash,
                        pinTimeout, tourCompleted, notifSettings }
  notifications/    → { type, message, read, createdAt, link }
  utang/{id}/
    pembayaran/     → { jumlah, tanggal, sisaPokokBefore, catatan }
  transaksi/{id}/   → tambah field: catatan, strukURL, isRecurring
  watchlist/        → { symbol, name, region, sortOrder }
  goals/            → { nama, target, current, deadline, kategori, warna }
  networth_snapshots/ → { tanggal, totalAset, totalUtang, netWorth }

## PAGES (new/modified)
- /dashboard        → + Financial Health Score card, + Net Worth chart
- /transaksi        → + foto struk, + catatan, fix CSV, fix decimal
- /anggaran         → + Multi-period comparison tab
- /investasi        → + 3-tab view, + currency conversion, + 31 currencies
- /dividen          → fix subkategori filter
- /utang            → + riwayat pembayaran, + undo
- /referensi        → + drag & drop sort
- /laporan          → NEW: weekly/monthly/yearly, PDF+Excel
- /watchlist        → NEW: 35 global indices
- /goals            → NEW: financial targets
- /bantuan          → NEW: full help page
- /settings         → NEW: all settings hub
- /profil           → NEW: user profile management

## NAVIGATION CHANGES
Sidebar items (13 total):
  📊 Dashboard | 💸 Transaksi | 📅 Anggaran | 📈 Investasi
  💰 Dividen | 🏦 Utang | 🌍 Watchlist | 🎯 Goals
  📋 Laporan | ⚙️ Referensi | 🔧 Settings | ❓ Bantuan

Bottom nav mobile (5): Dashboard, Transaksi, Investasi, Laporan, Settings

## CURRENCIES (31 total)
IDR MYR PHP THB VND AUD CNY HKD INR JPY KRW SGD TWD
USD BRL CAD CLP COP MXN NOK PLN GBP EUR CHF ILS
QAR RUB SAR ZAR TRY AED

## 35 GLOBAL INDICES WITH YAHOO TICKERS
^JKSE  ^KLSE  ^PSEI   ^STI    ^SET.BK  ^VNINDEX.VN  ^AORD
000001.SS  ^HSI  ^BSESN  ^N225  ^KS11  ^TWII  ^BVSP
^GSPTSE  ^IPSA  ^COLCAP  ^MXX  ^DJI  ^ATX  ^FCHI
^GDAXI  ^ISEQ  ^TA35  OSEBX.OL  WIG.WA  ^QSI  IMOEX.ME
^TASI.SR  ^J203.JO  ^IBEX  ^SSMI  ^XU100.IS  ^DFMGI  ^FTSE

## DEFAULT WATCHLIST (shown to new users)
^DJI ^JKSE ^N225 ^HSI ^GDAXI ^FTSE ^BSESN ^KS11 ^TWII ^STI

## SECURITY RULES
- PIN: 4-digit, SHA-256 hashed, stored localStorage
- PIN timeout options: always | 1min | 5min | 15min | 30min | never
- Firebase Storage rules: users can only access own files
- Confirmation dialogs: delete, bulk actions, data restore, undo payment,
  change email, change password, clear all data

## NOTIFICATION TYPES
- BUDGET_WARNING_80   : anggaran kategori mencapai 80%
- BUDGET_EXCEEDED     : anggaran kategori terlampaui
- DEBT_DUE_7DAYS      : utang jatuh tempo dalam 7 hari
- DEBT_DUE_TODAY      : utang jatuh tempo hari ini
- HEALTH_SCORE_LOW    : financial health score < 40
- GOAL_ACHIEVED       : target keuangan tercapai
- GOAL_NEAR           : target keuangan 90% tercapai

## FINANCIAL HEALTH SCORE METRICS
1. Rasio tabungan >= 20%      : 25 pts
2. Rasio cicilan utang < 30%  : 25 pts
3. Anggaran tidak melebihi    : 20 pts
4. Dana darurat >= 3x pengeluaran bulanan
   (dihitung dari transaksi tagged Tabungan Darurat) : 20 pts
5. Investasi aktif (ada aset) : 10 pts
Total: 100 pts
🔴 0-39: Kritis | 🟡 40-69: Perlu Perhatian | 🟢 70-100: Sehat

## CSV IMPORT — SUPPORTED FORMATS
1. Format app sendiri (export dari app ini)
2. BCA (format export mutasi m-BCA)
3. Mandiri (format export mutasi Livin)
4. Generic (tanggal, keterangan, debit, kredit — user map kolom)

## GUIDED TOUR STEPS (10 steps)
1. Welcome → overview app
2. Dashboard → penjelasan kartu-kartu
3. Tambah Transaksi → cara input transaksi pertama
4. Anggaran → cara set anggaran bulanan
5. Investasi → cara tambah portofolio
6. Utang → cara tambah & update cicilan
7. Dividen → cara baca rekap dividen
8. Watchlist → cara pantau indeks global
9. Goals → cara buat target keuangan
10. Settings → cara setup profil & PIN

## REPORT STRUCTURE
Weekly  : Senin-Minggu, ringkasan transaksi + top kategori
Monthly : per bulan, full breakdown + chart + vs bulan lalu
Yearly  : per tahun, semua modul, net worth trend
Header  : Logo app + nama user + periode + tanggal cetak
Export  : PDF (A4, portrait) + Excel (.xlsx, multi-sheet)
