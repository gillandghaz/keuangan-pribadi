import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useLang } from '../context/LangContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import { Btn, Field, Input } from '../components/ui/Form';
import { ConfirmDialog } from '../components/ui/index.jsx';
import { savePIN, clearPIN, getPINEnabled, setPINEnabled, getPINTimeout, setPINTimeout, hashPIN } from '../lib/security';
import { PIN_TIMEOUT_OPTIONS_ID, PIN_TIMEOUT_OPTIONS_EN } from '../lib/seedData';
import { db } from '../lib/firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import * as XLSX from 'xlsx';

const SECTIONS = ['profil', 'tampilan', 'keamanan', 'notifikasi', 'data', 'tentang'];

export default function Settings() {
  const { dark, toggle: toggleTheme } = useTheme();
  const { lang, setLanguage, t } = useLang();
  const { user } = useAuth();
  const addToast = useToast();
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState('profil');
  const [pinEnabled, setPinEnabledState] = useState(() => getPINEnabled());
  const [pinTimeout, setPinTimeoutState] = useState(() => getPINTimeout());
  const [showPINSetup, setShowPINSetup] = useState(false);
  const [pinStep, setPinStep] = useState('enter'); // enter | confirm
  const [pin1, setPin1] = useState('');
  const [pin2, setPin2] = useState('');
  const [confirmClearData, setConfirmClearData] = useState(false);
  const [backingUp, setBackingUp] = useState(false);
  const [restoring, setRestoring] = useState(false);

  const timeoutOptions = lang === 'id' ? PIN_TIMEOUT_OPTIONS_ID : PIN_TIMEOUT_OPTIONS_EN;

  // ── PIN Setup ─────────────────────────────────────────────
  function handlePINToggle(checked) {
    if (checked) {
      setShowPINSetup(true);
      setPinStep('enter');
      setPin1(''); setPin2('');
    } else {
      clearPIN();
      setPINEnabled(false);
      setPinEnabledState(false);
      addToast('PIN Lock dinonaktifkan', 'info');
    }
  }

  async function handlePINConfirm() {
    if (pin1.length !== 4) { addToast('PIN harus 4 digit', 'error'); return; }
    if (pinStep === 'enter') {
      setPinStep('confirm');
      setPin2('');
    } else {
      if (pin1 !== pin2) { addToast(t('pin.mismatch'), 'error'); setPinStep('enter'); setPin1(''); setPin2(''); return; }
      await savePIN(pin1);
      setPINEnabled(true);
      setPinEnabledState(true);
      setShowPINSetup(false);
      addToast(t('pin.success'), 'success');
    }
  }

  function handleTimeoutChange(val) {
    setPinTimeout(val);
    setPinTimeoutState(val);
  }

  // ── Backup ────────────────────────────────────────────────
  async function handleBackup() {
    if (!user) return;
    setBackingUp(true);
    try {
      const COLS = ['transaksi', 'anggaran', 'investasi', 'utang', 'referensi', 'dividen_notes', 'goals', 'notifications'];
      const backup = { version: '2.0', exportedAt: new Date().toISOString(), uid: user.uid, data: {} };
      for (const col of COLS) {
        const snap = await getDocs(collection(db, 'users', user.uid, col));
        backup.data[col] = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      }
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `keuangan-backup-${new Date().toISOString().slice(0,10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      addToast('Backup berhasil diunduh', 'success');
    } catch (e) { addToast('Backup gagal: ' + e.message, 'error'); }
    finally { setBackingUp(false); }
  }

  async function handleRestore(e) {
    const file = e.target.files[0];
    if (!file) return;
    setRestoring(true);
    try {
      const text = await file.text();
      const backup = JSON.parse(text);
      if (!backup.data || !backup.version) throw new Error('Format backup tidak valid');
      const { addDocument } = await import('../hooks/useFirestore');
      for (const [col, docs] of Object.entries(backup.data)) {
        for (const docData of docs) {
          const { id, ...data } = docData;
          await addDocument(user.uid, col, data);
        }
      }
      addToast(`Restore berhasil: ${Object.values(backup.data).flat().length} dokumen`, 'success');
    } catch (e) { addToast('Restore gagal: ' + e.message, 'error'); }
    finally { setRestoring(false); e.target.value = ''; }
  }

  async function handleClearAllData() {
    if (!user) return;
    try {
      const COLS = ['transaksi', 'anggaran', 'investasi', 'utang', 'referensi', 'dividen_notes', 'goals', 'notifications', 'watchlist'];
      for (const col of COLS) {
        const snap = await getDocs(collection(db, 'users', user.uid, col));
        for (const d of snap.docs) await deleteDoc(doc(db, 'users', user.uid, col, d.id));
      }
      addToast('Semua data telah dihapus', 'success');
    } catch (e) { addToast('Gagal: ' + e.message, 'error'); }
  }

  const sectionIcons = { profil:'👤', tampilan:'🎨', keamanan:'🔒', notifikasi:'🔔', data:'💾', tentang:'ℹ️' };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">
        🔧 {t('settings.title')}
      </h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-48 shrink-0">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
            {SECTIONS.map(sec => (
              <button
                key={sec}
                onClick={() => setActiveSection(sec)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors text-left
                  border-b border-slate-100 dark:border-slate-700/50 last:border-0
                  ${activeSection === sec
                    ? 'bg-[#4a90d9]/10 text-[#4a90d9] font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/30'}`}
              >
                <span>{sectionIcons[sec]}</span>
                <span className="capitalize">{t(`settings.${sec}`)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">

          {/* PROFIL */}
          {activeSection === 'profil' && (
            <div className="space-y-4">
              <h2 className="font-bold text-slate-800 dark:text-slate-100 mb-4">{t('settings.profil')}</h2>
              <Btn onClick={() => navigate('/profil')}>👤 {t('profil.title')} →</Btn>
            </div>
          )}

          {/* TAMPILAN */}
          {activeSection === 'tampilan' && (
            <div className="space-y-6">
              <h2 className="font-bold text-slate-800 dark:text-slate-100">{t('settings.tampilan')}</h2>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm text-slate-800 dark:text-slate-100">{t('settings.darkMode')}</p>
                  <p className="text-xs text-slate-500">{dark ? 'Mode Gelap aktif' : 'Mode Terang aktif'}</p>
                </div>
                <button onClick={toggleTheme}
                  className={`relative w-12 h-6 rounded-full transition-colors
                    ${dark ? 'bg-[#4a90d9]' : 'bg-slate-300'}`}>
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow
                    transition-transform ${dark ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm text-slate-800 dark:text-slate-100">{t('settings.bahasa')}</p>
                  <p className="text-xs text-slate-500">{lang === 'id' ? 'Bahasa Indonesia' : 'English'}</p>
                </div>
                <div className="flex gap-2">
                  {['id', 'en'].map(l => (
                    <button key={l} onClick={() => setLanguage(l)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors
                        ${lang === l
                          ? 'bg-[#1e3a5f] text-white'
                          : 'border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
                      {l === 'id' ? '🇮🇩 ID' : '🇺🇸 ENG'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* KEAMANAN */}
          {activeSection === 'keamanan' && (
            <div className="space-y-6">
              <h2 className="font-bold text-slate-800 dark:text-slate-100">{t('settings.keamanan')}</h2>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm text-slate-800 dark:text-slate-100">{t('settings.aktifkanPIN')}</p>
                  <p className="text-xs text-slate-500">Proteksi aplikasi dengan PIN 4 digit</p>
                </div>
                <button onClick={() => handlePINToggle(!pinEnabled)}
                  className={`relative w-12 h-6 rounded-full transition-colors
                    ${pinEnabled ? 'bg-[#4a90d9]' : 'bg-slate-300'}`}>
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow
                    transition-transform ${pinEnabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>

              {pinEnabled && (
                <>
                  <div>
                    <p className="font-medium text-sm text-slate-800 dark:text-slate-100 mb-2">{t('settings.pinTimeout')}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {timeoutOptions.map(opt => (
                        <button key={opt.value} onClick={() => handleTimeoutChange(opt.value)}
                          className={`px-3 py-2 rounded-lg text-xs transition-colors text-left
                            ${pinTimeout === opt.value
                              ? 'bg-[#1e3a5f] text-white font-semibold'
                              : 'border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Btn variant="ghost" onClick={() => { setShowPINSetup(true); setPinStep('enter'); setPin1(''); setPin2(''); }}>
                    🔑 {t('settings.gantiPIN')}
                  </Btn>
                </>
              )}

              {showPINSetup && (
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 space-y-3">
                  <p className="font-semibold text-sm text-slate-800 dark:text-slate-100">
                    {pinStep === 'enter' ? t('pin.setup') : t('pin.confirm')}
                  </p>
                  <Input
                    type="password"
                    maxLength={4}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={pinStep === 'enter' ? pin1 : pin2}
                    onChange={e => {
                      const v = e.target.value.replace(/\D/g,'').slice(0,4);
                      pinStep === 'enter' ? setPin1(v) : setPin2(v);
                    }}
                    placeholder="••••"
                    className="text-center text-2xl tracking-widest w-32"
                  />
                  <div className="flex gap-2">
                    <Btn onClick={handlePINConfirm}>
                      {pinStep === 'enter' ? t('common.lanjut') : t('common.simpan')}
                    </Btn>
                    <Btn variant="ghost" onClick={() => setShowPINSetup(false)}>{t('common.batal')}</Btn>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* NOTIFIKASI */}
          {activeSection === 'notifikasi' && (
            <div className="space-y-4">
              <h2 className="font-bold text-slate-800 dark:text-slate-100">{t('settings.notifikasi')}</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Notifikasi ditampilkan sebagai panel di sudut kanan atas — tidak mengganggu aktivitas Anda.
              </p>
              {[
                { key: 'budget', label: 'Peringatan anggaran (80% & melebihi)' },
                { key: 'debt', label: 'Jatuh tempo utang (7 hari & hari-H)' },
                { key: 'health', label: 'Skor kesehatan keuangan rendah' },
                { key: 'goal', label: 'Target keuangan tercapai / hampir tercapai' },
              ].map(item => {
                const stored = localStorage.getItem(`notif_${item.key}`) !== 'false';
                return (
                  <div key={item.key} className="flex items-center justify-between">
                    <p className="text-sm text-slate-800 dark:text-slate-100">{item.label}</p>
                    <button
                      onClick={() => {
                        const cur = localStorage.getItem(`notif_${item.key}`) !== 'false';
                        localStorage.setItem(`notif_${item.key}`, (!cur).toString());
                        addToast('Preferensi notifikasi disimpan', 'success');
                      }}
                      className={`relative w-12 h-6 rounded-full transition-colors
                        ${stored ? 'bg-[#4a90d9]' : 'bg-slate-300'}`}>
                      <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow
                        transition-transform ${stored ? 'translate-x-6' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* DATA */}
          {activeSection === 'data' && (
            <div className="space-y-4">
              <h2 className="font-bold text-slate-800 dark:text-slate-100">{t('settings.data')}</h2>

              <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-3">
                <p className="font-semibold text-sm">{t('settings.backupData')}</p>
                <p className="text-xs text-slate-500">Export semua data ke file JSON untuk backup.</p>
                <Btn onClick={handleBackup} disabled={backingUp}>
                  {backingUp ? '⏳ Mengekspor…' : '📥 Download Backup'}
                </Btn>
              </div>

              <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-3">
                <p className="font-semibold text-sm">{t('settings.restoreData')}</p>
                <p className="text-xs text-slate-500">Import data dari file backup JSON. Data baru akan ditambahkan.</p>
                <label className="cursor-pointer">
                  <span className="px-4 py-2 rounded-lg text-sm font-semibold
                    border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300
                    hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors inline-block">
                    {restoring ? '⏳ Memulihkan…' : '📤 Pilih File Backup'}
                  </span>
                  <input type="file" accept=".json" className="hidden" onChange={handleRestore} disabled={restoring} />
                </label>
              </div>

              <div className="border border-red-200 dark:border-red-800/50 rounded-xl p-4 space-y-3">
                <p className="font-semibold text-sm text-red-600 dark:text-red-400">{t('settings.hapusSemua')}</p>
                <p className="text-xs text-slate-500">Hapus semua data transaksi, investasi, utang, dll. Tidak dapat dibatalkan!</p>
                <Btn variant="danger" onClick={() => setConfirmClearData(true)}>
                  🗑️ {t('settings.hapusSemua')}
                </Btn>
              </div>
            </div>
          )}

          {/* TENTANG */}
          {activeSection === 'tentang' && (
            <div className="space-y-4">
              <h2 className="font-bold text-slate-800 dark:text-slate-100">{t('settings.tentang')}</h2>
              <div className="text-center py-8">
                <div className="text-6xl mb-4">💰</div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Keuangan Pribadi</h3>
                <p className="text-sm text-slate-500 mt-1">{t('settings.versi')} 2.0.0</p>
                <p className="text-xs text-slate-400 mt-4">
                  Aplikasi manajemen keuangan pribadi gratis.<br />
                  Firebase Firestore + Vercel + React
                </p>
              </div>
              <Btn variant="ghost" onClick={() => navigate('/bantuan')} className="w-full">
                ❓ Buka Panduan Lengkap
              </Btn>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmClearData}
        onClose={() => setConfirmClearData(false)}
        onConfirm={handleClearAllData}
        title={t('settings.hapusSemua')}
        message={t('settings.hapusSemuaKonfirmasi')}
        confirmLabel="Ya, Hapus Semua"
      />
    </div>
  );
}
