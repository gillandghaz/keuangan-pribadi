import { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { useCollection, setDocument } from '../hooks/useFirestore';
import { rpFmt, bulanFmt } from '../lib/formatters';
import { useToast } from '../components/ui/Toast';
import { SkeletonTable, EmptyState } from '../components/ui/index.jsx';

export default function Dividen() {
  const { user } = useAuth();
  const { t } = useLang();
  const addToast = useToast();
  const { docs: transaksi, loading: loadT } = useCollection(user?.uid, 'transaksi', 'tanggal', 'desc');
  const { docs: notes, loading: loadN } = useCollection(user?.uid, 'dividen_notes', 'createdAt', 'desc');
  const [editNote, setEditNote] = useState({});

  const now = new Date();
  const thisYear = now.getFullYear();

  // FIX: Filter by SUBKATEGORI (case-insensitive) instead of kategori
  const grouped = useMemo(() => {
    const dividen = transaksi.filter(t =>
      t.jenis === 'Pemasukan' &&
      (t.subkategori || '').toLowerCase().includes('dividen')
    );
    const map = {};
    dividen.forEach(t => {
      const key = `${t.tahun}-${String(t.bulan).padStart(2,'0')}`;
      if (!map[key]) map[key] = { bulan: t.bulan, tahun: t.tahun, key, total: 0, count: 0, items: [] };
      map[key].total += t.jumlah || 0;
      map[key].count++;
      map[key].items.push(t);
    });
    return Object.values(map).sort((a, b) => b.key.localeCompare(a.key));
  }, [transaksi]);

  const notesMap = useMemo(() => {
    const m = {};
    notes.forEach(n => { m[n.id] = n.catatan || ''; });
    return m;
  }, [notes]);

  const yearTotal = grouped.filter(g => g.tahun === thisYear).reduce((s, g) => s + g.total, 0);
  const bulanTerbanyak = [...grouped].filter(g => g.tahun === thisYear).sort((a,b)=>b.total-a.total)[0];
  const yearMonths = grouped.filter(g=>g.tahun===thisYear);
  const avgPerBulan = yearMonths.length > 0 ? yearTotal / yearMonths.length : 0;

  async function saveNote(key, text) {
    try {
      await setDocument(user.uid, 'dividen_notes', key, { catatan: text });
      addToast('Catatan disimpan', 'success');
      setEditNote(e => ({ ...e, [key]: undefined }));
    } catch(err) {
      addToast('Gagal: ' + err.message, 'error');
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">
        💰 {t('dividen.title')}
      </h1>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800
        rounded-xl px-4 py-3 mb-4 text-sm text-blue-700 dark:text-blue-300">
        ℹ️ {t('dividen.infoBanner')}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
          <p className="text-xs text-slate-500">{t('dividen.totalTahunIni')} {thisYear}</p>
          <p className="text-xl font-bold text-[#4a90d9]">{rpFmt(yearTotal)}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
          <p className="text-xs text-slate-500">{t('dividen.bulanTerbanyak')}</p>
          <p className="text-lg font-bold text-slate-800 dark:text-slate-100">
            {bulanTerbanyak ? `${bulanFmt(bulanTerbanyak.bulan)} (${rpFmt(bulanTerbanyak.total)})` : '-'}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
          <p className="text-xs text-slate-500">{t('dividen.rataPerBulan')}</p>
          <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{rpFmt(avgPerBulan)}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {loadT || loadN ? (
          <div className="p-4"><SkeletonTable rows={5} cols={5} /></div>
        ) : grouped.length === 0 ? (
          <EmptyState icon="💰" title="Belum ada data dividen"
            message='Tambahkan transaksi Pemasukan dengan Subkategori "Dividen/Investasi"' />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                  {['Bulan','Tahun','Total Dividen','Jml Transaksi','Catatan'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {grouped.map(row => {
                  const noteText = editNote[row.key] !== undefined ? editNote[row.key] : (notesMap[row.key] || '');
                  const isEditing = editNote[row.key] !== undefined;
                  return (
                    <tr key={row.key} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                      <td className="px-4 py-3 font-medium">{bulanFmt(row.bulan)}</td>
                      <td className="px-4 py-3">{row.tahun}</td>
                      <td className="px-4 py-3 font-mono font-semibold text-emerald-600 dark:text-emerald-400">{rpFmt(row.total)}</td>
                      <td className="px-4 py-3">{row.count}</td>
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <div className="flex gap-2 items-center">
                            <input type="text" value={noteText}
                              onChange={e => setEditNote(p=>({...p,[row.key]:e.target.value}))}
                              onKeyDown={e => { if(e.key==='Enter') saveNote(row.key,noteText); if(e.key==='Escape') setEditNote(p=>({...p,[row.key]:undefined})); }}
                              className="flex-1 px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700" />
                            <button onClick={()=>saveNote(row.key,noteText)} className="px-2 py-1 rounded text-xs bg-emerald-600 text-white hover:bg-emerald-700">✓</button>
                            <button onClick={()=>setEditNote(p=>({...p,[row.key]:undefined}))} className="px-2 py-1 rounded text-xs bg-slate-200 dark:bg-slate-600 hover:bg-slate-300">✕</button>
                          </div>
                        ) : (
                          <div className="flex gap-2 items-center group">
                            <span className="text-slate-600 dark:text-slate-400 text-xs flex-1">
                              {notesMap[row.key] || <span className="text-slate-400 italic">Belum ada catatan</span>}
                            </span>
                            <button onClick={()=>setEditNote(p=>({...p,[row.key]:notesMap[row.key]||''}))}
                              className="opacity-0 group-hover:opacity-100 px-2 py-1 rounded text-xs bg-slate-100 dark:bg-slate-700 hover:bg-[#4a90d9] hover:text-white transition-all">✎</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
