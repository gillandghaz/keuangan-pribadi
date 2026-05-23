import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { useCollection, addDocument, updateDocument, deleteDocument } from '../hooks/useFirestore';
import { useToast } from '../components/ui/Toast';
import { rpFmt, tglFmt, todayISO } from '../lib/formatters';
import { GOAL_COLORS } from '../lib/seedData';
import { ConfirmDialog, EmptyState, SkeletonTable } from '../components/ui/index.jsx';
import { Field, Input, Btn, Select } from '../components/ui/Form';
import NumberInput from '../components/ui/NumberInput';
import Modal from '../components/ui/Modal';
import { format, differenceInDays } from 'date-fns';

function defaultForm() {
  return { nama: '', target: 0, current: 0, deadline: '', warna: GOAL_COLORS[0], catatan: '' };
}

export default function Goals() {
  const { user } = useAuth();
  const { t } = useLang();
  const addToast = useToast();
  const { docs: goals, loading } = useCollection(user?.uid, 'goals', 'createdAt', 'desc');

  const [modal, setModal] = useState(false);
  const [updateModal, setUpdateModal] = useState(null);
  const [editDoc, setEditDoc] = useState(null);
  const [form, setForm] = useState(defaultForm());
  const [updateAmount, setUpdateAmount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  function openAdd() { setForm(defaultForm()); setEditDoc(null); setModal(true); }
  function openEdit(g) {
    setForm({ nama: g.nama, target: g.target, current: g.current || 0, deadline: g.deadline || '', warna: g.warna || GOAL_COLORS[0], catatan: g.catatan || '' });
    setEditDoc(g);
    setModal(true);
  }

  async function handleSave() {
    if (!form.nama) { addToast('Nama target wajib diisi', 'error'); return; }
    if (!form.target || form.target <= 0) { addToast('Target harus > 0', 'error'); return; }
    setSaving(true);
    try {
      if (editDoc) {
        await updateDocument(user.uid, 'goals', editDoc.id, form);
        addToast('Target diperbarui', 'success');
      } else {
        await addDocument(user.uid, 'goals', { ...form, current: 0 });
        addToast('Target ditambahkan', 'success');
      }
      setModal(false);
    } catch (e) { addToast('Gagal: ' + e.message, 'error'); }
    finally { setSaving(false); }
  }

  async function handleUpdateProgress() {
    if (!updateModal) return;
    if (updateAmount <= 0) { addToast('Jumlah harus > 0', 'error'); return; }
    const newCurrent = Math.min((updateModal.current || 0) + updateAmount, updateModal.target);
    const done = newCurrent >= updateModal.target;
    await updateDocument(user.uid, 'goals', updateModal.id, {
      current: newCurrent,
      ...(done ? { achievedAt: new Date().toISOString() } : {}),
    });
    addToast(done ? '🎉 Target tercapai!' : 'Progress diperbarui', 'success');
    setUpdateModal(null);
    setUpdateAmount(0);
  }

  function statusLabel(g) {
    const pct = g.target > 0 ? (g.current || 0) / g.target : 0;
    if (pct >= 1) return { label: t('goals.tercapai'), color: 'text-emerald-600 dark:text-emerald-400 font-bold' };
    if (pct >= 0.9) return { label: t('goals.hampirTercapai'), color: 'text-[#4a90d9]' };
    if (pct === 0) return { label: t('goals.belumMulai'), color: 'text-slate-400' };
    return { label: `${(pct * 100).toFixed(0)}%`, color: 'text-slate-600 dark:text-slate-300' };
  }

  function estimasi(g) {
    if (!g.deadline) return null;
    const days = differenceInDays(new Date(g.deadline), new Date());
    if (days < 0) return { label: 'Tenggat terlewat', color: 'text-red-500' };
    return { label: `${days} hari lagi`, color: days <= 30 ? 'text-orange-500' : 'text-slate-400' };
  }

  const totalTarget = goals.reduce((s, g) => s + (g.target || 0), 0);
  const totalTerkumpul = goals.reduce((s, g) => s + (g.current || 0), 0);
  const achieved = goals.filter(g => (g.current || 0) >= g.target).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">🎯 {t('goals.title')}</h1>
        <Btn onClick={openAdd}>+ {t('goals.title')}</Btn>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Target', value: rpFmt(totalTarget) },
          { label: 'Total Terkumpul', value: rpFmt(totalTerkumpul), color: 'text-emerald-600 dark:text-emerald-400' },
          { label: 'Tercapai', value: `${achieved} target`, color: achieved > 0 ? 'text-emerald-600 dark:text-emerald-400' : '' },
          { label: 'Dalam Proses', value: `${goals.length - achieved} target` },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
            <p className="text-xs text-slate-500">{s.label}</p>
            <p className={`text-lg font-bold ${s.color || 'text-slate-800 dark:text-slate-100'}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Goals Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 h-40 animate-pulse" />
          ))}
        </div>
      ) : goals.length === 0 ? (
        <EmptyState icon="🎯" title="Belum ada target keuangan"
          message="Buat target pertama Anda — liburan, rumah, dana darurat, dll."
          action={<Btn onClick={openAdd}>+ Buat Target</Btn>} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {goals.map(g => {
            const pct = g.target > 0 ? Math.min((g.current || 0) / g.target, 1) : 0;
            const st = statusLabel(g);
            const est = estimasi(g);
            const done = pct >= 1;
            return (
              <div key={g.id} className={`bg-white dark:bg-slate-800 rounded-2xl border shadow-sm p-5
                ${done ? 'border-emerald-200 dark:border-emerald-800/50' : 'border-slate-200 dark:border-slate-700'}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: g.warna || GOAL_COLORS[0] }} />
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">{g.nama}</h3>
                  </div>
                  {done && <span className="text-lg">🎉</span>}
                </div>

                {/* Progress bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>{rpFmt(g.current || 0)}</span>
                    <span>{rpFmt(g.target)}</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct * 100}%`, backgroundColor: g.warna || GOAL_COLORS[0] }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs font-semibold ${st.color}`}>{st.label}</span>
                  {est && <span className={`text-xs ${est.color}`}>{est.label}</span>}
                </div>

                {g.deadline && (
                  <p className="text-xs text-slate-400 mb-3">Target: {tglFmt(g.deadline)}</p>
                )}

                <div className="flex gap-2">
                  {!done && (
                    <Btn variant="accent" onClick={() => { setUpdateModal(g); setUpdateAmount(0); }} className="flex-1 text-xs py-1.5">
                      + Progress
                    </Btn>
                  )}
                  <Btn variant="ghost" onClick={() => openEdit(g)} className="text-xs py-1.5">Edit</Btn>
                  <button onClick={() => setDeleteTarget(g)}
                    className="px-2 py-1.5 rounded-lg text-xs bg-slate-100 dark:bg-slate-700
                      hover:bg-red-600 hover:text-white transition-colors">✕</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title={editDoc ? 'Edit Target' : 'Tambah Target'} size="md">
        <div className="space-y-4">
          <Field label="Nama Target" required>
            <Input value={form.nama} onChange={e => set('nama', e.target.value)} placeholder="Contoh: Dana Liburan Jepang" />
          </Field>
          <Field label="Jumlah Target (Rp)" required>
            <NumberInput value={form.target} onChange={v => set('target', v)} />
          </Field>
          {editDoc && (
            <Field label="Sudah Terkumpul (Rp)">
              <NumberInput value={form.current} onChange={v => set('current', v)} />
            </Field>
          )}
          <Field label="Target Tanggal">
            <Input type="date" value={form.deadline} onChange={e => set('deadline', e.target.value)} />
          </Field>
          <Field label="Warna">
            <div className="flex gap-2 flex-wrap">
              {GOAL_COLORS.map(c => (
                <button key={c} onClick={() => set('warna', c)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${form.warna === c ? 'border-slate-800 dark:border-white scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </Field>
          <Field label="Catatan">
            <Input value={form.catatan} onChange={e => set('catatan', e.target.value)} placeholder="Opsional" />
          </Field>
          <div className="flex gap-3 pt-2">
            <Btn variant="ghost" onClick={() => setModal(false)} className="flex-1">{t('common.batal')}</Btn>
            <Btn onClick={handleSave} disabled={saving} className="flex-1">{saving ? 'Menyimpan…' : t('common.simpan')}</Btn>
          </div>
        </div>
      </Modal>

      {/* Update Progress Modal */}
      <Modal open={!!updateModal} onClose={() => setUpdateModal(null)} title="Update Progress" size="sm">
        {updateModal && (
          <div className="space-y-4">
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 text-sm">
              <p><span className="text-slate-500">Target:</span> <strong>{updateModal.nama}</strong></p>
              <p><span className="text-slate-500">Terkumpul:</span> <strong>{rpFmt(updateModal.current || 0)}</strong></p>
              <p><span className="text-slate-500">Sisa:</span> <strong>{rpFmt((updateModal.target || 0) - (updateModal.current || 0))}</strong></p>
            </div>
            <Field label="Tambah Jumlah (Rp)" required>
              <NumberInput value={updateAmount} onChange={setUpdateAmount} />
            </Field>
            <div className="flex gap-3">
              <Btn variant="ghost" onClick={() => setUpdateModal(null)} className="flex-1">{t('common.batal')}</Btn>
              <Btn variant="success" onClick={handleUpdateProgress} className="flex-1">Simpan Progress</Btn>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteDocument(user.uid, 'goals', deleteTarget.id).then(() => addToast('Dihapus', 'success'))}
        title="Hapus Target"
        message={`Hapus target "${deleteTarget?.nama}"?`}
      />
    </div>
  );
}
