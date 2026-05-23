# 💰 Keuangan Pribadi

Aplikasi web manajemen keuangan pribadi lengkap berbasis React + Firebase. Gratis 100%, tanpa kartu kredit, tanpa biaya tersembunyi.

---

## ✨ Fitur Utama

| Modul | Fitur |
|-------|-------|
| 📊 **Dashboard** | Arus kas, rekap tahunan, kontrol anggaran, portofolio investasi, utang, chart 12 bulan |
| 💸 **Transaksi** | CRUD transaksi, filter & pencarian, pagination, export CSV |
| 📅 **Anggaran** | Anggaran bulanan, progress bar, status badge, filter tanggal |
| 📈 **Investasi** | Multi-aset, multi-mata uang, auto-fetch harga via Finnhub |
| 💰 **Dividen** | Rekap otomatis dari transaksi, catatan manual per bulan |
| 🏦 **Utang** | Kalkulator cicilan, update pembayaran, rasio cicilan |
| ⚙️ **Referensi** | Kelola kategori & subkategori, langsung berlaku di semua dropdown |

---

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS
- **Database**: Firebase Firestore (Spark Plan — gratis)
- **Auth**: Firebase Authentication (email + password)
- **Hosting**: Firebase Hosting atau Vercel
- **Charts**: Recharts
- **Stock API**: Finnhub (gratis, 60 req/menit) — saham AS & kripto

---

## 📋 Prasyarat

Sebelum mulai, pastikan sudah terinstal:

- **Node.js v18+** → [nodejs.org](https://nodejs.org)
- **npm** (sudah termasuk bersama Node.js)
- **Git** → [git-scm.com](https://git-scm.com)

Cek versi:
```bash
node -v   # harus v18.x ke atas
npm -v    # harus v9.x ke atas
```

---

## 🔧 LANGKAH 1 — Setup Firebase Project

### 1.1 Buat akun & project Firebase

1. Buka [console.firebase.google.com](https://console.firebase.google.com)
2. Klik **"Add project"** (Tambahkan project)
3. Beri nama project, misalnya: `keuangan-pribadi`
4. **Matikan Google Analytics** (tidak diperlukan, klik toggle → Continue)
5. Klik **"Create project"** → tunggu hingga selesai → klik **Continue**

### 1.2 Aktifkan Firebase Authentication

1. Di sidebar kiri, klik **"Build"** → **"Authentication"**
2. Klik **"Get started"**
3. Pilih tab **"Sign-in method"**
4. Klik **"Email/Password"**
5. Toggle **"Enable"** pada baris pertama (Email/Password) → **Save**

### 1.3 Buat Firestore Database

1. Di sidebar kiri, klik **"Build"** → **"Firestore Database"**
2. Klik **"Create database"**
3. Pilih **"Start in production mode"** → klik **Next**
4. Pilih region terdekat, misalnya: **`asia-southeast1` (Singapore)** → klik **Enable**
5. Tunggu database dibuat (biasanya 1–2 menit)

### 1.4 Atur Security Rules Firestore

1. Di halaman Firestore, klik tab **"Rules"**
2. **Hapus semua** isi yang ada
3. **Ganti dengan** ini (copy-paste):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null
                         && request.auth.uid == userId;
    }
  }
}
```

4. Klik **"Publish"**

### 1.5 Ambil Firebase Config

1. Di sidebar kiri, klik ikon **⚙️ (Project settings)**
2. Scroll ke bawah ke bagian **"Your apps"**
3. Klik ikon **`</>`** (Web app)
4. Daftarkan app: beri nama `keuangan-pribadi-web` → klik **"Register app"**
5. **JANGAN** centang Firebase Hosting dulu
6. Kamu akan melihat kode seperti ini — **simpan nilai-nilainya**:

```js
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "keuangan-pribadi-xxxxx.firebaseapp.com",
  projectId: "keuangan-pribadi-xxxxx",
  storageBucket: "keuangan-pribadi-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

7. Klik **"Continue to console"**

---

## 🔑 LANGKAH 2 — Dapatkan Finnhub API Key (Gratis)

Finnhub digunakan untuk mengambil harga saham AS dan kripto secara otomatis.

1. Buka [finnhub.io](https://finnhub.io)
2. Klik **"Get free API key"** di pojok kanan atas
3. Daftar dengan email (gratis, tanpa kartu kredit)
4. Verifikasi email
5. Masuk ke dashboard → API key sudah muncul di halaman utama
6. Contoh: `d1abc2def3ghi4jkl5`

> **Batas gratis**: 60 request/menit. Cukup untuk penggunaan normal.
> Saham IDX, Reksa Dana, Emas → input manual (tidak memerlukan API key).

---

## ⚙️ LANGKAH 3 — Setup Project Lokal

### 3.1 Clone atau download project

Jika menggunakan Git:
```bash
git clone <url-repo-kamu>
cd keuangan-pribadi
```

Atau ekstrak ZIP yang sudah didownload:
```bash
cd keuangan-pribadi
```

### 3.2 Install dependencies

```bash
npm install
```

Tunggu hingga selesai (biasanya 1–3 menit tergantung koneksi).

### 3.3 Buat file `.env`

Di root folder project, buat file baru bernama **`.env`** (bukan `.env.example`):

```bash
# Windows (Command Prompt)
copy .env.example .env

# Mac / Linux / Git Bash
cp .env.example .env
```

Buka file `.env` dengan teks editor dan isi dengan nilai dari Firebase config tadi:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=keuangan-pribadi-xxxxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=keuangan-pribadi-xxxxx
VITE_FIREBASE_STORAGE_BUCKET=keuangan-pribadi-xxxxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
VITE_FINNHUB_API_KEY=d1abc2def3ghi4jkl5
```

> ⚠️ **Penting**: File `.env` sudah ada di `.gitignore`. Jangan pernah commit file ini ke GitHub!

### 3.4 Jalankan aplikasi di mode development

```bash
npm run dev
```

Buka browser ke: **http://localhost:5173**

Kamu akan melihat halaman Login. Klik **"Daftar akun baru"** untuk membuat akun pertama.

---

## 🚀 LANGKAH 4 — Deploy ke Firebase Hosting

### 4.1 Install Firebase CLI

```bash
npm install -g firebase-tools
```

### 4.2 Login ke Firebase

```bash
firebase login
```

Browser akan terbuka → login dengan akun Google yang sama dengan Firebase project kamu.

### 4.3 Inisialisasi Firebase di project

```bash
firebase init
```

Jawab pertanyaan-pertanyaan berikut:

```
? Which Firebase features do you want to set up?
  → Pilih: Firestore, Hosting (gunakan SPASI untuk pilih, ENTER untuk konfirmasi)

? Please select an option:
  → Use an existing project

? Select a default Firebase project:
  → Pilih nama project kamu (keuangan-pribadi-xxxxx)

? What file should be used for Firestore Rules?
  → firestore.rules  (sudah ada, tekan ENTER)

? What file should be used for Firestore indexes?
  → firestore.indexes.json  (tekan ENTER, biarkan default)

? What do you want to use as your public directory?
  → dist

? Configure as a single-page app (rewrite all urls to /index.html)?
  → Yes

? Set up automatic builds and deploys with GitHub?
  → No

? File dist/index.html already exists. Overwrite?
  → No
```

### 4.4 Build project

```bash
npm run build
```

Ini akan membuat folder `dist/` berisi file siap produksi.

### 4.5 Deploy!

```bash
firebase deploy
```

Setelah selesai, kamu akan mendapat URL seperti:
```
✔  Deploy complete!
Hosting URL: https://keuangan-pribadi-xxxxx.web.app
```

Buka URL tersebut di browser — aplikasi sudah online! 🎉

### 4.6 Update setelah ada perubahan

Setiap kali ada perubahan kode:
```bash
npm run build
firebase deploy
```

---

## 🌐 LANGKAH 4 (Alternatif) — Deploy ke Vercel

Vercel lebih mudah jika kamu sudah punya akun GitHub.

### 4A.1 Push ke GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/username/keuangan-pribadi.git
git push -u origin main
```

### 4A.2 Deploy di Vercel

1. Buka [vercel.com](https://vercel.com) → login dengan GitHub
2. Klik **"New Project"**
3. Import repository `keuangan-pribadi`
4. Di bagian **"Environment Variables"**, tambahkan semua variabel dari file `.env`:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_FINNHUB_API_KEY`
5. Klik **"Deploy"**

Vercel akan otomatis build dan deploy. Setiap `git push` akan otomatis redeploy.

### 4A.3 Tambahkan domain Vercel ke Firebase Auth

Setelah deploy ke Vercel, tambahkan domain Vercel ke authorized domains Firebase:

1. Firebase Console → **Authentication** → **Settings** → **Authorized domains**
2. Klik **"Add domain"**
3. Masukkan domain Vercel kamu: `keuangan-pribadi.vercel.app`
4. Klik **"Add"**

---

## 📱 Penggunaan Pertama Kali

1. Buka aplikasi → klik **"Daftar akun baru"**
2. Masukkan email dan password → **Daftar**
3. Setelah login, **modal selamat datang** akan muncul
4. Klik **"Mulai Sekarang"** → aplikasi akan otomatis mengisi:
   - 43 referensi kategori & subkategori
   - 13 anggaran bulanan default
5. Mulai catat transaksi di menu **💸 Transaksi**

---

## 💡 Tips Penggunaan

### Mencatat Dividen
- Buat transaksi baru → Jenis: **Pemasukan** → Kategori: **Dividen/Investasi**
- Data akan otomatis muncul di halaman **💰 Dividen**

### Harga Saham Otomatis (Finnhub)
- Hanya untuk saham **AS (NYSE/NASDAQ)** dan **Kripto**
- Di halaman Investasi → klik tombol **"🔄 Perbarui Harga"**
- Saham IDX, Reksa Dana, Emas → klik **Edit** dan input harga manual

### Format Angka
- Input: ketik `1500000` atau `1.500.000` (keduanya diterima)
- Tampilan: selalu format Indonesia (`1.500.000`)

### Export Data
- Halaman Transaksi → tombol **"📥 Export CSV"**
- File CSV bisa dibuka di Excel/Google Sheets

---

## 🔒 Keamanan Data

- Setiap pengguna hanya bisa akses data miliknya sendiri (Firestore Rules)
- API key Finnhub bersifat public (frontend) — ini normal, Finnhub memang dirancang begitu
- Firebase API key bersifat identifikasi project, bukan password — dilindungi oleh Firestore Rules
- **Jangan share** file `.env` ke orang lain

---

## 📊 Batas Free Tier yang Perlu Diketahui

### Firebase Firestore (Spark Plan — Gratis Selamanya)
| Resource | Batas Gratis | Estimasi Penggunaan |
|----------|-------------|---------------------|
| Reads/hari | 50.000 | ~500 buka halaman/hari |
| Writes/hari | 20.000 | ~200 transaksi baru/hari |
| Deletes/hari | 20.000 | Sangat cukup |
| Storage | 1 GB | Cukup untuk ribuan transaksi |
| Network | 10 GB/bulan | Sangat cukup |

### Firebase Authentication (Gratis Selamanya)
- Tidak ada batas jumlah pengguna untuk email/password

### Firebase Hosting (Spark Plan)
| Resource | Batas Gratis |
|----------|-------------|
| Storage | 10 GB |
| Transfer/bulan | 360 MB/hari |

### Finnhub API (Free Tier)
| Resource | Batas |
|----------|-------|
| Request/menit | 60 |
| Saham realtime | US stocks, crypto, forex |
| Saham IDX | ❌ Tidak tersedia (input manual) |

> 💡 Untuk penggunaan pribadi sehari-hari, batas free tier ini **lebih dari cukup**.

---

## 🐛 Troubleshooting

### "Firebase: Error (auth/configuration-not-found)"
→ Pastikan nilai di file `.env` sudah benar, terutama `VITE_FIREBASE_AUTH_DOMAIN`

### "Missing or insufficient permissions"
→ Firestore Rules belum dipublish. Ulangi Langkah 1.4

### Halaman putih setelah deploy
→ Pastikan di Firebase Hosting sudah ada rewrite rule ke `index.html` (ada di `firebase.json`)

### Harga saham tidak ter-update
→ Cek apakah `VITE_FINNHUB_API_KEY` sudah diisi dengan benar di `.env`
→ Pastikan kode ticker benar (contoh: `AAPL`, `MSFT`, `BTC-USD`)

### "npm install" error
→ Coba: `npm install --legacy-peer-deps`

### Data tidak muncul setelah login
→ Cek koneksi internet
→ Buka Developer Tools (F12) → tab Console → lihat pesan error

---

## 🗂️ Struktur Folder

```
keuangan-pribadi/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Layout.jsx       # Main layout wrapper
│   │   │   ├── Navbar.jsx       # Top navigation bar
│   │   │   ├── Sidebar.jsx      # Desktop sidebar
│   │   │   └── BottomNav.jsx    # Mobile bottom navigation
│   │   ├── ui/
│   │   │   ├── Modal.jsx        # Reusable modal
│   │   │   ├── Toast.jsx        # Toast notifications
│   │   │   ├── Form.jsx         # Field, Input, Select, Btn
│   │   │   ├── NumberInput.jsx  # IDR-formatted number input
│   │   │   └── index.jsx        # Badge, Skeleton, EmptyState, ConfirmDialog
│   │   └── WelcomeModal.jsx     # First-login welcome + seed
│   ├── context/
│   │   ├── AuthContext.jsx      # Firebase auth state
│   │   ├── ThemeContext.jsx     # Dark/light mode
│   │   └── ReferensiContext.jsx # Global kategori store
│   ├── hooks/
│   │   └── useFirestore.js     # Generic Firestore CRUD
│   ├── lib/
│   │   ├── firebase.js         # Firebase init
│   │   ├── formatters.js       # rpFmt, tglFmt, parseRp, dll.
│   │   ├── seedData.js         # Default referensi & anggaran
│   │   └── finnhub.js          # Finnhub client + rate limiter
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Transaksi.jsx
│   │   ├── Anggaran.jsx
│   │   ├── Investasi.jsx
│   │   ├── Dividen.jsx
│   │   ├── Utang.jsx
│   │   └── Referensi.jsx
│   ├── App.jsx                  # Router + providers
│   ├── main.jsx                 # Entry point
│   └── index.css                # Tailwind + custom CSS
├── .env                         # ← BUAT SENDIRI (tidak di-commit)
├── .env.example                 # Template .env
├── .gitignore
├── firebase.json                # Firebase Hosting config
├── firestore.rules              # Firestore security rules
├── package.json
├── tailwind.config.js
├── vite.config.js
└── README.md
```

---

## 📞 Sumber Bantuan

- **Firebase Docs**: [firebase.google.com/docs](https://firebase.google.com/docs)
- **Finnhub Docs**: [finnhub.io/docs/api](https://finnhub.io/docs/api)
- **React Docs**: [react.dev](https://react.dev)
- **Tailwind CSS**: [tailwindcss.com/docs](https://tailwindcss.com/docs)
- **Vite Docs**: [vitejs.dev](https://vitejs.dev)

---

## 📄 Lisensi

MIT License — bebas digunakan, dimodifikasi, dan didistribusikan.
