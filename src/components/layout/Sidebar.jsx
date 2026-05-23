import { NavLink } from 'react-router-dom';
import { useLang } from '../../context/LangContext';

export default function Sidebar({ collapsed, onClose }) {
  const { t } = useLang();

  const MENU = [
    { path: '/dashboard',  icon: '📊', key: 'dashboard' },
    { path: '/transaksi',  icon: '💸', key: 'transaksi' },
    { path: '/anggaran',   icon: '📅', key: 'anggaran' },
    { path: '/investasi',  icon: '📈', key: 'investasi' },
    { path: '/dividen',    icon: '💰', key: 'dividen' },
    { path: '/utang',      icon: '🏦', key: 'utang' },
    { path: '/watchlist',  icon: '🌍', key: 'watchlist' },
    { path: '/goals',      icon: '🎯', key: 'goals' },
    { path: '/laporan',    icon: '📋', key: 'laporan' },
    { path: '/referensi',  icon: '⚙️',  key: 'referensi' },
    { path: '/settings',   icon: '🔧', key: 'settings' },
    { path: '/bantuan',    icon: '❓', key: 'bantuan' },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {!collapsed && (
        <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed top-14 left-0 bottom-0 z-20 flex flex-col
          bg-[#1e3a5f] dark:bg-slate-900 border-r border-[#2d5f8a] dark:border-slate-700
          transition-all duration-300 ease-in-out
          ${collapsed
            ? '-translate-x-full lg:translate-x-0 lg:w-14'
            : 'translate-x-0 w-56'
          }
          lg:relative lg:top-0 lg:shrink-0`}
      >
        <nav className="flex-1 overflow-y-auto py-2 overflow-x-hidden">
          {MENU.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => { if (window.innerWidth < 1024) onClose(); }}
              title={t(`nav.${item.key}`)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 mx-1.5 rounded-xl text-sm
                transition-all duration-150 group
                ${isActive
                  ? 'bg-[#4a90d9]/20 text-white font-semibold border-l-2 border-[#4a90d9] pl-[10px]'
                  : 'text-blue-200 hover:bg-white/10 hover:text-white'}`
              }
            >
              <span className="text-base w-5 text-center shrink-0 leading-none">
                {item.icon}
              </span>
              <span className={`whitespace-nowrap transition-all duration-300 text-sm
                ${collapsed ? 'lg:opacity-0 lg:w-0 lg:overflow-hidden' : 'opacity-100'}`}>
                {t(`nav.${item.key}`)}
              </span>
            </NavLink>
          ))}
        </nav>

        <div className={`border-t border-[#2d5f8a] dark:border-slate-700 p-2
          ${collapsed ? 'lg:flex lg:justify-center' : ''}`}>
          <p className={`text-[10px] text-blue-300/40 text-center
            ${collapsed ? 'lg:hidden' : ''}`}>v2.0.0</p>
        </div>
      </aside>
    </>
  );
}
