import { useState, useRef, useEffect } from 'react';
import { useNotif } from '../context/NotifContext';
import { useLang } from '../context/LangContext';
import { format } from 'date-fns';
import { id as idLocale, enUS } from 'date-fns/locale';

const TYPE_ICON = {
  BUDGET_WARNING_80: '⚠️',
  BUDGET_EXCEEDED: '🔴',
  DEBT_DUE_7DAYS: '📅',
  DEBT_DUE_TODAY: '🚨',
  HEALTH_SCORE_LOW: '💊',
  GOAL_ACHIEVED: '🎉',
  GOAL_NEAR: '🎯',
};

export default function NotifPanel() {
  const { notifs, unreadCount, markRead, markAllRead } = useNotif();
  const { t, lang } = useLang();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const locale = lang === 'id' ? idLocale : enUS;

  function formatTime(ts) {
    if (!ts?.seconds) return '';
    try {
      return format(new Date(ts.seconds * 1000), 'dd MMM, HH:mm', { locale });
    } catch { return ''; }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="relative w-8 h-8 flex items-center justify-center rounded-lg
          text-white hover:bg-white/10 transition-colors"
        title={t('notif.title')}
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full
            text-[10px] font-bold text-white flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-80 bg-white dark:bg-slate-800
          border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl z-50
          overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3
            border-b border-slate-200 dark:border-slate-700">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">
              {t('notif.title')}
              {unreadCount > 0 && (
                <span className="ml-2 px-1.5 py-0.5 bg-red-100 dark:bg-red-900/30
                  text-red-600 dark:text-red-400 text-xs rounded-full">
                  {unreadCount}
                </span>
              )}
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-[#4a90d9] hover:underline"
              >
                {t('notif.bacaSemua')}
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {notifs.length === 0 ? (
              <div className="px-4 py-8 text-center text-slate-400 dark:text-slate-500 text-sm">
                <div className="text-3xl mb-2">🔕</div>
                {t('notif.kosong')}
              </div>
            ) : (
              notifs.slice(0, 20).map(n => (
                <div
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  className={`flex gap-3 px-4 py-3 border-b border-slate-100
                    dark:border-slate-700/50 cursor-pointer transition-colors
                    hover:bg-slate-50 dark:hover:bg-slate-700/30
                    ${!n.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                >
                  <span className="text-lg shrink-0 mt-0.5">
                    {TYPE_ICON[n.type] || 'ℹ️'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs leading-snug
                      ${!n.read
                        ? 'text-slate-800 dark:text-slate-100 font-medium'
                        : 'text-slate-600 dark:text-slate-400'}`}>
                      {n.message}
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                      {formatTime(n.createdAt)}
                    </p>
                  </div>
                  {!n.read && (
                    <div className="w-2 h-2 rounded-full bg-[#4a90d9] shrink-0 mt-1.5" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
