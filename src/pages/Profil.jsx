import { useState, useRef } from 'react';
import { updateEmail, updatePassword, sendEmailVerification, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { auth } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import { useLang } from '../context/LangContext';
import { Field, Input, Btn } from '../components/ui/Form';
import { ConfirmDialog } from '../components/ui/index.jsx';

// Firebase storage import (lazy to avoid error if not configured)
async function getStorage() {
  const { getStorage } = await import('firebase/storage');
  const { default: app } = await import('../lib/firebase');
  return getStorage(app);
}

export default function Profil() {
  const { user } = useAuth();
  const addToast = useToast();
  const { t } = useLang();
  const fileRef = useRef(null);

  const [username, setUsername] = useState(() => localStorage.getItem('username') || '');
  const [photoURL, setPhotoURL] = useState(() => localStorage.getItem('photoURL') || '');
  const [uploading, setUploading] = useState(false);

  // Email change
  const [newEmail, setNewEmail] = useState('');
  const [emailPwd, setEmailPwd] = useState('');
  const [confirmEmailChange, setConfirmEmailChange] = useState(false);

  // Password change
  const [oldPwd, setOldPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [confirmPwdChange, setConfirmPwdChange] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);

  function saveUsername() {
    if (!username.trim()) { addToast('Username tidak boleh kosong', 'error'); return; }
    localStorage.setItem('username', username.trim());
    addToast('Username disimpan', 'success');
  }

  async function handlePhotoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { addToast('Ukuran foto maksimal 5MB', 'error'); return; }
    if (!file.type.startsWith('image/')) { addToast('File harus berupa gambar', 'error'); return; }
    setUploading(true);
    try {
      const storage = await getStorage();
      const storageRef = ref(storage, `users/${user.uid}/profile/avatar`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setPhotoURL(url);
      localStorage.setItem('photoURL', url);
      addToast('Foto profil diperbarui', 'success');
    } catch (e) {
      addToast('Upload gagal: ' + e.message, 'error');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  async function handleRemovePhoto() {
    try {
      const storage = await getStorage();
      const storageRef = ref(storage, `users/${user.uid}/profile/avatar`);
      await deleteObject(storageRef).catch(() => {});
      setPhotoURL('');
      localStorage.removeItem('photoURL');
      addToast('Foto profil dihapus', 'success');
    } catch (e) {
      addToast('Gagal: ' + e.message, 'error');
    }
  }

  async function handleEmailChange() {
    if (!newEmail || !emailPwd) { addToast('Isi semua field', 'error'); return; }
    try {
      const cred = EmailAuthProvider.credential(user.email, emailPwd);
      await reauthenticateWithCredential(user, cred);
      await updateEmail(user, newEmail);
      await sendEmailVerification(user);
      addToast(t('profil.verifikasiDikirim'), 'success');
      setNewEmail(''); setEmailPwd('');
    } catch (e) {
      const msgs = {
        'auth/wrong-password': 'Password salah',
        'auth/email-already-in-use': 'Email sudah digunakan akun lain',
        'auth/invalid-email': 'Format email tidak valid',
        'auth/requires-recent-login': 'Silakan login ulang terlebih dahulu',
      };
      addToast(msgs[e.code] || e.message, 'error');
    }
  }

  async function handlePasswordChange() {
    if (!oldPwd || !newPwd || !confirmPwd) { addToast('Isi semua field', 'error'); return; }
    if (newPwd !== confirmPwd) { addToast('Password baru tidak cocok', 'error'); return; }
    if (newPwd.length < 6) { addToast('Password minimal 6 karakter', 'error'); return; }
    setSavingPwd(true);
    try {
      const cred = EmailAuthProvider.credential(user.email, oldPwd);
      await reauthenticateWithCredential(user, cred);
      await updatePassword(user, newPwd);
      addToast('Password berhasil diubah', 'success');
      setOldPwd(''); setNewPwd(''); setConfirmPwd('');
    } catch (e) {
      const msgs = {
        'auth/wrong-password': 'Password lama salah',
        'auth/weak-password': 'Password baru terlalu lemah',
        'auth/requires-recent-login': 'Silakan login ulang terlebih dahulu',
      };
      addToast(msgs[e.code] || e.message, 'error');
    } finally {
      setSavingPwd(false);
    }
  }

  const initials = (username || user?.email || 'U').charAt(0).toUpperCase();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">👤 {t('profil.title')}</h1>

      {/* Avatar */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
        <h2 className="font-bold text-slate-800 dark:text-slate-100 mb-4">{t('profil.fotoProfil')}</h2>
        <div className="flex items-center gap-5">
          <div className="relative">
            {photoURL ? (
              <img src={photoURL} alt="Profil"
                className="w-20 h-20 rounded-full object-cover border-2 border-[#4a90d9]" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-[#1e3a5f] flex items-center
                justify-center text-white text-3xl font-bold border-2 border-[#4a90d9]">
                {initials}
              </div>
            )}
            {uploading && (
              <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
          <div className="space-y-2">
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            <Btn onClick={() => fileRef.current?.click()} disabled={uploading}>
              📷 {t('profil.ubahFoto')}
            </Btn>
            {photoURL && (
              <Btn variant="ghost" onClick={handleRemovePhoto} className="block text-xs">
                Hapus Foto
              </Btn>
            )}
            <p className="text-xs text-slate-400">JPG, PNG, WebP — maks 5MB</p>
          </div>
        </div>
      </div>

      {/* Username */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
        <h2 className="font-bold text-slate-800 dark:text-slate-100 mb-4">{t('profil.username')}</h2>
        <div className="flex gap-3">
          <Field label="Username" className="flex-1">
            <Input value={username} onChange={e => setUsername(e.target.value)}
              placeholder="Nama tampilan Anda" maxLength={30} />
          </Field>
          <div className="flex items-end">
            <Btn onClick={saveUsername}>{t('common.simpan')}</Btn>
          </div>
        </div>
        <p className="text-xs text-slate-400 mt-2">Email: {user?.email}</p>
      </div>

      {/* Change Email */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
        <h2 className="font-bold text-slate-800 dark:text-slate-100 mb-4">{t('profil.ubahEmail')}</h2>
        <div className="space-y-3">
          <Field label={t('profil.emailBaru')}>
            <Input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)}
              placeholder="email-baru@contoh.com" />
          </Field>
          <Field label={`${t('auth.password')} (verifikasi)`}>
            <Input type="password" value={emailPwd} onChange={e => setEmailPwd(e.target.value)}
              placeholder="••••••••" />
          </Field>
          <Btn onClick={() => setConfirmEmailChange(true)} variant="ghost">
            {t('profil.ubahEmail')}
          </Btn>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
        <h2 className="font-bold text-slate-800 dark:text-slate-100 mb-4">{t('profil.ubahPassword')}</h2>
        <div className="space-y-3">
          <Field label={t('profil.passwordLama')}>
            <Input type="password" value={oldPwd} onChange={e => setOldPwd(e.target.value)} placeholder="••••••••" />
          </Field>
          <Field label={t('profil.passwordBaru')}>
            <Input type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} placeholder="••••••••" />
          </Field>
          <Field label={t('auth.confirmPassword')}>
            <Input type="password" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} placeholder="••••••••" />
          </Field>
          <Btn onClick={() => setConfirmPwdChange(true)} variant="ghost" disabled={savingPwd}>
            {savingPwd ? 'Menyimpan…' : t('profil.ubahPassword')}
          </Btn>
        </div>
      </div>

      <ConfirmDialog
        open={confirmEmailChange}
        onClose={() => setConfirmEmailChange(false)}
        onConfirm={handleEmailChange}
        title="Ubah Email"
        message={`Yakin mengubah email ke "${newEmail}"? Link verifikasi akan dikirim ke email baru.`}
        confirmLabel="Ya, Ubah Email"
        danger={false}
      />
      <ConfirmDialog
        open={confirmPwdChange}
        onClose={() => setConfirmPwdChange(false)}
        onConfirm={handlePasswordChange}
        title="Ubah Password"
        message="Yakin mengubah password? Pastikan Anda ingat password baru."
        confirmLabel="Ya, Ubah Password"
        danger={false}
      />
    </div>
  );
}
