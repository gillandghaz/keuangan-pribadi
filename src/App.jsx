import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LangProvider } from './context/LangContext';
import { ReferensiProvider } from './context/ReferensiContext';
import { NotifProvider } from './context/NotifContext';
import { ToastProvider } from './components/ui/Toast';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Transaksi from './pages/Transaksi';
import Anggaran from './pages/Anggaran';
import Investasi from './pages/Investasi';
import Dividen from './pages/Dividen';
import Utang from './pages/Utang';
import Referensi from './pages/Referensi';
import Watchlist from './pages/Watchlist';
import Goals from './pages/Goals';
import Laporan from './pages/Laporan';
import Settings from './pages/Settings';
import Bantuan from './pages/Bantuan';
import Profil from './pages/Profil';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (user === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-pulse">💰</div>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Memuat aplikasi…</p>
        </div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { user } = useAuth();
  if (user === undefined) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <ReferensiProvider>
              <NotifProvider>
                <Layout />
              </NotifProvider>
            </ReferensiProvider>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard"  element={<Dashboard />} />
        <Route path="transaksi"  element={<Transaksi />} />
        <Route path="anggaran"   element={<Anggaran />} />
        <Route path="investasi"  element={<Investasi />} />
        <Route path="dividen"    element={<Dividen />} />
        <Route path="utang"      element={<Utang />} />
        <Route path="watchlist"  element={<Watchlist />} />
        <Route path="goals"      element={<Goals />} />
        <Route path="laporan"    element={<Laporan />} />
        <Route path="referensi"  element={<Referensi />} />
        <Route path="settings"   element={<Settings />} />
        <Route path="bantuan"    element={<Bantuan />} />
        <Route path="profil"     element={<Profil />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <LangProvider>
          <AuthProvider>
            <ToastProvider>
              <AppRoutes />
            </ToastProvider>
          </AuthProvider>
        </LangProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
