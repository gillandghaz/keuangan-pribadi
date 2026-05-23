import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { rpFmt, bulanFmt, bulanPendek, pctFmt } from '../lib/formatters';
import { Skeleton } from '../components/ui/index.jsx';
import WelcomeModal, { checkAndSeed } from '../components/WelcomeModal';
import { useToast } from '../components/ui/Toast';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, LabelList,
} from 'recharts';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { id } from 'date-fns/locale';

function Card({ title, icon, children, className = '' }) {
  return (
    <div className={`bg-white dark:bg-slate-800 rounded-2xl border border-slate-200
      dark:border-slate-700 shadow-sm p-5 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">{icon}</span>
        <h3 className="font-bold text-sm text-slate-700 dark:text-slate-200 uppercase tracking-wide">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Stat({ label, value, color = '' }) {
  return (
    <div>
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      <p className={`text-lg font-bold ${color || 'text-slate-800 dark:text-slate-100'}`}>{value}</p>
    </div>
  );
}

const COLORS = ['#4a90d9','#1e3a5f','#2d5f8a','#6db3f2','#a8d4f5'];

export default function Dashboard() {
  const { user } = useAuth();
  const addToast = useToast();
  const [transaksi, setTransaksi] = useState([]);
  const [investasi, setInvestasi] = useState([]);
  const [utang, setUtang] = useState([]);
  const [anggaran, setAnggaran] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [seeded, setSeeded] = useState(false);

  const now = new Date();
  const thisMonth = now.getMonth() + 1;
  const thisYear = now.getFullYear();

  useEffect(() => {
    if (!user) return;
    let count = 0;
    const done = () => { count++; if (count >= 4) setLoading(false); };

    const unsubT = onSnapshot(
      query(collection(db, 'users', user.uid, 'transaksi'), orderBy('tanggal', 'desc')),
      s => { setTransaksi(s.docs.map(d => ({ id: d.id, ...d.data() }))); done(); }
    );
    const unsubI = onSnapshot(collection(db, 'users', user.uid, 'investasi'),
      s => { setInvestasi(s.docs.map(d => ({ id: d.id, ...d.data() }))); done(); }
    );
    const unsubU = onSnapshot(collection(db, 'users', user.uid, 'utang'),
      s => { setUtang(s.docs.map(d => ({ id: d.id, ...d.data() }))); done(); }
    );
    const unsubA = onSnapshot(collection(db, 'users', user.uid, 'anggaran'),
      s => { setAnggaran(s.docs.map(d => ({ id: d.id, ...d.data() }))); done(); }
    );

    // Check if first login
    checkAndSeed(user.uid, null).then(wasEmpty => {
      if (wasEmpty) setShowWelcome(true);
    });

    return () => { unsubT(); unsubI(); unsubU(); unsubA(); };
  }, [user]);

  // ── Computed values ──────────────────────────────────────────
  const monthTrx = transaksi.filter(t => t.bulan == thisMonth && t.tahun == thisYear);
  const yearTrx = transaksi.filter(t => t.tahun == thisYear);

  const pemasukan = monthTrx.filter(t => t.jenis === 'Pemasukan').reduce((s, t) => s + (t.jumlah || 0), 0);
  const pengeluaran = monthTrx.filter(t => t.jenis === 'Pengeluaran').reduce((s, t) => s + (t.jumlah || 0), 0);
  const saldo = pemasukan - pengeluaran;
  const rasioTabungan = pemasukan > 0 ? saldo / pemasukan : 0;

  const yearPemasukan = yearTrx.filter(t => t.jenis === 'Pemasukan').reduce((s, t) => s + (t.jumlah || 0), 0);
  const yearPengeluaran = yearTrx.filter(t => t.jenis === 'Pengeluaran').reduce((s, t) => s + (t.jumlah || 0), 0);
  const yearSaldo = yearPemasukan - yearPengeluaran;
  const yearDividen = yearTrx.filter(t =>
    t.jenis === 'Pemasukan' && (t.kategori || '').toLowerCase().includes('dividen')
  ).reduce((s, t) => s + (t.jumlah || 0), 0);

  // Anggaran
  const totalAnggaran = anggaran.reduce((s, a) => s + (a.anggaranBulanan || 0), 0);
  const terpakai = anggaran.reduce((sum, a) => {
    const used = monthTrx
      .filter(t => t.jenis === 'Pengeluaran' &&
        (t.kategori === a.subkategori || t.subkategori === a.subkategori))
      .reduce((s, t) => s + (t.jumlah || 0), 0);
    return sum + used;
  }, 0);
  const terpakaiByKat = {};
  monthTrx.filter(t => t.jenis === 'Pengeluaran').forEach(t => {
    const k = t.kategori || 'Lainnya';
    terpakaiByKat[k] = (terpakaiByKat[k] || 0) + (t.jumlah || 0);
  });
  const anggaranMelebihi = anggaran.filter(a => {
    const used = monthTrx
      .filter(t => t.jenis === 'Pengeluaran' &&
        (t.kategori === a.subkategori || t.subkategori === a.subkategori))
      .reduce((s, t) => s + (t.jumlah || 0), 0);
    return a.anggaranBulanan > 0 && used > a.anggaranBulanan;
  }).length;

  // Utang aktif
  const utangAktif = utang.filter(u => u.status === 'Aktif');
  const totalSisaUtang = utangAktif.reduce((s, u) => s + (u.sisaPokok || 0), 0);
  const totalCicilan = utangAktif.reduce((s, u) => s + (u.cicilanPerBulan || 0), 0);
  const ratioCicilan = pemasukan > 0 ? (totalCicilan / pemasukan) : 0;

  // Investasi
  const totalModal = investasi.reduce((s, i) => {
    if ((i.mataUang || 'IDR') === 'IDR') return s + (i.modalTotal || 0);
    return s;
  }, 0);
  const totalNilai = investasi.reduce((s, i) => {
    if ((i.mataUang || 'IDR') === 'IDR') return s + (i.nilaiSekarang || i.modalTotal || 0);
    return s;
  }, 0);
  const totalUR = totalNilai - totalModal;
  const totalReturn = totalModal > 0 ? totalUR / totalModal * 100 : 0;
  const hasMultiCurrency = investasi.some(i => (i.mataUang || 'IDR') !== 'IDR');

  // Top 5 pengeluaran
  const top5 = Object.entries(terpakaiByKat)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value]) => ({
      name,
      value,
      pct: pengeluaran > 0 ? (value / pengeluaran * 100).toFixed(1) : 0,
    }));

  // Last 12 months line chart
  const last12 = Array.from({ length: 12 }, (_, i) => {
    const d = subMonths(now, 11 - i);
    const m = d.getMonth() + 1;
    const y = d.getFullYear();
    const monthTrxs = transaksi.filter(t => t.bulan == m && t.tahun == y);
    return {
      label: bulanPendek(m),
      pemasukan: monthTrxs.filter(t => t.jenis === 'Pemasukan').reduce((s, t) => s + (t.jumlah || 0), 0),
      pengeluaran: monthTrxs.filter(t => t.jenis === 'Pengeluaran').reduce((s, t) => s + (t.jumlah || 0), 0),
    };
  });

  // Dividen last 3 months
  const last3Dividen = [0, 1, 2].map(i => {
    const d = subMonths(now, i);
    const m = d.getMonth() + 1;
    const y = d.getFullYear();
    return {
      label: `${bulanFmt(m)} ${y}`,
      total: transaksi
        .filter(t => t.bulan == m && t.tahun == y &&
          t.jenis === 'Pemasukan' && (t.kategori || '').toLowerCase().includes('dividen'))
        .reduce((s, t) => s + (t.jumlah || 0), 0),
    };
  });

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array(6).fill(0).map((_, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 h-40">
            <Skeleton className="h-4 w-32 mb-4" />
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-40" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <WelcomeModal
        open={showWelcome}
        onClose={() => setShowWelcome(false)}
        onSeed={() => checkAndSeed(user.uid, addToast).then(() => setSeeded(true))}
      />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Dashboard</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          {format(now, 'EEEE, d MMMM yyyy', { locale: id })}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

        {/* A: Arus Kas */}
        <Card title={`Arus Kas — ${bulanFmt(thisMonth)} ${thisYear}`} icon="💵">
          <div className="grid grid-cols-2 gap-3">
            <Stat label="Pemasukan" value={rpFmt(pemasukan)} color="text-emerald-600 dark:text-emerald-400" />
            <Stat label="Pengeluaran" value={rpFmt(pengeluaran)} color="text-red-600 dark:text-red-400" />
            <Stat
              label="Saldo Bersih"
              value={rpFmt(saldo)}
              color={saldo >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}
            />
            <Stat label="Rasio Tabungan" value={pctFmt(rasioTabungan)} />
          </div>
        </Card>

        {/* B: Rekap Tahun */}
        <Card title={`Rekap Tahun ${thisYear}`} icon="📆">
          <div className="grid grid-cols-2 gap-3">
            <Stat label="Pemasukan Tahun" value={rpFmt(yearPemasukan)} color="text-emerald-600 dark:text-emerald-400" />
            <Stat label="Pengeluaran Tahun" value={rpFmt(yearPengeluaran)} color="text-red-600 dark:text-red-400" />
            <Stat
              label="Saldo Bersih"
              value={rpFmt(yearSaldo)}
              color={yearSaldo >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}
            />
            <Stat label="Total Dividen" value={rpFmt(yearDividen)} color="text-[#4a90d9]" />
          </div>
        </Card>

        {/* C: Anggaran */}
        <Card title="Kontrol Anggaran" icon="📅">
          <div className="grid grid-cols-2 gap-3">
            <Stat label="Total Anggaran" value={rpFmt(totalAnggaran)} />
            <Stat
              label={`Terpakai (${totalAnggaran > 0 ? (terpakai / totalAnggaran * 100).toFixed(0) : 0}%)`}
              value={rpFmt(terpakai)}
              color={terpakai > totalAnggaran ? 'text-red-600 dark:text-red-400' : 'text-slate-800 dark:text-slate-100'}
            />
            <Stat label="Sisa Anggaran" value={rpFmt(totalAnggaran - terpakai)} />
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Kategori Melebihi</p>
              <p className={`text-lg font-bold ${anggaranMelebihi > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {anggaranMelebihi} kategori
              </p>
            </div>
          </div>
        </Card>

        {/* D: Utang */}
        <Card title="Ringkasan Utang Aktif" icon="🏦">
          {utangAktif.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">Tidak ada utang aktif</p>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Stat label="Total Sisa Utang" value={rpFmt(totalSisaUtang)} color="text-red-600 dark:text-red-400" />
                <Stat label="Cicilan/Bulan" value={rpFmt(totalCicilan)} />
              </div>
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold
                ${ratioCicilan < 0.3
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'
                  : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'}`}>
                <span>{ratioCicilan < 0.3 ? '✅' : '⚠️'}</span>
                <span>Rasio Cicilan: {pctFmt(ratioCicilan)} — {ratioCicilan < 0.3 ? 'Aman' : 'WASPADA'}</span>
              </div>
            </div>
          )}
        </Card>

        {/* E: Investasi */}
        <Card title="Portofolio Investasi" icon="📈">
          {investasi.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">Belum ada data investasi</p>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Stat label="Total Modal" value={rpFmt(totalModal)} />
                <Stat label="Nilai Sekarang" value={rpFmt(totalNilai)} />
                <Stat
                  label="Untung/Rugi"
                  value={rpFmt(totalUR)}
                  color={totalUR >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}
                />
                <Stat
                  label="Return Total"
                  value={totalReturn.toFixed(2).replace('.', ',') + '%'}
                  color={totalReturn >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}
                />
              </div>
              {hasMultiCurrency && (
                <p className="text-xs text-slate-400 dark:text-slate-500 italic">
                  * Total IDR bersifat estimasi (multi-mata uang)
                </p>
              )}
            </div>
          )}
        </Card>

        {/* H: Dividen */}
        <Card title="Dividen Ringkasan" icon="💰">
          {yearDividen === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">Belum ada data dividen tahun ini</p>
          ) : (
            <div className="space-y-3">
              <Stat label="Total Dividen Tahun Ini" value={rpFmt(yearDividen)} color="text-[#4a90d9]" />
              <div className="space-y-1.5">
                {last3Dividen.map((d, i) => (
                  <div key={i} className="flex justify-between items-center text-sm">
                    <span className="text-slate-600 dark:text-slate-400">{d.label}</span>
                    <span className={`font-semibold ${d.total > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                      {d.total > 0 ? rpFmt(d.total) : '-'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* F: Top 5 Pengeluaran */}
        <Card title={`Top 5 Pengeluaran — ${bulanFmt(thisMonth)}`} icon="📊" className="md:col-span-2 xl:col-span-1">
          {top5.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">Belum ada pengeluaran bulan ini</p>
          ) : (
            <div className="space-y-2">
              {top5.map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-0.5">
                    <span className="truncate max-w-[60%]">{item.name}</span>
                    <span className="font-semibold">{rpFmt(item.value)} ({item.pct}%)</span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#4a90d9] rounded-full"
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* G: Line Chart 12 bulan */}
        <Card title="Pemasukan vs Pengeluaran (12 Bulan)" icon="📉" className="md:col-span-2">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={last12}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis
                tick={{ fontSize: 10 }}
                tickFormatter={v => v >= 1e6 ? (v / 1e6).toFixed(0) + 'jt' : v.toLocaleString('id-ID')}
              />
              <Tooltip
                formatter={(v, name) => [rpFmt(v), name === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran']}
              />
              <Line type="monotone" dataKey="pemasukan" stroke="#10b981" strokeWidth={2} dot={false} name="pemasukan" />
              <Line type="monotone" dataKey="pengeluaran" stroke="#ef4444" strokeWidth={2} dot={false} name="pengeluaran" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

      </div>
    </div>
  );
}
