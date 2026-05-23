import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

// Format IDR — integer (no decimals)
export function rpFmt(n) {
  const num = Math.round(Number(n) || 0);
  return 'Rp ' + num.toLocaleString('id-ID');
}

// Format any currency with optional decimals
export function currFmt(n, currency = 'IDR') {
  const num = Number(n) || 0;
  const symbols = {
    IDR:'Rp ',USD:'$',EUR:'€',GBP:'£',JPY:'¥',HKD:'HK$',SGD:'S$',
    AUD:'A$',CAD:'C$',CHF:'Fr',CNY:'¥',KRW:'₩',TWD:'NT$',INR:'₹',
    MYR:'RM',PHP:'₱',THB:'฿',VND:'₫',BRL:'R$',MXN:'MX$',CLP:'CL$',
    COP:'CO$',NOK:'kr',PLN:'zł',ILS:'₪',QAR:'QR',SAR:'SR',AED:'AED',
    TRY:'₺',ZAR:'R',RUB:'₽',
  };
  const noDecimal = ['IDR','JPY','KRW','VND','CLP','COP'];
  const decimals = noDecimal.includes(currency) ? 0 : 2;
  const sym = symbols[currency] || '';
  return sym + num.toLocaleString('id-ID', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

export function pctFmt(n) {
  return ((Number(n) || 0) * 100).toFixed(1).replace('.', ',') + '%';
}

export function pctFmtDirect(n) {
  return (Number(n) || 0).toFixed(1).replace('.', ',') + '%';
}

export function tglFmt(d) {
  if (!d) return '-';
  try {
    const dt = d instanceof Date ? d : (typeof d === 'string' ? parseISO(d) : new Date(d));
    return format(dt, 'dd/MM/yyyy', { locale: id });
  } catch { return '-'; }
}

export function bulanFmt(n) {
  const bulan = ['Januari','Februari','Maret','April','Mei','Juni',
    'Juli','Agustus','September','Oktober','November','Desember'];
  return bulan[(Number(n) || 1) - 1] || '';
}

export function bulanPendek(n) {
  const bulan = ['Jan','Feb','Mar','Apr','Mei','Jun',
    'Jul','Agu','Sep','Okt','Nov','Des'];
  return bulan[(Number(n) || 1) - 1] || '';
}

// Parse IDR string "1.500.000" or "1500000" or "1.500.000,55" → number
export function parseRp(str) {
  if (typeof str === 'number') return str;
  const s = String(str || '').trim();
  // Handle "1.500.000,55" format (Indonesian)
  const normalized = s.replace(/\./g, '').replace(',', '.');
  return parseFloat(normalized) || 0;
}

// Format number for display with optional decimals (Indonesian locale)
export function numFmt(n, decimals = 0) {
  return (Number(n) || 0).toLocaleString('id-ID', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function todayISO() {
  return format(new Date(), 'yyyy-MM-dd');
}

export function seqId(prefix = 'TRX') {
  const now = new Date();
  const stamp = format(now, 'yyyyMMddHHmmss');
  return `${prefix}-${stamp}`;
}
