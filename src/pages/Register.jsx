import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../lib/firebase';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleRegister(e) {
    e.preventDefault();
    setError('');
    if (password !== confirm) { setError('Password tidak cocok.'); return; }
    if (password.length < 6) { setError('Password minimal 6 karakter.'); return; }
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err) {
      const msgs = {
        'auth/email-already-in-use': 'Email sudah terdaftar.',
        'auth/invalid-email': 'Format email tidak valid.',
        'auth/weak-password': 'Password terlalu lemah (min. 6 karakter).',
      };
      setError(msgs[err.code] || 'Pendaftaran gagal: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e3a5f] via-[#2d5f8a] to-[#4a90d9]
      flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">💰</div>
          <h1 className="text-3xl font-bold text-white">Keuangan Pribadi</h1>
          <p className="text-blue-200 mt-2 text-sm">Buat akun gratis sekarang</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">Daftar Akun</h2>

          <form onSubmit={handleRegister} className="space-y-4">
            {[
              { label: 'Email', type: 'email', val: email, set: setEmail, ph: 'email@contoh.com' },
              { label: 'Password', type: 'password', val: password, set: setPassword, ph: '••••••••' },
              { label: 'Konfirmasi Password', type: 'password', val: confirm, set: setConfirm, ph: '••••••••' },
            ].map(f => (
              <div key={f.label}>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                  {f.label}
                </label>
                <input
                  type={f.type}
                  value={f.val}
                  onChange={e => f.set(e.target.value)}
                  placeholder={f.ph}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600
                    bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-100
                    focus:outline-none focus:ring-2 focus:ring-[#4a90d9] text-sm"
                />
              </div>
            ))}

            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800
                rounded-lg px-4 py-3 text-sm text-red-700 dark:text-red-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#1e3a5f] hover:bg-[#2d5f8a] text-white
                font-semibold text-sm transition-colors disabled:opacity-60 mt-2"
            >
              {loading ? 'Membuat akun…' : 'Daftar'}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
            Sudah punya akun?{' '}
            <Link to="/login" className="text-[#4a90d9] hover:underline">Masuk di sini</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
