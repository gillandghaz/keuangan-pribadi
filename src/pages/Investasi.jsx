import { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCollection, addDocument, updateDocument, deleteDocument } from '../hooks/useFirestore';
import { currFmt, rpFmt, tglFmt, todayISO } from '../lib/formatters';
import { JENIS_INVESTASI, SATUAN_INVESTASI, PLATFORM_INVESTASI, mataUangDariJenis, isAutoFetchable } from '../lib/seedData';
import { CURRENCY_CODES } from '../lib/currencies';
import { fetchMultipleQuotes } from '../lib/marketApi';
import { useToast } from '../components/ui/Toast';
import Modal from '../components/ui/Modal';
import { ConfirmDialog, SkeletonTable, EmptyState, Badge } from '../components/ui/index.jsx';
import { Field, Input, Select, Textarea, Btn } from '../components/ui/Form';
import NumberInput from '../components/ui/NumberInput';
import { db } from '../lib/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';

const CURRENCY_SYM = { IDR:'Rp ',USD:'$',JPY:'¥',HKD:'HK$',SGD:'S$',GBP:'£',EUR:'€' };

function defaultForm() {
  return {
    namaAset:'', kodeTicker:'', jenis:'Saham Indonesia (IDX)', platform:'',
    tanggalBeli: todayISO(), satuan:'Lembar', jumlah:0, hargaBeli:0,
    hargaSekarang:0, mataUang:'IDR', catatan:'',
  };
}

function calcInvestasi(f) {
  const q = f.satuan === 'Lot (=100 lembar)' ? (f.jumlah || 0) * 100 : (f.jumlah || 0);
  const modal = (f.hargaBeli || 0) * q;
  const nilai = (f.hargaSekarang || f.hargaBeli || 0) * q;
  const ur = nilai - modal;
  const ret = modal > 0 ? ur / modal * 100 : 0;
  return { q, modal, nilai, ur, ret };
}

export default function Investasi() {
  const { user } = useAuth();
  const addToast = useToast();
  const { docs: investasi, loading } = useCollection(user?.uid, 'investasi', 'tanggalBeli', 'desc');
  const [modal, setModal] = useState(false);
  const [editDoc, setEditDoc] = useState(null);
  const [form, setForm] = useState(defaultForm());
  const [saving, setSaving] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  function handleJenisChange(jenis) {
    const mataUang = mataUangDariJenis(jenis);
    setForm(f => ({ ...f, jenis, mataUang: mataUang || f.mataUang }));
  }

  const preview = calcInvestasi(form);

  // Summary (IDR only for total)
  const summary = useMemo(() => {
    const totalModal = investasi.filter(i => (i.mataUang||'IDR')==='IDR').reduce((s,i)=>s+(i.modalTotal||0),0);
    const totalNilai = investasi.filter(i => (i.mataUang||'IDR')==='IDR').reduce((s,i)=>s+(i.nilaiSekarang||i.modalTotal||0),0);
    const ur = totalNilai - totalModal;
    const ret = totalModal > 0 ? ur/totalModal*100 : 0;
    const hasMulti = investasi.some(i => (i.mataUang||'IDR')!=='IDR');
    return { totalModal, totalNilai, ur, ret, hasMulti };
  }, [investasi]);

  function openAdd() { setForm(defaultForm()); setEditDoc(null); setModal(true); }
  function openEdit(row) {
    setForm({
      namaAset: row.namaAset||'', kodeTicker: row.kodeTicker||'',
      jenis: row.jenis||'Saham Indonesia (IDX)', platform: row.platform||'',
      tanggalBeli: row.tanggalBeli|| todayISO(), satuan: row.satuan||'Lembar',
      jumlah: row.jumlah||0, hargaBeli: row.hargaBeli||0,
      hargaSekarang: row.hargaSekarang||0, mataUang: row.mataUang||'IDR', catatan: row.catatan||'',
    });
    setEditDoc(row);
    setModal(true);
  }

  async function handleSave() {
    if (!form.namaAset) { addToast('Nama aset wajib diisi','error'); return; }
    if (!form.jumlah || form.jumlah <= 0) { addToast('Jumlah harus > 0','error'); return; }
    setSaving(true);
    try {
      const { q, modal: modalTotal, nilai: nilaiSekarang, ur, ret } = calcInvestasi(form);
      let hargaSekarang = form.hargaSekarang || 0;
      // Auto-fetch if ticker set and US/crypto and no manual price
      if (!hargaSekarang && form.kodeTicker && isAutoFetchable(form.jenis)) {
        try {
          const price = await fetchMultipleQuotes([form.kodeTicker], null);
          hargaSekarang = price.results[form.kodeTicker] || 0;
        } catch {}
      }
      const { q: q2, modal: mt2, nilai: nt2, ur: ur2, ret: ret2 } = calcInvestasi({ ...form, hargaSekarang });
      const data = {
        ...form,
        kodeTicker: (form.kodeTicker||'').toUpperCase(),
        hargaSekarang,
        modalTotal: mt2,
        nilaiSekarang: nt2,
        untungRugi: ur2,
        returnPct: ret2,
      };
      if (editDoc) {
        await updateDocument(user.uid, 'investasi', editDoc.id, data);
        addToast('Investasi diperbarui','success');
      } else {
        await addDocument(user.uid, 'investasi', data);
        addToast('Investasi ditambahkan','success');
      }
      setModal(false);
    } catch(e) { addToast('Gagal: '+e.message,'error'); }
    finally { setSaving(false); }
  }

  async function handleUpdatePrices() {
    const toFetch = investasi.filter(i => i.kodeTicker && isAutoFetchable(i.jenis));
    if (toFetch.length === 0) { addToast('Tidak ada aset US/Kripto untuk diperbarui','info'); return; }
    setUpdating(true);
    let updated = 0, skipped = 0, errors = 0;
    const tickers = [...new Set(toFetch.map(i => i.kodeTicker.toUpperCase()))];
    const { results, errors: errs } = await fetchMultipleQuotes(tickers, null);
    for (const inv of toFetch) {
      const ticker = inv.kodeTicker.toUpperCase();
      if (errs[ticker]) { errors++; continue; }
      const price = results[ticker];
      if (!price) { skipped++; continue; }
      const { modal: mt, nilai: nt, ur, ret } = calcInvestasi({ ...inv, hargaSekarang: price });
      try {
        await updateDoc(doc(db,'users',user.uid,'investasi',inv.id), {
          hargaSekarang: price, nilaiSekarang: nt, untungRugi: ur, returnPct: ret,
          updatedAt: serverTimestamp(),
        });
        updated++;
      } catch { errors++; }
    }
    const idxSkipped = investasi.filter(i => i.kodeTicker && !isAutoFetchable(i.jenis)).length;
    addToast(`${updated} diperbarui, ${idxSkipped+skipped} dilewati (IDX/manual), ${errors} error`, updated>0?'success':'info');
    setUpdating(false);
  }

  async function handleDelete(row) {
    try {
      await deleteDocument(user.uid,'investasi',row.id);
      addToast('Investasi dihapus','success');
    } catch(e) { addToast('Gagal: '+e.message,'error'); }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">📈 Investasi</h1>
        <div className="flex gap-2">
          <Btn variant="ghost" onClick={handleUpdatePrices} disabled={updating}>
            {updating ? '⏳ Memperbarui…' : '🔄 Perbarui Harga'}
          </Btn>
          <Btn onClick={openAdd}>+ Tambah</Btn>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {[
          { label:'Total Modal (IDR)', value: rpFmt(summary.totalModal) },
          { label:'Nilai Sekarang (IDR)', value: rpFmt(summary.totalNilai) },
          { label:'Untung/Rugi', value: rpFmt(summary.ur), color: summary.ur>=0?'text-emerald-600 dark:text-emerald-400':'text-red-600 dark:text-red-400' },
          { label:'Return Total', value: summary.ret.toFixed(2).replace('.',',')+' %', color: summary.ret>=0?'text-emerald-600 dark:text-emerald-400':'text-red-600 dark:text-red-400' },
        ].map(s=>(
          <div key={s.label} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">{s.label}</p>
            <p className={`text-lg font-bold ${s.color||'text-slate-800 dark:text-slate-100'}`}>{s.value}</p>
          </div>
        ))}
      </div>
      {summary.hasMulti && (
        <p className="text-xs text-slate-400 dark:text-slate-500 mb-3 italic">
          * Total IDR bersifat estimasi — aset non-IDR tidak dikonversi otomatis
        </p>
      )}

      {/* IDX info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg px-4 py-2 mb-3 text-xs text-blue-700 dark:text-blue-300">
        ℹ️ Harga saham IDX, Reksa Dana, Emas & Deposito tidak tersedia otomatis — gunakan tombol Edit untuk input manual.
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {loading ? (
          <div className="p-4"><SkeletonTable rows={5} cols={8} /></div>
        ) : investasi.length===0 ? (
          <EmptyState icon="📈" title="Belum ada investasi" action={<Btn onClick={openAdd}>+ Tambah Investasi</Btn>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                  {['Nama Aset','Ticker','Jenis','Platform','Jumlah','Harga Beli','Modal','Harga Kini','Nilai Kini','Untung/Rugi','Return %','Mata Uang','Aksi'].map(h=>(
                    <th key={h} className="px-3 py-3 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {investasi.map(inv => {
                  const ur = inv.untungRugi || 0;
                  const sym = CURRENCY_SYM[inv.mataUang||'IDR'] || '';
                  return (
                    <tr key={inv.id}
                      className={`border-b border-slate-100 dark:border-slate-700/50 transition-colors
                        ${ur>=0?'hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10':'hover:bg-red-50/30 dark:hover:bg-red-900/10'}`}>
                      <td className="px-3 py-3 font-medium max-w-[120px] truncate" title={inv.namaAset}>{inv.namaAset}</td>
                      <td className="px-3 py-3 font-mono text-xs text-slate-500">{inv.kodeTicker||'-'}</td>
                      <td className="px-3 py-3 text-xs max-w-[100px] truncate">{inv.jenis}</td>
                      <td className="px-3 py-3 text-xs text-slate-500">{inv.platform||'-'}</td>
                      <td className="px-3 py-3 font-mono">{(inv.jumlah||0).toLocaleString('id-ID')} {inv.satuan?.includes('Lot')?'Lot':inv.satuan}</td>
                      <td className="px-3 py-3 font-mono text-xs">{sym}{(inv.hargaBeli||0).toLocaleString('id-ID')}</td>
                      <td className="px-3 py-3 font-mono text-xs">{sym}{(inv.modalTotal||0).toLocaleString('id-ID')}</td>
                      <td className="px-3 py-3 font-mono text-xs">{inv.hargaSekarang?`${sym}${(inv.hargaSekarang||0).toLocaleString('id-ID')}`:'-'}</td>
                      <td className="px-3 py-3 font-mono text-xs">{inv.nilaiSekarang?`${sym}${(inv.nilaiSekarang||0).toLocaleString('id-ID')}`:'-'}</td>
                      <td className={`px-3 py-3 font-mono text-xs font-semibold ${ur>=0?'text-emerald-600 dark:text-emerald-400':'text-red-600 dark:text-red-400'}`}>
                        {ur>=0?'+':''}{sym}{ur.toLocaleString('id-ID')}
                      </td>
                      <td className={`px-3 py-3 font-mono text-xs font-semibold ${(inv.returnPct||0)>=0?'text-emerald-600 dark:text-emerald-400':'text-red-600 dark:text-red-400'}`}>
                        {(inv.returnPct||0)>=0?'+':''}{(inv.returnPct||0).toFixed(2).replace('.',',')}%
                      </td>
                      <td className="px-3 py-3">
                        <Badge label={inv.mataUang||'IDR'} color="blue" />
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex gap-1">
                          <button onClick={()=>openEdit(inv)} className="px-2 py-1 rounded text-xs bg-slate-100 dark:bg-slate-700 hover:bg-[#4a90d9] hover:text-white transition-colors">Edit</button>
                          <button onClick={()=>setDeleteTarget(inv)} className="px-2 py-1 rounded text-xs bg-slate-100 dark:bg-slate-700 hover:bg-red-600 hover:text-white transition-colors">Hapus</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal open={modal} onClose={()=>setModal(false)} title={editDoc?'Edit Investasi':'Tambah Investasi'} size="lg">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Nama Aset" required>
            <Input value={form.namaAset} onChange={e=>set('namaAset',e.target.value)} placeholder="Contoh: BBCA, IHSG, Bitcoin" />
          </Field>
          <Field label="Kode Ticker">
            <Input value={form.kodeTicker} onChange={e=>set('kodeTicker',e.target.value.toUpperCase())} placeholder="BBCA / AAPL / BTC-USD" />
          </Field>
          <Field label="Jenis Aset" required>
            <Select value={form.jenis} onChange={e=>handleJenisChange(e.target.value)}>
              {JENIS_INVESTASI.map(j=><option key={j}>{j}</option>)}
            </Select>
          </Field>
          <Field label="Mata Uang">
            <Select value={form.mataUang} onChange={e=>set('mataUang',e.target.value)}>
              {CURRENCY_CODES.map(m=><option key={m}>{m}</option>)}
            </Select>
          </Field>
          <Field label="Platform">
            <Input list="platform-list" value={form.platform} onChange={e=>set('platform',e.target.value)} placeholder="Pilih atau ketik" />
            <datalist id="platform-list">{PLATFORM_INVESTASI.map(p=><option key={p} value={p}/>)}</datalist>
          </Field>
          <Field label="Tanggal Beli">
            <Input type="date" value={form.tanggalBeli} onChange={e=>set('tanggalBeli',e.target.value)} />
          </Field>
          <Field label="Satuan">
            <Select value={form.satuan} onChange={e=>set('satuan',e.target.value)}>
              {SATUAN_INVESTASI.map(s=><option key={s}>{s}</option>)}
            </Select>
          </Field>
          <Field label="Jumlah" required>
            <Input type="number" min="0" value={form.jumlah||''} onChange={e=>set('jumlah',parseFloat(e.target.value)||0)} />
          </Field>
          <Field label={`Harga Beli / Satuan (${form.mataUang})`} required>
            <Input type="number" min="0" step="0.01" value={form.hargaBeli||''} onChange={e=>set('hargaBeli',parseFloat(e.target.value)||0)} />
          </Field>
          <Field label={`Harga Sekarang / Satuan (${form.mataUang})`} hint={isAutoFetchable(form.jenis)&&form.kodeTicker?'Kosongkan untuk auto-fetch dari Finnhub':''}>
            <Input type="number" min="0" step="0.01" value={form.hargaSekarang||''} onChange={e=>set('hargaSekarang',parseFloat(e.target.value)||0)} />
          </Field>
          <div className="col-span-2">
            <Field label="Catatan">
              <Input value={form.catatan} onChange={e=>set('catatan',e.target.value)} placeholder="Opsional" />
            </Field>
          </div>
        </div>

        {/* Preview */}
        {(form.jumlah>0 && form.hargaBeli>0) && (
          <div className="mt-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 text-sm">
            <p className="font-semibold text-slate-700 dark:text-slate-300 mb-2">Preview:</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <span className="text-slate-500">Qty Efektif:</span>
              <span className="font-mono">{preview.q.toLocaleString('id-ID')}</span>
              <span className="text-slate-500">Modal Total:</span>
              <span className="font-mono">{(CURRENCY_SYM[form.mataUang]||'')}{preview.modal.toLocaleString('id-ID')}</span>
              {form.hargaSekarang > 0 && <>
                <span className="text-slate-500">Nilai Sekarang:</span>
                <span className="font-mono">{(CURRENCY_SYM[form.mataUang]||'')}{preview.nilai.toLocaleString('id-ID')}</span>
                <span className="text-slate-500">Estimasi Return:</span>
                <span className={`font-mono font-bold ${preview.ret>=0?'text-emerald-600':'text-red-600'}`}>
                  {preview.ret>=0?'+':''}{preview.ret.toFixed(2).replace('.',',')}%
                </span>
              </>}
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Btn variant="ghost" onClick={()=>setModal(false)} className="flex-1">Batal</Btn>
          <Btn onClick={handleSave} disabled={saving} className="flex-1">{saving?'Menyimpan…':'Simpan'}</Btn>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={()=>setDeleteTarget(null)} onConfirm={()=>handleDelete(deleteTarget)}
        title="Hapus Investasi" message={`Hapus "${deleteTarget?.namaAset}"?`} />
    </div>
  );
}
