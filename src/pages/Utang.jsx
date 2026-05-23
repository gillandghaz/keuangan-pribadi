import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { useCollection, addDocument, updateDocument, deleteDocument } from '../hooks/useFirestore';
import { rpFmt, tglFmt, todayISO, pctFmt } from '../lib/formatters';
import { JENIS_UTANG, JENIS_UTANG_EN } from '../lib/seedData';
import { useToast } from '../components/ui/Toast';
import Modal from '../components/ui/Modal';
import { ConfirmDialog, SkeletonTable, EmptyState, Badge } from '../components/ui/index.jsx';
import { Field, Input, Select, Btn } from '../components/ui/Form';
import NumberInput from '../components/ui/NumberInput';
import { useEffect } from 'react';

function calcCicilan(pokok, bungaPct, tenor) {
  if (!tenor || tenor <= 0) return 0;
  if (!bungaPct || bungaPct === 0) return pokok / tenor;
  const i = bungaPct / 100 / 12;
  return pokok * (i / (1 - Math.pow(1 + i, -tenor)));
}

function statusColor(s) {
  return { Aktif:'blue', Lunas:'green', Macet:'red', Restrukturisasi:'orange', Ditangguhkan:'yellow' }[s] || 'gray';
}

function defaultForm() {
  return { namaPinjaman:'', jenis:'KTA (Kredit Tanpa Agunan)', kreditor:'', tanggalMulai:todayISO(), jatuhTempo:'', pokokPinjaman:0, bunga:0, sisaTenor:12, status:'Aktif', catatan:'' };
}

export default function Utang() {
  const { user } = useAuth();
  const { t, lang } = useLang();
  const addToast = useToast();
  const { docs: utang, loading } = useCollection(user?.uid, 'utang', 'tanggalMulai', 'desc');
  const { docs: transaksi } = useCollection(user?.uid, 'transaksi', 'tanggal', 'desc');

  const [modal, setModal] = useState(false);
  const [editDoc, setEditDoc] = useState(null);
  const [form, setForm] = useState(defaultForm());
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [bayarModal, setBayarModal] = useState(null);
  const [bayarAmount, setBayarAmount] = useState(0);
  const [riwayatModal, setRiwayatModal] = useState(null);
  const [riwayat, setRiwayat] = useState([]);
  const [undoConfirm, setUndoConfirm] = useState(null);

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  const jenisOptions = lang === 'en' ? JENIS_UTANG_EN : JENIS_UTANG;
  const cicilan = useMemo(() => calcCicilan(form.pokokPinjaman, form.bunga, form.sisaTenor), [form.pokokPinjaman, form.bunga, form.sisaTenor]);
  const totalBunga = useMemo(() => form.bunga > 0 ? cicilan * form.sisaTenor - form.pokokPinjaman : 0, [cicilan, form.sisaTenor, form.pokokPinjaman, form.bunga]);

  const now = new Date();
  const aktif = utang.filter(u => u.status === 'Aktif');
  const totalSisaUtang = aktif.reduce((s,u)=>s+(u.sisaPokok||0),0);
  const totalCicilan = aktif.reduce((s,u)=>s+(u.cicilanPerBulan||0),0);
  const thisMonthIncome = transaksi.filter(t=>t.jenis==='Pemasukan'&&t.bulan==(now.getMonth()+1)&&t.tahun==now.getFullYear()).reduce((s,t)=>s+(t.jumlah||0),0);
  const ratioCicilan = thisMonthIncome > 0 ? totalCicilan / thisMonthIncome : 0;

  function openAdd() { setForm(defaultForm()); setEditDoc(null); setModal(true); }
  function openEdit(row) {
    setForm({ namaPinjaman:row.namaPinjaman||'', jenis:row.jenis||JENIS_UTANG[0], kreditor:row.kreditor||'', tanggalMulai:row.tanggalMulai||todayISO(), jatuhTempo:row.jatuhTempo||'', pokokPinjaman:row.pokokPinjaman||0, bunga:row.bunga||0, sisaTenor:row.sisaTenor||12, status:row.status||'Aktif', catatan:row.catatan||'' });
    setEditDoc(row); setModal(true);
  }

  async function handleSave() {
    if (!form.namaPinjaman) { addToast('Nama pinjaman wajib diisi','error'); return; }
    if (!form.pokokPinjaman||form.pokokPinjaman<=0) { addToast('Pokok harus > 0','error'); return; }
    setSaving(true);
    const cicilanPerBulan = calcCicilan(form.pokokPinjaman, form.bunga, form.sisaTenor);
    const data = { ...form, cicilanPerBulan, sisaPokok:editDoc?editDoc.sisaPokok:form.pokokPinjaman, sudahDibayar:editDoc?editDoc.sudahDibayar:0 };
    try {
      if (editDoc) { await updateDocument(user.uid,'utang',editDoc.id,data); addToast('Diperbarui','success'); }
      else { await addDocument(user.uid,'utang',data); addToast('Ditambahkan','success'); }
      setModal(false);
    } catch(e) { addToast('Gagal: '+e.message,'error'); }
    finally { setSaving(false); }
  }

  async function handleBayar() {
    if (!bayarModal||bayarAmount<=0) { addToast('Jumlah harus > 0','error'); return; }
    const sisaBaru = Math.max(0,(bayarModal.sisaPokok||0)-bayarAmount);
    const sudahBaru = (bayarModal.sudahDibayar||0)+bayarAmount;
    const tenorBaru = Math.max(0,(bayarModal.sisaTenor||0)-1);
    const tgl = format(new Date(),'dd/MM/yyyy');
    try {
      // Save payment to subcollection for undo support
      await addDoc(collection(db,'users',user.uid,'utang',bayarModal.id,'pembayaran'), {
        jumlah:bayarAmount, tanggal:tgl, sisaPokokBefore:bayarModal.sisaPokok||0,
        sudahDibayarBefore:bayarModal.sudahDibayar||0, sisaTenorBefore:bayarModal.sisaTenor||0,
        createdAt:serverTimestamp(),
      });
      await updateDocument(user.uid,'utang',bayarModal.id,{
        sisaPokok:sisaBaru, sudahDibayar:sudahBaru, sisaTenor:tenorBaru,
        status:sisaBaru<=0?'Lunas':bayarModal.status,
      });
      addToast(sisaBaru<=0?'🎉 Lunas!':'Pembayaran dicatat','success');
      setBayarModal(null); setBayarAmount(0);
    } catch(e) { addToast('Gagal: '+e.message,'error'); }
  }

  async function loadRiwayat(utangId) {
    const q = query(collection(db,'users',user.uid,'utang',utangId,'pembayaran'),orderBy('createdAt','desc'));
    const unsub = onSnapshot(q, snap => setRiwayat(snap.docs.map(d=>({id:d.id,...d.data()}))));
    return unsub;
  }

  function openRiwayat(row) {
    setRiwayatModal(row);
    loadRiwayat(row.id);
  }

  async function handleUndo(utangRow, bayar) {
    try {
      await updateDocument(user.uid,'utang',utangRow.id,{
        sisaPokok:bayar.sisaPokokBefore,
        sudahDibayar:bayar.sudahDibayarBefore,
        sisaTenor:bayar.sisaTenorBefore,
        status:'Aktif',
      });
      await deleteDoc(doc(db,'users',user.uid,'utang',utangRow.id,'pembayaran',bayar.id));
      addToast('Pembayaran dibatalkan','success');
      setUndoConfirm(null);
    } catch(e) { addToast('Gagal: '+e.message,'error'); }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">🏦 {t('utang.title')}</h1>
        <Btn onClick={openAdd}>+ Tambah Utang</Btn>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
          <p className="text-xs text-slate-500">{t('utang.sisaPokok')} Aktif</p>
          <p className="text-xl font-bold text-red-600 dark:text-red-400">{rpFmt(totalSisaUtang)}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
          <p className="text-xs text-slate-500">Total {t('utang.cicilanPerBulan')}</p>
          <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{rpFmt(totalCicilan)}</p>
        </div>
        <div className={`border rounded-xl p-4 ${ratioCicilan<0.3?'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800':'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'}`}>
          <p className="text-xs text-slate-500">Rasio Cicilan/Pemasukan</p>
          <p className={`text-xl font-bold ${ratioCicilan<0.3?'text-emerald-600 dark:text-emerald-400':'text-red-600 dark:text-red-400'}`}>
            {pctFmt(ratioCicilan)} {ratioCicilan<0.3?'✅ Aman':'⚠️ Waspada'}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {loading ? <div className="p-4"><SkeletonTable rows={4} cols={8} /></div>
        : utang.length===0 ? <EmptyState icon="🏦" title="Belum ada data utang" action={<Btn onClick={openAdd}>+ Tambah</Btn>} />
        : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                  {['Nama','Jenis','Kreditor','Tgl Mulai','Jatuh Tempo','Pokok','Bunga%','Cicilan/Bln','Sisa Pokok','Sudah Bayar','Tenor','Status','Aksi'].map(h=>(
                    <th key={h} className="px-3 py-3 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {utang.map(row=>(
                  <tr key={row.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-3 py-3 font-medium max-w-[120px] truncate">{row.namaPinjaman}</td>
                    <td className="px-3 py-3 text-xs">{row.jenis}</td>
                    <td className="px-3 py-3 text-xs">{row.kreditor||'-'}</td>
                    <td className="px-3 py-3 font-mono text-xs">{tglFmt(row.tanggalMulai)}</td>
                    <td className="px-3 py-3 font-mono text-xs">{row.jatuhTempo?tglFmt(row.jatuhTempo):'-'}</td>
                    <td className="px-3 py-3 font-mono text-xs">{rpFmt(row.pokokPinjaman)}</td>
                    <td className="px-3 py-3 text-xs">{row.bunga||0}%</td>
                    <td className="px-3 py-3 font-mono text-xs">{rpFmt(row.cicilanPerBulan||0)}</td>
                    <td className="px-3 py-3 font-mono text-xs text-red-600 dark:text-red-400">{rpFmt(row.sisaPokok||0)}</td>
                    <td className="px-3 py-3 font-mono text-xs text-emerald-600 dark:text-emerald-400">{rpFmt(row.sudahDibayar||0)}</td>
                    <td className="px-3 py-3 text-xs">{row.sisaTenor||0} bln</td>
                    <td className="px-3 py-3"><Badge label={row.status||'Aktif'} color={statusColor(row.status||'Aktif')} /></td>
                    <td className="px-3 py-3">
                      <div className="flex gap-1 flex-wrap">
                        {row.status==='Aktif'&&<button onClick={()=>{setBayarModal(row);setBayarAmount(row.cicilanPerBulan||0);}} className="px-2 py-1 rounded text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-600 hover:text-white transition-colors">Bayar</button>}
                        <button onClick={()=>openRiwayat(row)} className="px-2 py-1 rounded text-xs bg-slate-100 dark:bg-slate-700 hover:bg-[#4a90d9] hover:text-white transition-colors">Riwayat</button>
                        <button onClick={()=>openEdit(row)} className="px-2 py-1 rounded text-xs bg-slate-100 dark:bg-slate-700 hover:bg-[#4a90d9] hover:text-white transition-colors">Edit</button>
                        <button onClick={()=>setDeleteTarget(row)} className="px-2 py-1 rounded text-xs bg-slate-100 dark:bg-slate-700 hover:bg-red-600 hover:text-white transition-colors">Hapus</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal open={modal} onClose={()=>setModal(false)} title={editDoc?'Edit Utang':'Tambah Utang'} size="lg">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Nama Pinjaman" required><Input value={form.namaPinjaman} onChange={e=>set('namaPinjaman',e.target.value)} placeholder="Contoh: KPR BCA" /></Field>
          <Field label="Jenis"><Select value={form.jenis} onChange={e=>set('jenis',e.target.value)}>{jenisOptions.map(j=><option key={j}>{j}</option>)}</Select></Field>
          <Field label="Kreditor/Bank"><Input value={form.kreditor} onChange={e=>set('kreditor',e.target.value)} /></Field>
          <Field label="Status"><Select value={form.status} onChange={e=>set('status',e.target.value)}>{['Aktif','Lunas','Macet','Restrukturisasi','Ditangguhkan'].map(s=><option key={s}>{s}</option>)}</Select></Field>
          <Field label="Pokok Pinjaman (Rp)" required><NumberInput value={form.pokokPinjaman} onChange={v=>set('pokokPinjaman',v)} /></Field>
          <Field label="Bunga % / Tahun" hint="0 = tanpa bunga"><Input type="number" min="0" step="0.01" value={form.bunga||''} onChange={e=>set('bunga',parseFloat(e.target.value)||0)} placeholder="0" /></Field>
          <Field label="Sisa Tenor (Bulan)" required><Input type="number" min="1" value={form.sisaTenor||''} onChange={e=>set('sisaTenor',parseInt(e.target.value)||0)} /></Field>
          <div className="flex flex-col justify-end">
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 text-xs">
              <p className="font-semibold mb-1">Preview:</p>
              <p>Cicilan/bln: <strong>{rpFmt(cicilan)}</strong></p>
              {form.bunga>0&&<p>Est. total bunga: <strong className="text-orange-600">{rpFmt(totalBunga)}</strong></p>}
            </div>
          </div>
          <Field label="Tanggal Mulai"><Input type="date" value={form.tanggalMulai} onChange={e=>set('tanggalMulai',e.target.value)} /></Field>
          <Field label="Jatuh Tempo"><Input type="date" value={form.jatuhTempo} onChange={e=>set('jatuhTempo',e.target.value)} /></Field>
          <div className="col-span-2"><Field label="Catatan"><Input value={form.catatan} onChange={e=>set('catatan',e.target.value)} /></Field></div>
        </div>
        <div className="flex gap-3 pt-4">
          <Btn variant="ghost" onClick={()=>setModal(false)} className="flex-1">Batal</Btn>
          <Btn onClick={handleSave} disabled={saving} className="flex-1">{saving?'Menyimpan…':'Simpan'}</Btn>
        </div>
      </Modal>

      {/* Bayar Modal */}
      <Modal open={!!bayarModal} onClose={()=>setBayarModal(null)} title="Update Pembayaran" size="sm">
        {bayarModal&&(
          <div className="space-y-4">
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 text-sm space-y-1">
              <p><span className="text-slate-500">Nama:</span> <strong>{bayarModal.namaPinjaman}</strong></p>
              <p><span className="text-slate-500">Sisa Pokok:</span> <strong className="text-red-600">{rpFmt(bayarModal.sisaPokok||0)}</strong></p>
              <p><span className="text-slate-500">Cicilan Normal:</span> <strong>{rpFmt(bayarModal.cicilanPerBulan||0)}</strong></p>
            </div>
            <Field label="Jumlah Bayar (Rp)" required><NumberInput value={bayarAmount} onChange={setBayarAmount} /></Field>
            <div className="flex gap-3 pt-2">
              <Btn variant="ghost" onClick={()=>setBayarModal(null)} className="flex-1">Batal</Btn>
              <Btn variant="success" onClick={handleBayar} className="flex-1">Catat Pembayaran</Btn>
            </div>
          </div>
        )}
      </Modal>

      {/* Riwayat Modal */}
      <Modal open={!!riwayatModal} onClose={()=>setRiwayatModal(null)} title={`Riwayat Pembayaran — ${riwayatModal?.namaPinjaman}`} size="md">
        {riwayat.length===0?(
          <p className="text-slate-400 text-sm text-center py-8">Belum ada riwayat pembayaran</p>
        ):(
          <div className="space-y-2">
            {riwayat.map((r,i)=>(
              <div key={r.id} className="flex items-center justify-between bg-slate-50 dark:bg-slate-700/50 rounded-xl px-4 py-3">
                <div>
                  <p className="font-semibold text-sm text-emerald-600 dark:text-emerald-400">{rpFmt(r.jumlah)}</p>
                  <p className="text-xs text-slate-400">{r.tanggal} · Sisa sebelumnya: {rpFmt(r.sisaPokokBefore)}</p>
                </div>
                {i===0&&(
                  <button onClick={()=>setUndoConfirm({utang:riwayatModal,bayar:r})}
                    className="px-3 py-1 rounded-lg text-xs font-semibold bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 hover:bg-orange-600 hover:text-white transition-colors">
                    ↩ Undo
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </Modal>

      <ConfirmDialog open={!!undoConfirm} onClose={()=>setUndoConfirm(null)}
        onConfirm={()=>handleUndo(undoConfirm.utang,undoConfirm.bayar)}
        title="Batalkan Pembayaran" message={t('utang.undoKonfirmasi')} confirmLabel="Ya, Batalkan" />

      <ConfirmDialog open={!!deleteTarget} onClose={()=>setDeleteTarget(null)}
        onConfirm={()=>deleteDocument(user.uid,'utang',deleteTarget.id).then(()=>addToast('Dihapus','success'))}
        title="Hapus Utang" message={`Hapus "${deleteTarget?.namaPinjaman}"?`} />
    </div>
  );
}
