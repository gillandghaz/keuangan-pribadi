import { useState } from 'react';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { REFERENSI_DEFAULT, ANGGARAN_DEFAULT } from '../lib/seedData';
import Modal from '../components/ui/Modal';
import { Btn } from '../components/ui/Form';

export async function checkAndSeed(uid, addToast) {
  try {
    const snap = await getDocs(collection(db, 'users', uid, 'referensi'));
    if (snap.size > 0) return false; // already seeded

    // Seed referensi
    for (const row of REFERENSI_DEFAULT) {
      await addDoc(collection(db, 'users', uid, 'referensi'), {
        ...row,
        createdAt: serverTimestamp(),
      });
    }
    // Seed anggaran
    for (const row of ANGGARAN_DEFAULT) {
      await addDoc(collection(db, 'users', uid, 'anggaran'), {
        ...row,
        createdAt: serverTimestamp(),
      });
    }
    if (addToast) addToast('Data awal berhasil dimuat!', 'success');
    return true;
  } catch (e) {
    if (addToast) addToast('Gagal memuat data awal: ' + e.message, 'error');
    return false;
  }
}

export default function WelcomeModal({ open, onClose, onSeed }) {
  const [loading, setLoading] = useState(false);

  async function handleStart() {
    setLoading(true);
    await onSeed();
    setLoading(false);
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="🎉 Selamat Datang!" size="md">
      <div className="space-y-4">
        <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
          Selamat datang di <strong>Keuangan Pribadi</strong>! Aplikasi ini membantu Anda
          mencatat transaksi, memantau anggaran, investasi, dan utang secara gratis.
        </p>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800
          rounded-xl p-4 space-y-2">
          <p className="text-sm font-semibold text-[#1e3a5f] dark:text-blue-200">
            Kami akan menyiapkan data awal untuk Anda:
          </p>
          <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
            <li>✅ 43 referensi kategori & subkategori</li>
            <li>✅ 13 anggaran bulanan default</li>
            <li>✅ Semua dapat diubah sesuai kebutuhan</li>
          </ul>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          Data tersimpan aman di Firebase milik Anda sendiri. Tidak ada iklan, tidak ada biaya tersembunyi.
        </p>

        <div className="flex gap-3 pt-2">
          <Btn onClick={handleStart} disabled={loading} className="flex-1">
            {loading ? '⏳ Memuat data…' : '🚀 Mulai Sekarang'}
          </Btn>
        </div>
      </div>
    </Modal>
  );
}
