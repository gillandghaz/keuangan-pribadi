import { useMemo } from 'react';
import { useLang } from '../context/LangContext';
import { rpFmt } from '../lib/formatters';

export function calcHealthScore({ pemasukan, pengeluaran, saldo, totalCicilan, anggaran, terpakaiMap, investasi, tabunganDarurat }) {
  let score = 0;
  const details = [];

  // 1. Rasio tabungan >= 20% (25 pts)
  const rasioTabungan = pemasukan > 0 ? saldo / pemasukan : 0;
  const s1 = rasioTabungan >= 0.2 ? 25 : Math.round(rasioTabungan / 0.2 * 25);
  score += s1;
  details.push({ key: 'rasioTabungan', score: s1, max: 25, pass: s1 === 25, value: `${(rasioTabungan * 100).toFixed(1)}%`, target: '≥ 20%' });

  // 2. Rasio cicilan < 30% (25 pts)
  const ratioCicilan = pemasukan > 0 ? totalCicilan / pemasukan : 0;
  const s2 = ratioCicilan < 0.3 ? 25 : Math.max(0, Math.round((1 - (ratioCicilan - 0.3) / 0.3) * 25));
  score += s2;
  details.push({ key: 'ratioCicilan', score: s2, max: 25, pass: s2 === 25, value: `${(ratioCicilan * 100).toFixed(1)}%`, target: '< 30%' });

  // 3. Anggaran tidak melebihi (20 pts)
  const melebihi = anggaran.filter(a => {
    const used = terpakaiMap[a.subkategori] || 0;
    return a.anggaranBulanan > 0 && used > a.anggaranBulanan;
  }).length;
  const s3 = melebihi === 0 ? 20 : Math.max(0, 20 - melebihi * 4);
  score += s3;
  details.push({ key: 'anggaran', score: s3, max: 20, pass: melebihi === 0, value: `${melebihi} kategori melebihi`, target: '0 kategori' });

  // 4. Dana darurat >= 3x pengeluaran (20 pts)
  const targetDarurat = pengeluaran * 3;
  const s4 = targetDarurat > 0
    ? Math.min(20, Math.round(tabunganDarurat / targetDarurat * 20))
    : tabunganDarurat > 0 ? 20 : 0;
  score += s4;
  details.push({ key: 'danadarurat', score: s4, max: 20, pass: s4 === 20, value: rpFmt(tabunganDarurat), target: `≥ ${rpFmt(targetDarurat)}` });

  // 5. Investasi aktif (10 pts)
  const s5 = investasi.length > 0 ? 10 : 0;
  score += s5;
  details.push({ key: 'investasi', score: s5, max: 10, pass: s5 === 10, value: `${investasi.length} aset`, target: '≥ 1 aset' });

  return { score: Math.min(100, score), details };
}

export default function HealthScoreCard({ score, details }) {
  const { t } = useLang();

  const { label, color, bg, ring } = useMemo(() => {
    if (score >= 70) return {
      label: t('health.sehat'), color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20', ring: 'border-emerald-200 dark:border-emerald-800'
    };
    if (score >= 40) return {
      label: t('health.perluPerhatian'), color: 'text-yellow-600 dark:text-yellow-400',
      bg: 'bg-yellow-50 dark:bg-yellow-900/20', ring: 'border-yellow-200 dark:border-yellow-800'
    };
    return {
      label: t('health.kritis'), color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-50 dark:bg-red-900/20', ring: 'border-red-200 dark:border-red-800'
    };
  }, [score, t]);

  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const strokeColor = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444';

  return (
    <div data-tour="health-score"
      className={`bg-white dark:bg-slate-800 rounded-2xl border shadow-sm p-5 ${ring}`}>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">💯</span>
        <h3 className="font-bold text-sm text-slate-700 dark:text-slate-200 uppercase tracking-wide">
          {t('health.title')}
        </h3>
      </div>

      <div className="flex items-center gap-6">
        {/* Circular progress */}
        <div className="relative shrink-0">
          <svg width="100" height="100" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" stroke="#e2e8f0" strokeWidth="10" />
            <circle
              cx="50" cy="50" r="40" fill="none"
              stroke={strokeColor} strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform="rotate(-90 50 50)"
              style={{ transition: 'stroke-dashoffset 1s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-2xl font-bold ${color}`}>{score}</span>
            <span className="text-[10px] text-slate-400">/100</span>
          </div>
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <p className={`font-bold text-sm mb-2 ${color}`}>{label}</p>
          <div className="space-y-1.5">
            {details?.map(d => (
              <div key={d.key} className="flex items-center gap-2">
                <span className="text-xs shrink-0">{d.pass ? '✅' : '⚠️'}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-400 truncate">{t(`health.${d.key}`)}</span>
                    <span className="text-slate-400 shrink-0 ml-1">{d.score}/{d.max}</span>
                  </div>
                  <div className="h-1 bg-slate-100 dark:bg-slate-700 rounded-full mt-0.5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${(d.score / d.max) * 100}%`, backgroundColor: strokeColor }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
