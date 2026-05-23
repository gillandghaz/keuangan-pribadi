import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import PINLock from '../PINLock';
import { isPINRequired, startIdleTracker } from '../../lib/security';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => localStorage.getItem('sidebarCollapsed') === 'true'
  );
  const [pinLocked, setPinLocked] = useState(() => isPINRequired());

  function handleCollapseToggle() {
    setSidebarCollapsed(c => {
      const next = !c;
      localStorage.setItem('sidebarCollapsed', next ? 'true' : 'false');
      return next;
    });
  }

  // Idle tracker for PIN
  useEffect(() => {
    const cleanup = startIdleTracker(() => {
      if (isPINRequired()) setPinLocked(true);
    });
    return cleanup;
  }, []);

  if (pinLocked) {
    return <PINLock onUnlock={() => setPinLocked(false)} />;
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden">
      <Navbar
        onMenuToggle={() => setSidebarOpen(o => !o)}
        onCollapseToggle={handleCollapseToggle}
        sidebarCollapsed={sidebarCollapsed}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          collapsed={sidebarOpen ? false : sidebarCollapsed}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="flex-1 overflow-y-auto pb-20 lg:pb-4">
          <div className="max-w-7xl mx-auto p-4 lg:p-6">
            <Outlet />
          </div>
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
