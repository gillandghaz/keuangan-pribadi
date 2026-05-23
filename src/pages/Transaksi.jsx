import { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useReferensi } from '../context/ReferensiContext';
import { useCollection, addDocument, updateDocument, deleteDocument } from '../hooks/useFirestore';
import { rpFmt, tglFmt, todayISO, seqId, parseRp } from '../lib/formatters';
import { METODE_BAYAR } from '../lib/seedData';
import { useToast } from '../components/ui/Toast';
import Modal from '../components/ui/Modal';
import { ConfirmDialog, SkeletonTable, EmptyState } from '../components/ui/index.jsx';
import { Field, Input, Select, Textarea, Btn } from '../components/ui/Form';
import NumberInput from '../components/ui/NumberInput';

const PAGE_SIZE = 20;

function defaultForm() {
  return {
    tanggal: todayISO(), jenis: 'Pengeluaran', kategori: '',
    subkategori: '', keterangan: '', jumlah: 0, metodeBayar: 'Transfer Bank',
  };
}

export default function Transaksi() {
  const { user } = useAuth();
  const addToast = useToast();
  const { referensi, kategoriList, subkategoriFor } = useReferensi();
  const { docs: transaksi, loading } = useCollection(user?.uid, 'transaksi', 'tanggal', 'desc');

  const [modal, setModal] = useState(false);
  const [editDoc, setEditDoc] = useState(null);
  const [form, setForm] = useState(defaultForm());
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [page, setPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState({ mulai: '', akhir: '', jenis: '', kategori: '', metode: '' });

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  const kategoriFiltred = useMemo(() => {
    return form.jenis === 'Pemasukan'
      ? ['Pemasukan']
      : kategoriList.filter(k => k !== 'Pemasukan');
  }, [form.jenis, kategoriList]);

  const filtered = useMemo(() => {
    return transaksi.filter(t => {
      if (filter.jenis && t.jenis !== filter.jenis) return false;
      if (filter.kategori && t.kategori !== filter.kategori) return false;
      if (filter.metode && t.metodeBayar !== filter.metode) return false;
      if (filter.mulai && t.tanggal < filter.mulai) return false;
      if (filter.akhir && t.tanggal > filter.akhir) return false;
      if (search && !( (t.keterangan || '') + (t.kategori || '') + (t.subkategori || '') )
        .toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [transaksi, filter, search]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function openAdd() { setForm(defaultForm()); setEditDoc(null); setModal(true); }
  function openEdit(doc) {
    setForm({
      tanggal: doc.tanggal || todayISO(),
      jenis: doc.jenis || 'Pengeluaran',
      kategori: doc.kategori || '',
      subkategori: doc.subkategori || '',
      keterangan: doc.keterangan || '',
      jumlah: doc.jumlah || 0,
      metodeBayar: doc.metodeBayar || 'Transfer Bank',
    });
    setEditDoc(doc);
    setModal(true);
  }

  async function handleSave() {
    if (!form.tanggal) { addToast('Tanggal wajib diisi', 'error'); return; }
    if (!form.kategori) { addToast('Kategori wajib dipilih', 'error'); return; }
    if (!form.jumlah || form.jumlah <= 0) { addToast('Jumlah harus lebih dari 0', 'error'); return; }
    setSaving(true);
    const d = new Date(form.tanggal);
    const data = {
      ...form,
      jumlah: Number(form.jumlah),
      bulan: d.getMonth() + 1,
      tahun: d.getFullYear(),
      idTransaksi: editDoc?.idTransaksi || seqId('TRX'),
    };
    try {
      if (editDoc) {
        await updateDocument(user.uid, 'transaksi', editDoc.id, data);
        addToast('Transaksi diperbarui', 'success');
      } else {
        await addDocument(user.uid, 'transaksi', data);
        addToast('Transaksi ditambahkan', 'success');
      }
      setModal(false);
    } catch (e) {
      addToast('Gagal menyimpan: ' + e.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(doc) {
    try {
      await deleteDocument(user.uid, 'transaksi', doc.id);
      addToast('Transaksi dihapus', 'success');
    } catch (e) {
      addToast('Gagal menghapus: ' + e.message, 'error');
    }
  }

  function exportCSV() {
    const header = 'Tanggal,Jenis,Kategori,Subkategori,Keterangan,Jumlah,Metode\n';
    const rows = filtered.map(t =>
      [t.tanggal, t.jenis, t.kategori, t.subkategori || '', `"${(t.keterangan || '').replace(/"/g,'""')}"`,
       t.jumlah, t.metodeBayar].join(',')
    ).join('\n');
    const blob = new Blob(['\uFEFF' + header + rows], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `transaksi_${new Date().toISOString().slice(0,10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  }

  const subkats = subkategoriFor(form.kategori);

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">💸 Transaksi</h1>
        <div className="flex gap-2 flex-wrap">
          <Btn variant="ghost" onClick={() => setFilterOpen(o => !o)}>
            🔍 Filter {Object.values(filter).some(Boolean) ? '●' : ''}
          </Btn>
          <Btn variant="ghost" onClick={exportCSV}>📥 Export CSV</Btn>
          <Btn onClick={openAdd}>+ Tambah</Btn>
        </div>
      </div>

      {/* Search */}
      <div className="mb-3">
        <Input
          placeholder="Cari keterangan, kategori..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      {/* Filter Panel */}
      {filterOpen && (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700
          rounded-xl p-4 mb-4 grid grid-cols-2 md:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Dari Tanggal</label>
            <Input type="date" value={filter.mulai} onChange={e => setFilter(f => ({...f, mulai: e.target.value}))} />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Sampai Tanggal</label>
            <Input type="date" value={filter.akhir} onChange={e => setFilter(f => ({...f, akhir: e.target.value}))} />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Jenis</label>
            <Select value={filter.jenis} onChange={e => setFilter(f => ({...f, jenis: e.target.value}))}>
              <option value="">Semua</option>
              <option>Pemasukan</option>
              <option>Pengeluaran</option>
            </Select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Kategori</label>
            <Select value={filter.kategori} onChange={e => setFilter(f => ({...f, kategori: e.target.value}))}>
              <option value="">Semua Kategori</option>
              {kategoriList.map(k => <option key={k}>{k}</option>)}
            </Select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Metode</label>
            <Select value={filter.metode} onChange={e => setFilter(f => ({...f, metode: e.target.value}))}>
              <option value="">Semua Metode</option>
              {METODE_BAYAR.map(m => <option key={m}>{m}</option>)}
            </Select>
          </div>
          <div className="flex items-end">
            <Btn variant="ghost" onClick={() => { setFilter({ mulai:'',akhir:'',jenis:'',kategori:'',metode:'' }); setPage(1); }}>
              Reset Filter
            </Btn>
          </div>
        </div>
      )}

      {/* Info Dividen */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800
        rounded-lg px-4 py-2 mb-3 text-xs text-blue-700 dark:text-blue-300">
        💡 Untuk mencatat dividen: Jenis = Pemasukan, Kategori = Dividen/Investasi
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {loading ? (
          <div className="p-4"><SkeletonTable rows={5} cols={7} /></div>
        ) : filtered.length === 0 ? (
          <EmptyState icon="💸" title="Belum ada transaksi" message="Tambahkan transaksi pertama Anda"
            action={<Btn onClick={openAdd}>+ Tambah Transaksi</Btn>} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                    {['Tanggal','Jenis','Kategori','Subkategori','Keterangan','Jumlah','Metode','Aksi'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paged.map(t => (
                    <tr key={t.id}
                      className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs">{tglFmt(t.tanggal)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold
                          ${t.jenis === 'Pemasukan'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'}`}>
                          {t.jenis}
                        </span>
                      </td>
                      <td className="px-4 py-3">{t.kategori}</td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{t.subkategori || '-'}</td>
                      <td className="px-4 py-3 max-w-[180px] truncate" title={t.keterangan}>{t.keterangan || '-'}</td>
                      <td className={`px-4 py-3 font-mono font-semibold
                        ${t.jenis === 'Pemasukan'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-red-600 dark:text-red-400'}`}>
                        {t.jenis === 'Pengeluaran' ? '-' : '+'}{rpFmt(t.jumlah)}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">{t.metodeBayar}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button onClick={() => openEdit(t)}
                            className="px-2 py-1 rounded text-xs bg-slate-100 dark:bg-slate-700 hover:bg-[#4a90d9] hover:text-white transition-colors">
                            Edit
                          </button>
                          <button onClick={() => setDeleteTarget(t)}
                            className="px-2 py-1 rounded text-xs bg-slate-100 dark:bg-slate-700 hover:bg-red-600 hover:text-white transition-colors">
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-700 text-sm">
              <span className="text-slate-500 dark:text-slate-400">
                {filtered.length} transaksi · halaman {page}/{pages}
              </span>
              <div className="flex gap-1">
                <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}
                  className="px-3 py-1 rounded border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-700">
                  ‹
                </button>
                <button onClick={() => setPage(p => Math.min(pages, p+1))} disabled={page === pages}
                  className="px-3 py-1 rounded border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-700">
                  ›
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal open={modal} onClose={() => setModal(false)}
        title={editDoc ? 'Edit Transaksi' : 'Tambah Transaksi'} size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Tanggal" required>
              <Input type="date" value={form.tanggal} onChange={e => set('tanggal', e.target.value)} />
            </Field>
            <Field label="Jenis" required>
              <Select value={form.jenis} onChange={e => { set('jenis', e.target.value); set('kategori', ''); set('subkategori', ''); }}>
                <option>Pemasukan</option>
                <option>Pengeluaran</option>
              </Select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Kategori" required>
              <Select value={form.kategori} onChange={e => { set('kategori', e.target.value); set('subkategori', ''); }}>
                <option value="">— Pilih Kategori —</option>
                {kategoriFiltred.map(k => <option key={k}>{k}</option>)}
              </Select>
            </Field>
            <Field label="Subkategori">
              <Select value={form.subkategori} onChange={e => set('subkategori', e.target.value)}
                disabled={!form.kategori}>
                <option value="">— Pilih Subkategori —</option>
                {subkats.map(s => <option key={s}>{s}</option>)}
              </Select>
            </Field>
          </div>

          <Field label="Keterangan">
            <Input placeholder="Opsional" value={form.keterangan} onChange={e => set('keterangan', e.target.value)} />
          </Field>

          <Field label="Jumlah" required>
            <NumberInput value={form.jumlah} onChange={v => set('jumlah', v)} placeholder="0" />
          </Field>

          <Field label="Metode Pembayaran">
            <Select value={form.metodeBayar} onChange={e => set('metodeBayar', e.target.value)}>
              {METODE_BAYAR.map(m => <option key={m}>{m}</option>)}
            </Select>
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
        title="Hapus Transaksi"
        message={`Yakin menghapus transaksi "${deleteTarget?.keterangan || deleteTarget?.kategori}"?`}
      />
    </div>
  );
}
