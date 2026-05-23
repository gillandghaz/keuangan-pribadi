import { useState, useMemo, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { useCollection } from '../hooks/useFirestore';
import { rpFmt, bulanFmt, bulanPendek } from '../lib/formatters';
import { useToast } from '../components/ui/Toast';
import { Btn, Field, Input, Select } from '../components/ui/Form';
import { SkeletonTable } from '../components/ui/index.jsx';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths, eachMonthOfInterval } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import * as XLSX from 'xlsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const PERIODS = ['mingguan', 'bulanan', 'tahunan'];

function SectionCard({ title, children }) {
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 mb-4">
      <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-4 text-sm uppercase tracking-wide">{title}</h3>
      {children}
    </div>
  );
}

export default function Laporan() {
  const { user } = useAuth();
  const { t, lang } = useLang();
  const addToast = useToast();
  const reportRef = useRef(null);

  const { docs: transaksi, loading: loadT } = useCollection(user?.uid, 'transaksi', 'tanggal', 'desc');
  const { docs: investasi } = useCollection(user?.uid, 'investasi', 'tanggalBeli', 'desc');
  const { docs: utang } = useCollection(user?.uid, 'utang', 'tanggalMulai', 'desc');

  const [period, setPeriod] = useState('bulanan');
  const [generated, setGenerated] = useState(false);
  const [exporting, setExporting] = useState(false);

  const now = new Date();
  const [selectedDate, setSelectedDate] = useState(format(now, 'yyyy-MM-dd'));

  const dateRange = useMemo(() => {
    const d = new Date(selectedDate);
    if (period === 'mingguan') return { start: startOfWeek(d, { weekStartsOn: 1 }), end: endOfWeek(d, { weekStartsOn: 1 }) };
    if (period === 'bulanan') return { start: startOfMonth(d), end: endOfMonth(d) };
    return { start: startOfYear(d), end: endOfYear(d) };
  }, [period, selectedDate]);

  const startStr = format(dateRange.start, 'yyyy-MM-dd');
  const endStr = format(dateRange.end, 'yyyy-MM-dd');

  const periodTrx = useMemo(() =>
    transaksi.filter(t => t.tanggal >= startStr && t.tanggal <= endStr),
    [transaksi, startStr, endStr]
  );

  const pemasukan = periodTrx.filter(t => t.jenis === 'Pemasukan').reduce((s, t) => s + (t.jumlah || 0), 0);
  const pengeluaran = periodTrx.filter(t => t.jenis === 'Pengeluaran').reduce((s, t) => s + (t.jumlah || 0), 0);
  const saldo = pemasukan - pengeluaran;

  // Breakdown per kategori
  const breakdown = useMemo(() => {
    const map = {};
    periodTrx.filter(t => t.jenis === 'Pengeluaran').forEach(t => {
      const k = t.kategori || 'Lainnya';
      map[k] = (map[k] || 0) + (t.jumlah || 0);
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [periodTrx]);

  // Previous period comparison
  const prevRange = useMemo(() => {
    if (period === 'mingguan') {
      const prev = new Date(dateRange.start); prev.setDate(prev.getDate() - 7);
      return { start: format(startOfWeek(prev, { weekStartsOn: 1 }), 'yyyy-MM-dd'), end: format(endOfWeek(prev, { weekStartsOn: 1 }), 'yyyy-MM-dd') };
    }
    if (period === 'bulanan') {
      const prev = subMonths(dateRange.start, 1);
      return { start: format(startOfMonth(prev), 'yyyy-MM-dd'), end: format(endOfMonth(prev), 'yyyy-MM-dd') };
    }
    return { start: startStr.replace(/\d{4}/, d => String(+d - 1)), end: endStr.replace(/\d{4}/, d => String(+d - 1)) };
  }, [period, dateRange, startStr, endStr]);

  const prevTrx = useMemo(() =>
    transaksi.filter(t => t.tanggal >= prevRange.start && t.tanggal <= prevRange.end),
    [transaksi, prevRange]
  );
  const prevPemasukan = prevTrx.filter(t => t.jenis === 'Pemasukan').reduce((s, t) => s + (t.jumlah || 0), 0);
  const prevPengeluaran = prevTrx.filter(t => t.jenis === 'Pengeluaran').reduce((s, t) => s + (t.jumlah || 0), 0);

  // Monthly chart data (for yearly report)
  const monthlyData = useMemo(() => {
    if (period !== 'tahunan') return [];
    const months = eachMonthOfInterval({ start: dateRange.start, end: dateRange.end });
    return months.map(m => {
      const ms = format(m, 'yyyy-MM');
      const mTrx = transaksi.filter(t => t.tanggal?.startsWith(ms));
      return {
        name: bulanPendek(m.getMonth() + 1),
        pemasukan: mTrx.filter(t => t.jenis === 'Pemasukan').reduce((s, t) => s + (t.jumlah || 0), 0),
        pengeluaran: mTrx.filter(t => t.jenis === 'Pengeluaran').reduce((s, t) => s + (t.jumlah || 0), 0),
      };
    });
  }, [period, transaksi, dateRange]);

  // Investasi summary
  const totalModalIDR = investasi.filter(i => (i.mataUang || 'IDR') === 'IDR').reduce((s, i) => s + (i.modalTotal || 0), 0);
  const totalNilaiIDR = investasi.filter(i => (i.mataUang || 'IDR') === 'IDR').reduce((s, i) => s + (i.nilaiSekarang || i.modalTotal || 0), 0);

  // Utang
  const utangAktif = utang.filter(u => u.status === 'Aktif');
  const totalSisaUtang = utangAktif.reduce((s, u) => s + (u.sisaPokok || 0), 0);

  const username = localStorage.getItem('username') || user?.email || '';
  const periodLabel = period === 'mingguan'
    ? `Minggu ${format(dateRange.start, 'dd MMM')} – ${format(dateRange.end, 'dd MMM yyyy')}`
    : period === 'bulanan'
    ? format(dateRange.start, 'MMMM yyyy', { locale: lang === 'id' ? idLocale : undefined })
    : format(dateRange.start, 'yyyy');

  async function handleExportPDF() {
    if (!reportRef.current) return;
    setExporting(true);
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      await html2pdf()
        .set({
          margin: 10,
          filename: `laporan-keuangan-${period}-${selectedDate.slice(0, 7)}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        })
        .from(reportRef.current)
        .save();
      addToast('PDF berhasil diunduh', 'success');
    } catch (e) {
      addToast('Export PDF gagal: ' + e.message, 'error');
    } finally {
      setExporting(false);
    }
  }

  function handleExportExcel() {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Ringkasan
    const summary = [
      ['LAPORAN KEUANGAN', periodLabel],
      ['Dibuat untuk:', username],
      ['Tanggal cetak:', format(now, 'dd/MM/yyyy HH:mm')],
      [],
      ['RINGKASAN', ''],
      ['Pemasukan', pemasukan],
      ['Pengeluaran', pengeluaran],
      ['Saldo Bersih', saldo],
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(summary), 'Ringkasan');

    // Sheet 2: Transaksi
    const trxHeaders = ['Tanggal', 'Jenis', 'Kategori', 'Subkategori', 'Keterangan', 'Jumlah', 'Metode'];
    const trxRows = periodTrx.map(t => [t.tanggal, t.jenis, t.kategori, t.subkategori || '', t.keterangan || '', t.jumlah, t.metodeBayar]);
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([trxHeaders, ...trxRows]), 'Transaksi');

    // Sheet 3: Breakdown Kategori
    const bdHeaders = ['Kategori', 'Total (Rp)', '% dari Pengeluaran'];
    const bdRows = breakdown.map(([k, v]) => [k, v, pengeluaran > 0 ? ((v / pengeluaran) * 100).toFixed(1) + '%' : '0%']);
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([bdHeaders, ...bdRows]), 'Breakdown Kategori');

    // Sheet 4: Investasi
    const invHeaders = ['Nama Aset', 'Jenis', 'Modal Total', 'Nilai Sekarang', 'Untung/Rugi', 'Return %'];
    const invRows = investasi.map(i => [i.namaAset, i.jenis, i.modalTotal || 0, i.nilaiSekarang || 0, i.untungRugi || 0, (i.returnPct || 0).toFixed(2) + '%']);
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([invHeaders, ...invRows]), 'Investasi');

    XLSX.writeFile(wb, `laporan-keuangan-${period}-${selectedDate.slice(0, 7)}.xlsx`);
    addToast('Excel berhasil diunduh', 'success');
  }

  const diff = (cur, prev) => {
    if (!prev) return null;
    const d = cur - prev;
    const pct = prev > 0 ? (d / prev * 100).toFixed(1) : null;
    return { d, pct, pos: d >= 0 };
  };

  const pDiff = diff(pemasukan, prevPemasukan);
  const eDiff = diff(pengeluaran, prevPengeluaran);

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">📋 {t('laporan.title')}</h1>
        {generated && (
          <div className="flex gap-2">
            <Btn variant="ghost" onClick={handleExportExcel}>📊 Excel</Btn>
            <Btn onClick={handleExportPDF} disabled={exporting}>
              {exporting ? '⏳ Membuat PDF…' : '📄 PDF'}
            </Btn>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase mb-2 block">{t('laporan.pilihPeriode')}</label>
            <div className="flex gap-2">
              {PERIODS.map(p => (
                <button key={p} onClick={() => { setPeriod(p); setGenerated(false); }}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors capitalize
                    ${period === p ? 'bg-[#1e3a5f] text-white' : 'border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
                  {t(`laporan.${p}`)}
                </button>
              ))}
            </div>
          </div>
          <Field label="Pilih Tanggal">
            <Input type="date" value={selectedDate} onChange={e => { setSelectedDate(e.target.value); setGenerated(false); }} />
          </Field>
          <Btn onClick={() => setGenerated(true)}>{t('laporan.generate')}</Btn>
        </div>
      </div>

      {!generated ? (
        <div className="text-center py-16 text-slate-400 dark:text-slate-500">
          <div className="text-5xl mb-4">📋</div>
          <p>Pilih periode dan klik "Buat Laporan"</p>
        </div>
      ) : loadT ? (
        <div className="p-4"><SkeletonTable rows={6} cols={4} /></div>
      ) : (
        <div ref={reportRef}>
          {/* Report Header */}
          <div className="bg-[#1e3a5f] text-white rounded-2xl p-6 mb-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-xl font-bold">💰 Laporan Keuangan</h2>
                <p className="text-blue-200 mt-1">{periodLabel}</p>
              </div>
              <div className="text-right text-sm text-blue-200">
                <p>{username}</p>
                <p>Dicetak: {format(now, 'dd/MM/yyyy HH:mm')}</p>
              </div>
            </div>
          </div>

          {/* Ringkasan */}
          <SectionCard title={t('laporan.ringkasan')}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: t('dashboard.pemasukan'), value: pemasukan, diff: pDiff, posGood: true, color: 'text-emerald-600 dark:text-emerald-400' },
                { label: t('dashboard.pengeluaran'), value: pengeluaran, diff: eDiff, posGood: false, color: 'text-red-600 dark:text-red-400' },
                { label: t('dashboard.saldoBersih'), value: saldo, color: saldo >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400' },
              ].map(item => (
                <div key={item.label} className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-1">{item.label}</p>
                  <p className={`text-xl font-bold ${item.color}`}>{rpFmt(item.value)}</p>
                  {item.diff && item.diff.pct && (
                    <p className={`text-xs mt-1 ${item.diff.pos === item.posGood ? 'text-emerald-500' : 'text-red-500'}`}>
                      {item.diff.pos ? '▲' : '▼'} {Math.abs(item.diff.pct)}% vs periode sebelumnya
                    </p>
                  )}
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Monthly chart for yearly */}
          {period === 'tahunan' && monthlyData.length > 0 && (
            <SectionCard title="Tren Bulanan">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={v => v >= 1e6 ? (v/1e6).toFixed(0)+'jt' : v} />
                  <Tooltip formatter={v => rpFmt(v)} />
                  <Legend />
                  <Bar dataKey="pemasukan" fill="#10b981" name="Pemasukan" radius={[4,4,0,0]} />
                  <Bar dataKey="pengeluaran" fill="#ef4444" name="Pengeluaran" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </SectionCard>
          )}

          {/* Breakdown Kategori */}
          {breakdown.length > 0 && (
            <SectionCard title={t('laporan.breakdown')}>
              <div className="space-y-2">
                {breakdown.map(([kat, total]) => {
                  const pct = pengeluaran > 0 ? total / pengeluaran : 0;
                  return (
                    <div key={kat}>
                      <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-0.5">
                        <span>{kat}</span>
                        <span className="font-semibold">{rpFmt(total)} ({(pct*100).toFixed(1)}%)</span>
                      </div>
                      <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-[#4a90d9] rounded-full" style={{ width: `${pct*100}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </SectionCard>
          )}

          {/* Top Pengeluaran */}
          <SectionCard title={t('laporan.topPengeluaran')}>
            {periodTrx.filter(t => t.jenis === 'Pengeluaran').sort((a,b)=>b.jumlah-a.jumlah).slice(0,5).length === 0 ? (
              <p className="text-sm text-slate-400">Tidak ada pengeluaran pada periode ini</p>
            ) : (
              <div className="space-y-2">
                {periodTrx.filter(t => t.jenis === 'Pengeluaran').sort((a,b)=>b.jumlah-a.jumlah).slice(0,5).map((trx, i) => (
                  <div key={trx.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#1e3a5f] text-white flex items-center justify-center text-xs font-bold shrink-0">{i+1}</span>
                      <div>
                        <p className="font-medium text-slate-800 dark:text-slate-100">{trx.keterangan || trx.subkategori || trx.kategori}</p>
                        <p className="text-xs text-slate-400">{trx.kategori} · {trx.tanggal}</p>
                      </div>
                    </div>
                    <span className="font-mono font-semibold text-red-600 dark:text-red-400">{rpFmt(trx.jumlah)}</span>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          {/* Investasi */}
          <SectionCard title={t('laporan.kinerjaInvestasi')}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
              <div><p className="text-xs text-slate-500">Total Modal (IDR)</p><p className="font-bold">{rpFmt(totalModalIDR)}</p></div>
              <div><p className="text-xs text-slate-500">Nilai Sekarang (IDR)</p><p className="font-bold">{rpFmt(totalNilaiIDR)}</p></div>
              <div><p className="text-xs text-slate-500">Untung/Rugi</p>
                <p className={`font-bold ${totalNilaiIDR-totalModalIDR >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{rpFmt(totalNilaiIDR-totalModalIDR)}</p>
              </div>
              <div><p className="text-xs text-slate-500">Jumlah Aset</p><p className="font-bold">{investasi.length}</p></div>
            </div>
          </SectionCard>

          {/* Utang */}
          <SectionCard title={t('laporan.statusUtang')}>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div><p className="text-xs text-slate-500">Total Sisa Utang Aktif</p><p className="font-bold text-red-600">{rpFmt(totalSisaUtang)}</p></div>
              <div><p className="text-xs text-slate-500">Utang Aktif</p><p className="font-bold">{utangAktif.length}</p></div>
              <div><p className="text-xs text-slate-500">Cicilan/Bulan</p><p className="font-bold">{rpFmt(utangAktif.reduce((s,u)=>s+(u.cicilanPerBulan||0),0))}</p></div>
            </div>
          </SectionCard>
        </div>
      )}
    </div>
  );
}
