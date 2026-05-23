import { NavLink } from 'react-router-dom';
import { useLang } from '../../context/LangContext';

export default function BottomNav() {
  const { t } = useLang();

  const MENU = [
    { path: '/dashboard', icon: '📊', key: 'dashboard' },
    { path: '/transaksi', icon: '💸', key: 'transaksi' },
    { path: '/investasi', icon: '📈', key: 'investasi' },
    { path: '/laporan',   icon: '📋', key: 'laporan' },
    { path: '/settings',  icon: '🔧', key: 'settings' },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30
      bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700
      flex items-stretch h-16">
      {MENU.map(item => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px]
            transition-colors
            ${isActive
              ? 'text-[#4a90d9] font-semibold'
              : 'text-slate-500 dark:text-slate-400'}`
          }
        >
          <span className="text-xl leading-none">{item.icon}</span>
          <span>{t(`nav.${item.key}`)}</span>
        </NavLink>
      ))}
    </nav>
  );
}
