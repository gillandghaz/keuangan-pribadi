import { useState, useEffect, useCallback } from 'react';
import { collection, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { useToast } from '../components/ui/Toast';
import { GLOBAL_INDICES, DEFAULT_WATCHLIST, INDEX_MAP } from '../lib/currencies';
import { fetchQuotesYahoo } from '../lib/marketApi';
import { SkeletonTable, EmptyState, ConfirmDialog } from '../components/ui/index.jsx';
import { Btn } from '../components/ui/Form';
import Modal from '../components/ui/Modal';

const REGIONS = ['Asia', 'Americas', 'Europe', 'Middle East', 'Africa'];

function ChangeCell({ change, pct }) {
  if (change == null) return <td className="px-3 py-3 text-slate-400">-</td>;
  const pos = change >= 0;
  return (
    <td className={`px-3 py-3 font-mono text-xs font-semibold ${pos ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
      {pos ? '+' : ''}{change?.toFixed(2)} ({pos ? '+' : ''}{pct?.toFixed(2)}%)
    </td>
  );
}

export default function Watchlist() {
  const { user } = useAuth();
  const { t } = useLang();
  const addToast = useToast();

  const [watchlist, setWatchlist] = useState([]);
  const [quotes, setQuotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [filterRegion, setFilterRegion] = useState('');
  const [addModal, setAddModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [searchIndex, setSearchIndex] = useState('');
  const [seeded, setSeeded] = useState(false);

  // Load watchlist from Firestore
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'users', user.uid, 'watchlist'), orderBy('sortOrder', 'asc'));
    const unsub = onSnapshot(q, async snap => {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));

      // Seed default watchlist for new users
      if (items.length === 0 && !seeded) {
        setSeeded(true);
        for (let i = 0; i < DEFAULT_WATCHLIST.length; i++) {
          const sym = DEFAULT_WATCHLIST[i];
          const meta = INDEX_MAP[sym];
          if (meta) {
            await addDoc(collection(db, 'users', user.uid, 'watchlist'), {
              symbol: sym, name: meta.name, region: meta.region,
              country: meta.country, currency: meta.currency,
              sortOrder: i, createdAt: serverTimestamp(),
            });
          }
        }
        return;
      }

      setWatchlist(items);
      setLoading(false);
    });
    return unsub;
  }, [user, seeded]);

  // Fetch quotes
  const fetchPrices = useCallback(async (symbols) => {
    if (!symbols.length) return;
    setRefreshing(true);
    try {
      const data = await fetchQuotesYahoo(symbols);
      setQuotes(prev => ({ ...prev, ...data }));
      setLastUpdate(new Date());
    } catch (e) {
      addToast('Gagal memuat harga: ' + e.message, 'error');
    } finally {
      setRefreshing(false);
    }
  }, [addToast]);

  useEffect(() => {
    if (watchlist.length > 0) {
      fetchPrices(watchlist.map(w => w.symbol));
    }
  }, [watchlist.length]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    if (!watchlist.length) return;
    const interval = setInterval(() => {
      fetchPrices(watchlist.map(w => w.symbol));
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [watchlist, fetchPrices]);

  async function handleAdd(index) {
    if (!user) return;
    if (watchlist.find(w => w.symbol === index.symbol)) {
      addToast('Indeks sudah ada di watchlist', 'info');
      return;
    }
    await addDoc(collection(db, 'users', user.uid, 'watchlist'), {
      symbol: index.symbol, name: index.name, region: index.region,
      country: index.country, currency: index.currency,
      sortOrder: watchlist.length, createdAt: serverTimestamp(),
    });
    addToast(`${index.name} ditambahkan`, 'success');
    setAddModal(false);
  }

  async function handleDelete(item) {
    await deleteDoc(doc(db, 'users', user.uid, 'watchlist', item.id));
    addToast('Indeks dihapus dari watchlist', 'success');
  }

  const filtered = watchlist.filter(w =>
    !filterRegion || w.region === filterRegion
  );

  const availableToAdd = GLOBAL_INDICES.filter(idx =>
    !watchlist.find(w => w.symbol === idx.symbol) &&
    (idx.name.toLowerCase().includes(searchIndex.toLowerCase()) ||
     idx.country.toLowerCase().includes(searchIndex.toLowerCase()) ||
     idx.symbol.toLowerCase().includes(searchIndex.toLowerCase()))
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">🌍 {t('watchlist.title')}</h1>
          {lastUpdate && (
            <p className="text-xs text-slate-400 mt-0.5">
              {t('watchlist.terakhirUpdate')}: {lastUpdate.toLocaleTimeString('id-ID')}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Btn variant="ghost" onClick={() => fetchPrices(watchlist.map(w => w.symbol))} disabled={refreshing}>
            {refreshing ? '⏳' : '🔄'} Refresh
          </Btn>
          <Btn onClick={() => setAddModal(true)}>+ {t('watchlist.tambahIndeks')}</Btn>
        </div>
      </div>

      {/* Region filter */}
      <div className="flex gap-2 flex-wrap mb-4">
        <button
          onClick={() => setFilterRegion('')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors
            ${!filterRegion ? 'bg-[#1e3a5f] text-white' : 'border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
        >
          {t('common.semua')}
        </button>
        {['Asia', 'Americas', 'Europe', 'Middle East', 'Africa'].map(r => (
          <button
            key={r}
            onClick={() => setFilterRegion(r === filterRegion ? '' : r)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors
              ${filterRegion === r ? 'bg-[#1e3a5f] text-white' : 'border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {loading ? (
          <div className="p-4"><SkeletonTable rows={8} cols={6} /></div>
        ) : filtered.length === 0 ? (
          <EmptyState icon="🌍" title="Watchlist kosong"
            message="Tambahkan indeks saham untuk dipantau"
            action={<Btn onClick={() => setAddModal(true)}>+ Tambah Indeks</Btn>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                  {['Indeks', 'Negara', 'Region', 'Nilai Terakhir', 'Perubahan', 'Mata Uang', ''].map(h => (
                    <th key={h} className="px-3 py-3 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(item => {
                  const q = quotes[item.symbol];
                  const hasData = q?.price != null;
                  return (
                    <tr key={item.id}
                      className={`border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors
                        ${hasData && q.change >= 0 ? 'hover:bg-emerald-50/20 dark:hover:bg-emerald-900/5' : hasData ? 'hover:bg-red-50/20 dark:hover:bg-red-900/5' : ''}`}
                    >
                      <td className="px-3 py-3">
                        <p className="font-semibold text-slate-800 dark:text-slate-100">{item.name}</p>
                        <p className="text-xs text-slate-400 font-mono">{item.symbol}</p>
                      </td>
                      <td className="px-3 py-3 text-xs text-slate-600 dark:text-slate-400">{item.country}</td>
                      <td className="px-3 py-3 text-xs">
                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded-full text-slate-600 dark:text-slate-400">
                          {item.region}
                        </span>
                      </td>
                      <td className="px-3 py-3 font-mono font-semibold text-slate-800 dark:text-slate-100">
                        {hasData ? q.price?.toLocaleString('id-ID', { maximumFractionDigits: 2 }) : (
                          <span className="text-slate-400 text-xs">Memuat…</span>
                        )}
                      </td>
                      <ChangeCell change={q?.change} pct={q?.changePct} />
                      <td className="px-3 py-3 text-xs text-slate-500">{item.currency}</td>
                      <td className="px-3 py-3">
                        <button onClick={() => setDeleteTarget(item)}
                          className="px-2 py-1 rounded text-xs bg-slate-100 dark:bg-slate-700
                            hover:bg-red-600 hover:text-white transition-colors">
                          ✕
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Index Modal */}
      <Modal open={addModal} onClose={() => setAddModal(false)} title="Tambah Indeks ke Watchlist" size="lg">
        <input
          type="text"
          placeholder="Cari nama negara, indeks, atau ticker…"
          value={searchIndex}
          onChange={e => setSearchIndex(e.target.value)}
          className="w-full px-3 py-2 mb-4 rounded-lg border border-slate-200 dark:border-slate-600
            bg-white dark:bg-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a90d9]"
        />
        <div className="max-h-96 overflow-y-auto space-y-1">
          {availableToAdd.map(idx => (
            <button
              key={idx.symbol}
              onClick={() => handleAdd(idx)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl
                hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left group"
            >
              <div>
                <p className="font-semibold text-sm text-slate-800 dark:text-slate-100">{idx.name}</p>
                <p className="text-xs text-slate-400">{idx.country} · {idx.symbol} · {idx.currency}</p>
              </div>
              <span className="text-[#4a90d9] text-sm opacity-0 group-hover:opacity-100 transition-opacity">+ Tambah</span>
            </button>
          ))}
          {availableToAdd.length === 0 && (
            <p className="text-center text-slate-400 py-8 text-sm">Semua indeks sudah ada di watchlist</p>
          )}
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => handleDelete(deleteTarget)}
        title="Hapus dari Watchlist"
        message={`Hapus "${deleteTarget?.name}" dari watchlist?`}
      />
    </div>
  );
}
