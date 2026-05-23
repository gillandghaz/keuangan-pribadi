import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useReferensi } from '../context/ReferensiContext';
import { addDocument, updateDocument, deleteDocument } from '../hooks/useFirestore';
import { useToast } from '../components/ui/Toast';
import Modal from '../components/ui/Modal';
import { ConfirmDialog, SkeletonTable, EmptyState } from '../components/ui/index.jsx';
import { Field, Input, Btn } from '../components/ui/Form';

export default function Referensi() {
  const { user } = useAuth();
  const addToast = useToast();
  const { referensi, loading, kategoriList } = useReferensi();

  const [modal, setModal] = useState(false);
  const [editDoc, setEditDoc] = useState(null);
  const [form, setForm] = useState({ kategori: '', subkategori: '', keterangan: '' });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [search, setSearch] = useState('');

  const filtered = referensi.filter(r =>
    (r.kategori + r.subkategori + (r.keterangan||'')).toLowerCase().includes(search.toLowerCase())
  );

  function openAdd() { setForm({ kategori: '', subkategori: '', keterangan: '' }); setEditDoc(null); setModal(true); }
  function openEdit(doc) { setForm({ kategori: doc.kategori, subkategori: doc.subkategori, keterangan: doc.keterangan||'' }); setEditDoc(doc); setModal(true); }

  async function handleSave() {
    if (!form.kategori) { addToast('Kategori wajib diisi', 'error'); return; }
    if (!form.subkategori) { addToast('Subkategori wajib diisi', 'error'); return; }
    setSaving(true);
    try {
      if (editDoc) {
        await updateDocument(user.uid, 'referensi', editDoc.id, form);
        addToast('Referensi diperbarui', 'success');
      } else {
        // Check duplicate
        const exists = referensi.find(r => r.kategori === form.kategori && r.subkategori === form.subkategori);
        if (exists) { addToast('Kombinasi kategori dan subkategori sudah ada', 'error'); setSaving(false); return; }
        await addDocument(user.uid, 'referensi', form);
        addToast('Referensi ditambahkan', 'success');
      }
      setModal(false);
    } catch(e) { addToast('Gagal: ' + e.message, 'error'); }
    finally { setSaving(false); }
  }

  async function handleDelete(doc) {
    try {
      await deleteDocument(user.uid, 'referensi', doc.id);
      addToast('Referensi dihapus', 'success');
    } catch(e) { addToast('Gagal: ' + e.message, 'error'); }
  }

  // Group by kategori
  const grouped = filtered.reduce((acc, r) => {
    if (!acc[r.kategori]) acc[r.kategori] = [];
    acc[r.kategori].push(r);
    return acc;
  }, {});

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">⚙️ Referensi Kategori</h1>
        <Btn onClick={openAdd}>+ Tambah</Btn>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800
        rounded-xl px-4 py-3 mb-4 text-sm text-blue-700 dark:text-blue-300">
        ℹ️ Kategori <strong>Pemasukan</strong> → muncul di Jenis Pemasukan. Semua kategori lain → Pengeluaran.
        Perubahan langsung berlaku di semua dropdown aplikasi.
      </div>

      <div className="mb-4">
        <Input placeholder="Cari kategori atau subkategori..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4">
          <SkeletonTable rows={8} cols={4} />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon="⚙️" title="Belum ada referensi" action={<Btn onClick={openAdd}>+ Tambah Referensi</Btn>} />
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).sort(([a],[b])=>a.localeCompare(b)).map(([kat, rows]) => (
            <div key={kat} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="px-5 py-3 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                <h3 className="font-bold text-sm text-[#1e3a5f] dark:text-blue-300">{kat}</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {kat === 'Pemasukan' ? '🟢 Jenis: Pemasukan' : '🔴 Jenis: Pengeluaran'} · {rows.length} subkategori
                </p>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-700/50">
                    <th className="px-4 py-2 text-left text-xs font-bold text-slate-500 uppercase">Subkategori</th>
                    <th className="px-4 py-2 text-left text-xs font-bold text-slate-500 uppercase">Keterangan</th>
                    <th className="px-4 py-2 text-right text-xs font-bold text-slate-500 uppercase">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.sort((a,b)=>a.subkategori.localeCompare(b.subkategori)).map(r => (
                    <tr key={r.id} className="border-b border-slate-100 dark:border-slate-700/30 hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors">
                      <td className="px-4 py-2.5 font-medium">{r.subkategori}</td>
                      <td className="px-4 py-2.5 text-slate-500 dark:text-slate-400 text-xs">{r.keterangan||'-'}</td>
                      <td className="px-4 py-2.5 text-right">
                        <div className="flex gap-1 justify-end">
                          <button onClick={() => openEdit(r)}
                            className="px-2 py-1 rounded text-xs bg-slate-100 dark:bg-slate-700 hover:bg-[#4a90d9] hover:text-white transition-colors">
                            Edit
                          </button>
                          <button onClick={() => setDeleteTarget(r)}
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
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal open={modal} onClose={() => setModal(false)}
        title={editDoc ? 'Edit Referensi' : 'Tambah Referensi'} size="sm">
        <div className="space-y-4">
          <Field label="Kategori" required hint='Gunakan "Pemasukan" untuk jenis pemasukan'>
            <Input
              list="kat-ref-list"
              value={form.kategori}
              onChange={e => setForm(f => ({...f, kategori: e.target.value}))}
              placeholder="Contoh: Makanan & Minuman"
            />
            <datalist id="kat-ref-list">
              {kategoriList.map(k => <option key={k} value={k} />)}
            </datalist>
          </Field>
          <Field label="Subkategori" required>
            <Input
              value={form.subkategori}
              onChange={e => setForm(f => ({...f, subkategori: e.target.value}))}
              placeholder="Contoh: Belanja Dapur"
            />
          </Field>
          <Field label="Keterangan">
            <Input
              value={form.keterangan}
              onChange={e => setForm(f => ({...f, keterangan: e.target.value}))}
              placeholder="Opsional"
            />
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
        title="Hapus Referensi"
        message={`Hapus "${deleteTarget?.subkategori}" dari kategori "${deleteTarget?.kategori}"? Ini akan mempengaruhi semua dropdown di aplikasi.`}
      />
    </div>
  );
}
