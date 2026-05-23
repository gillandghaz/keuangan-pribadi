import { useState } from 'react';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../lib/firebase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err) {
      const msgs = {
        'auth/invalid-credential': 'Email atau password salah.',
        'auth/user-not-found': 'Akun tidak ditemukan.',
        'auth/wrong-password': 'Password salah.',
        'auth/too-many-requests': 'Terlalu banyak percobaan. Coba lagi nanti.',
        'auth/invalid-email': 'Format email tidak valid.',
      };
      setError(msgs[err.code] || 'Login gagal: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleReset() {
    if (!email) { setError('Masukkan email terlebih dahulu.'); return; }
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
      setError('');
    } catch {
      setError('Gagal mengirim email reset. Pastikan email benar.');
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e3a5f] via-[#2d5f8a] to-[#4a90d9]
      flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">💰</div>
          <h1 className="text-3xl font-bold text-white">Keuangan Pribadi</h1>
          <p className="text-blue-200 mt-2 text-sm">Kelola keuanganmu dengan cerdas</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">Masuk</h2>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="email@contoh.com"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600
                  bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-100
                  focus:outline-none focus:ring-2 focus:ring-[#4a90d9] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600
                  bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-100
                  focus:outline-none focus:ring-2 focus:ring-[#4a90d9] text-sm"
              />
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800
                rounded-lg px-4 py-3 text-sm text-red-700 dark:text-red-300">
                {error}
              </div>
            )}
            {resetSent && (
              <div className="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800
                rounded-lg px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">
                Link reset password telah dikirim ke {email}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#1e3a5f] hover:bg-[#2d5f8a] text-white
                font-semibold text-sm transition-colors disabled:opacity-60 mt-2"
            >
              {loading ? 'Memproses…' : 'Masuk'}
            </button>
          </form>

          <div className="mt-4 flex items-center justify-between text-sm">
            <button
              onClick={handleReset}
              className="text-[#4a90d9] hover:underline text-xs"
            >
              Lupa password?
            </button>
            <Link to="/register" className="text-[#4a90d9] hover:underline text-xs">
              Daftar akun baru →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
