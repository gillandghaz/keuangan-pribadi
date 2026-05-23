import { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { useReferensi } from '../context/ReferensiContext';
import { useCollection, addDocument, updateDocument, deleteDocument } from '../hooks/useFirestore';
import { rpFmt, todayISO } from '../lib/formatters';
import { useToast } from '../components/ui/Toast';
import Modal from '../components/ui/Modal';
import { ConfirmDialog, SkeletonTable, EmptyState, Badge } from '../components/ui/index.jsx';
import { Field, Input, Select, Btn } from '../components/ui/Form';
import NumberInput from '../components/ui/NumberInput';

function statusBadge(anggaran, terpakai) {
  if (anggaran === 0) return <Badge label="---" color="gray" />;
  if (terpakai === 0) return <Badge label="Belum Terpakai" color="blue" />;
  const pct = terpakai / anggaran;
  if (pct <= 0.5) return <Badge label="Aman" color="green" />;
  if (pct <= 0.8) return <Badge label="Waspada" color="yellow" />;
  if (pct <= 1.0) return <Badge label="Kritis" color="orange" />;
  return <Badge label="MELEBIHI ANGGARAN" color="red" />;
}

export default function Anggaran() {
  const { user } = useAuth();
  const addToast = useToast();
  const { kategoriList, subkategoriFor } = useReferensi();
  const { docs: anggaran, loading: loadA } = useCollection(user?.uid, 'anggaran', 'kategori', 'asc');
  const { docs: transaksi, loading: loadT } = useCollection(user?.uid, 'transaksi', 'tanggal', 'desc');

  const now = new Date();
  const [filterMulai, setFilterMulai] = useState(format(startOfMonth(now), 'yyyy-MM-dd'));
  const [filterAkhir, setFilterAkhir] = useState(format(endOfMonth(now), 'yyyy-MM-dd'));
  const [applied, setApplied] = useState({ mulai: filterMulai, akhir: filterAkhir });

  const [modal, setModal] = useState(false);
  const [editDoc, setEditDoc] = useState(null);
  const [form, setForm] = useState({ kategori: '', subkategori: '', anggaranBulanan: 0 });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  function applyFilter() { setApplied({ mulai: filterMulai, akhir: filterAkhir }); }

  // Compute "terpakai" for each anggaran row
  const terpakaiMap = useMemo(() => {
    const map = {};
    transaksi.forEach(t => {
      if (t.jenis !== 'Pengeluaran') return;
      if (t.tanggal < applied.mulai || t.tanggal > applied.akhir) return;
      // Match by kategori or subkategori
      const key1 = t.kategori || '';
      const key2 = t.subkategori || '';
      map[key1] = (map[key1] || 0) + (t.jumlah || 0);
      if (key2) map[key2] = (map[key2] || 0) + (t.jumlah || 0);
    });
    return map;
  }, [transaksi, applied]);

  // Build rows with computed terpakai
  const rows = useMemo(() => anggaran.map(a => {
    const terpakai = (terpakaiMap[a.subkategori] || 0);
    const sisa = a.anggaranBulanan - terpakai;
    const pct = a.anggaranBulanan > 0 ? terpakai / a.anggaranBulanan * 100 : 0;
    return { ...a, terpakai, sisa, pct };
  }), [anggaran, terpakaiMap]);

  const totalAnggaran = rows.reduce((s, r) => s + r.anggaranBulanan, 0);
  const totalTerpakai = rows.reduce((s, r) => s + r.terpakai, 0);
  const totalSisa = totalAnggaran - totalTerpakai;

  function openAdd() { setForm({ kategori: '', subkategori: '', anggaranBulanan: 0 }); setEditDoc(null); setModal(true); }
  function openEdit(doc) { setForm({ kategori: doc.kategori, subkategori: doc.subkategori, anggaranBulanan: doc.anggaranBulanan }); setEditDoc(doc); setModal(true); }

  async function handleSave() {
    if (!form.kategori) { addToast('Kategori wajib diisi', 'error'); return; }
    if (!form.subkategori) { addToast('Subkategori wajib diisi', 'error'); return; }
    setSaving(true);
    try {
      if (editDoc) {
        await updateDocument(user.uid, 'anggaran', editDoc.id, form);
        addToast('Anggaran diperbarui', 'success');
      } else {
        await addDocument(user.uid, 'anggaran', form);
        addToast('Anggaran ditambahkan', 'success');
      }
      setModal(false);
    } catch (e) { addToast('Gagal: ' + e.message, 'error'); }
    finally { setSaving(false); }
  }

  async function handleDelete(doc) {
    try {
      await deleteDocument(user.uid, 'anggaran', doc.id);
      addToast('Anggaran dihapus', 'success');
    } catch (e) { addToast('Gagal: ' + e.message, 'error'); }
  }

  const loading = loadA || loadT;

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">📅 Anggaran</h1>
        <Btn onClick={openAdd}>+ Tambah Anggaran</Btn>
      </div>

      {/* Filter */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700
        rounded-xl p-4 mb-4 flex flex-wrap gap-3 items-end">
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Dari Tanggal</label>
          <Input type="date" value={filterMulai} onChange={e => setFilterMulai(e.target.value)} className="w-40" />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Sampai Tanggal</label>
          <Input type="date" value={filterAkhir} onChange={e => setFilterAkhir(e.target.value)} className="w-40" />
        </div>
        <Btn onClick={applyFilter}>Terapkan Filter</Btn>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: 'Total Anggaran', value: rpFmt(totalAnggaran), color: '' },
          { label: 'Total Terpakai', value: rpFmt(totalTerpakai), color: totalTerpakai > totalAnggaran ? 'text-red-600 dark:text-red-400' : 'text-slate-800 dark:text-slate-100' },
          { label: 'Total Sisa', value: rpFmt(totalSisa), color: totalSisa < 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400' },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">{s.label}</p>
            <p className={`text-lg font-bold ${s.color || 'text-slate-800 dark:text-slate-100'}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {loading ? (
          <div className="p-4"><SkeletonTable rows={8} cols={7} /></div>
        ) : rows.length === 0 ? (
          <EmptyState icon="📅" title="Belum ada anggaran" message="Tambahkan anggaran pertama Anda"
            action={<Btn onClick={openAdd}>+ Tambah Anggaran</Btn>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                  {['Kategori','Subkategori','Anggaran/Bln','Terpakai','Sisa','% Terpakai','Status','Aksi'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(row => (
                  <tr key={row.id}
                    className={`border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors
                      ${row.pct > 100 ? 'bg-red-50/50 dark:bg-red-900/10' : ''}`}>
                    <td className="px-4 py-3 font-medium">{row.kategori}</td>
                    <td className="px-4 py-3">{row.subkategori}</td>
                    <td className="px-4 py-3 font-mono">{rpFmt(row.anggaranBulanan)}</td>
                    <td className="px-4 py-3 font-mono">{rpFmt(row.terpakai)}</td>
                    <td className={`px-4 py-3 font-mono ${row.sisa < 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      {rpFmt(row.sisa)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${row.pct > 100 ? 'bg-red-500' : row.pct > 80 ? 'bg-orange-400' : row.pct > 50 ? 'bg-yellow-400' : 'bg-emerald-500'}`}
                            style={{ width: `${Math.min(row.pct, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono">{row.pct.toFixed(0)}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">{statusBadge(row.anggaranBulanan, row.terpakai)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(row)}
                          className="px-2 py-1 rounded text-xs bg-slate-100 dark:bg-slate-700 hover:bg-[#4a90d9] hover:text-white transition-colors">
                          Edit
                        </button>
                        <button onClick={() => setDeleteTarget(row)}
                          className="px-2 py-1 rounded text-xs bg-slate-100 dark:bg-slate-700 hover:bg-red-600 hover:text-white transition-colors">
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 dark:bg-slate-700/50 border-t-2 border-slate-300 dark:border-slate-600 font-bold">
                  <td colSpan={2} className="px-4 py-3">Total</td>
                  <td className="px-4 py-3 font-mono">{rpFmt(totalAnggaran)}</td>
                  <td className="px-4 py-3 font-mono">{rpFmt(totalTerpakai)}</td>
                  <td className={`px-4 py-3 font-mono ${totalSisa < 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {rpFmt(totalSisa)}
                  </td>
                  <td colSpan={3} />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal open={modal} onClose={() => setModal(false)}
        title={editDoc ? 'Edit Anggaran' : 'Tambah Anggaran'} size="sm">
        <div className="space-y-4">
          <Field label="Kategori" required>
            <Input
              list="kat-list"
              value={form.kategori}
              onChange={e => setForm(f => ({...f, kategori: e.target.value}))}
              placeholder="Contoh: Kebutuhan Pokok"
            />
            <datalist id="kat-list">
              {[...new Set(anggaran.map(a => a.kategori))].map(k => <option key={k} value={k} />)}
            </datalist>
          </Field>
          <Field label="Subkategori" required>
            <Input
              value={form.subkategori}
              onChange={e => setForm(f => ({...f, subkategori: e.target.value}))}
              placeholder="Contoh: Makanan & Minuman"
            />
          </Field>
          <Field label="Anggaran Bulanan (Rp)" required>
            <NumberInput value={form.anggaranBulanan} onChange={v => setForm(f => ({...f, anggaranBulanan: v}))} />
          </Field>
          <div className="flex gap-3 pt-2">
            <Btn variant="ghost" onClick={() => setModal(false)} className="flex-1">Batal</Btn>
            <Btn onClick={handleSave} disabled={saving} className="flex-1">
              {saving ? 'Menyimpan…' : 'Simpan'}
            </Btn>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => handleDelete(deleteTarget)}
        title="Hapus Anggaran"
        message={`Hapus anggaran "${deleteTarget?.subkategori}"?`}
      />
    </div>
  );
}
