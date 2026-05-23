import { signOut } from 'firebase/auth';
import { Link } from 'react-router-dom';
import { auth } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLang } from '../../context/LangContext';
import NotifPanel from '../NotifPanel';

export default function Navbar({ onMenuToggle, onCollapseToggle, sidebarCollapsed }) {
  const { user } = useAuth();
  const { dark, toggle: toggleTheme } = useTheme();
  const { lang, toggle: toggleLang, t } = useLang();

  // Get display name from localStorage (set by profile page)
  const username = localStorage.getItem('username') || user?.email?.split('@')[0] || 'User';
  const photoURL = localStorage.getItem('photoURL') || null;

  return (
    <header className="h-14 bg-[#1e3a5f] dark:bg-slate-900 border-b border-[#2d5f8a]
      dark:border-slate-700 flex items-center px-3 gap-2 z-30 shrink-0">

      {/* Mobile hamburger */}
      <button
        onClick={onMenuToggle}
        className="lg:hidden text-white hover:text-blue-200 transition-colors w-8 h-8
          flex items-center justify-center rounded-lg hover:bg-white/10"
      >☰</button>

      {/* Desktop collapse toggle */}
      <button
        onClick={onCollapseToggle}
        title={sidebarCollapsed ? 'Buka sidebar' : 'Tutup sidebar'}
        className="hidden lg:flex w-8 h-8 items-center justify-center rounded-lg
          text-white hover:bg-white/10 transition-colors text-sm"
      >
        {sidebarCollapsed ? '▶' : '◀'}
      </button>

      <Link to="/dashboard" className="text-white font-bold text-base tracking-tight select-none ml-1">
        💰 <span className="hidden sm:inline">Keuangan Pribadi</span>
      </Link>

      <div className="ml-auto flex items-center gap-1.5">
        {/* Language toggle */}
        <button
          onClick={toggleLang}
          className="px-2 py-1 rounded-lg text-xs font-bold text-white
            hover:bg-white/10 transition-colors border border-white/20"
          title="Switch language"
        >
          {lang === 'id' ? '🇮🇩 ID' : '🇺🇸 ENG'}
        </button>

        {/* Dark mode toggle */}
        <button
          onClick={toggleTheme}
          title={dark ? 'Mode Terang' : 'Mode Gelap'}
          className="w-8 h-8 flex items-center justify-center rounded-lg
            text-white hover:bg-white/10 transition-colors"
        >
          {dark ? '☀️' : '🌙'}
        </button>

        {/* Notifications */}
        <NotifPanel />

        {/* Avatar / Profile */}
        <Link
          to="/settings"
          className="flex items-center gap-2 px-2 py-1 rounded-lg
            hover:bg-white/10 transition-colors"
          title={username}
        >
          {photoURL ? (
            <img src={photoURL} alt={username}
              className="w-6 h-6 rounded-full object-cover border border-white/30" />
          ) : (
            <div className="w-6 h-6 rounded-full bg-[#4a90d9] flex items-center
              justify-center text-white text-xs font-bold border border-white/30">
              {username.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="hidden sm:block text-blue-100 text-xs max-w-[100px] truncate">
            {username}
          </span>
        </Link>

        {/* Logout */}
        <button
          onClick={() => signOut(auth)}
          className="px-2 py-1 rounded-lg text-xs font-semibold
            bg-white/10 hover:bg-white/20 text-white transition-colors"
          title={t('common.keluar')}
        >
          ⏻
        </button>
      </div>
    </header>
  );
}
