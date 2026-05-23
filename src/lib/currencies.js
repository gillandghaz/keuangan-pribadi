// 31 currencies covering all 35 global indices + existing
export const CURRENCIES = [
  { code: 'IDR', symbol: 'Rp ',   name: 'Indonesian Rupiah',    decimals: 0 },
  { code: 'USD', symbol: '$',     name: 'US Dollar',            decimals: 2 },
  { code: 'EUR', symbol: '€',     name: 'Euro',                 decimals: 2 },
  { code: 'GBP', symbol: '£',     name: 'British Pound',        decimals: 2 },
  { code: 'JPY', symbol: '¥',     name: 'Japanese Yen',         decimals: 0 },
  { code: 'HKD', symbol: 'HK$',   name: 'Hong Kong Dollar',     decimals: 2 },
  { code: 'SGD', symbol: 'S$',    name: 'Singapore Dollar',     decimals: 2 },
  { code: 'AUD', symbol: 'A$',    name: 'Australian Dollar',    decimals: 2 },
  { code: 'CAD', symbol: 'C$',    name: 'Canadian Dollar',      decimals: 2 },
  { code: 'CHF', symbol: 'Fr',    name: 'Swiss Franc',          decimals: 2 },
  { code: 'CNY', symbol: '¥',     name: 'Chinese Yuan',         decimals: 2 },
  { code: 'KRW', symbol: '₩',     name: 'South Korean Won',     decimals: 0 },
  { code: 'TWD', symbol: 'NT$',   name: 'Taiwan Dollar',        decimals: 2 },
  { code: 'INR', symbol: '₹',     name: 'Indian Rupee',         decimals: 2 },
  { code: 'MYR', symbol: 'RM',    name: 'Malaysian Ringgit',    decimals: 2 },
  { code: 'PHP', symbol: '₱',     name: 'Philippine Peso',      decimals: 2 },
  { code: 'THB', symbol: '฿',     name: 'Thai Baht',            decimals: 2 },
  { code: 'VND', symbol: '₫',     name: 'Vietnamese Dong',      decimals: 0 },
  { code: 'BRL', symbol: 'R$',    name: 'Brazilian Real',       decimals: 2 },
  { code: 'MXN', symbol: 'MX$',   name: 'Mexican Peso',         decimals: 2 },
  { code: 'CLP', symbol: 'CL$',   name: 'Chilean Peso',         decimals: 0 },
  { code: 'COP', symbol: 'CO$',   name: 'Colombian Peso',       decimals: 0 },
  { code: 'NOK', symbol: 'kr',    name: 'Norwegian Krone',      decimals: 2 },
  { code: 'PLN', symbol: 'zł',    name: 'Polish Zloty',         decimals: 2 },
  { code: 'ILS', symbol: '₪',     name: 'Israeli Shekel',       decimals: 2 },
  { code: 'QAR', symbol: 'QR',    name: 'Qatari Riyal',         decimals: 2 },
  { code: 'SAR', symbol: 'SR',    name: 'Saudi Riyal',          decimals: 2 },
  { code: 'AED', symbol: 'AED',   name: 'UAE Dirham',           decimals: 2 },
  { code: 'TRY', symbol: '₺',     name: 'Turkish Lira',         decimals: 2 },
  { code: 'ZAR', symbol: 'R',     name: 'South African Rand',   decimals: 2 },
  { code: 'RUB', symbol: '₽',     name: 'Russian Ruble',        decimals: 2 },
];

export const CURRENCY_MAP = Object.fromEntries(CURRENCIES.map(c => [c.code, c]));
export const CURRENCY_CODES = CURRENCIES.map(c => c.code);

export function getCurrencySymbol(code) {
  return CURRENCY_MAP[code]?.symbol || code + ' ';
}

export function formatCurrency(amount, currencyCode = 'IDR') {
  const c = CURRENCY_MAP[currencyCode] || CURRENCY_MAP['IDR'];
  const num = Number(amount) || 0;
  return c.symbol + num.toLocaleString('id-ID', {
    minimumFractionDigits: c.decimals,
    maximumFractionDigits: c.decimals,
  });
}

// 35 Global Market Indices
export const GLOBAL_INDICES = [
  // Asia Pacific
  { symbol: '^JKSE',       name: 'IDX Composite',        region: 'Asia', country: 'Indonesia', currency: 'IDR' },
  { symbol: '^KLSE',       name: 'FTSE Bursa Malaysia KLCI', region: 'Asia', country: 'Malaysia', currency: 'MYR' },
  { symbol: '^PSEI',       name: 'PSEi Index',           region: 'Asia', country: 'Philippines', currency: 'PHP' },
  { symbol: '^STI',        name: 'Straits Times Index',  region: 'Asia', country: 'Singapore', currency: 'SGD' },
  { symbol: '^SET.BK',     name: 'SET Index',            region: 'Asia', country: 'Thailand', currency: 'THB' },
  { symbol: '^VNINDEX.VN', name: 'VN-Index',             region: 'Asia', country: 'Vietnam', currency: 'VND' },
  { symbol: '^AORD',       name: 'All Ordinaries',       region: 'Asia', country: 'Australia', currency: 'AUD' },
  { symbol: '000001.SS',   name: 'SSE Composite',        region: 'Asia', country: 'China', currency: 'CNY' },
  { symbol: '^HSI',        name: 'Hang Seng Index',      region: 'Asia', country: 'Hong Kong', currency: 'HKD' },
  { symbol: '^BSESN',      name: 'S&P BSE SENSEX',       region: 'Asia', country: 'India', currency: 'INR' },
  { symbol: '^N225',       name: 'Nikkei 225',           region: 'Asia', country: 'Japan', currency: 'JPY' },
  { symbol: '^KS11',       name: 'KOSPI Index',          region: 'Asia', country: 'South Korea', currency: 'KRW' },
  { symbol: '^TWII',       name: 'TSE Weighted Index',   region: 'Asia', country: 'Taiwan', currency: 'TWD' },
  // Americas
  { symbol: '^BVSP',       name: 'Ibovespa Brasil',      region: 'Americas', country: 'Brazil', currency: 'BRL' },
  { symbol: '^GSPTSE',     name: 'S&P/TSX Composite',    region: 'Americas', country: 'Canada', currency: 'CAD' },
  { symbol: '^IPSA',       name: 'S&P/CLX IPSA',         region: 'Americas', country: 'Chile', currency: 'CLP' },
  { symbol: '^COLCAP',     name: 'MSCI COLCAP',          region: 'Americas', country: 'Colombia', currency: 'COP' },
  { symbol: '^MXX',        name: 'S&P/BMV IPC',          region: 'Americas', country: 'Mexico', currency: 'MXN' },
  { symbol: '^DJI',        name: 'Dow Jones Industrial', region: 'Americas', country: 'USA', currency: 'USD' },
  // Europe
  { symbol: '^ATX',        name: 'Austrian Traded Index',region: 'Europe', country: 'Austria', currency: 'EUR' },
  { symbol: '^FCHI',       name: 'CAC 40 Index',         region: 'Europe', country: 'France', currency: 'EUR' },
  { symbol: '^GDAXI',      name: 'German DAX',           region: 'Europe', country: 'Germany', currency: 'EUR' },
  { symbol: '^ISEQ',       name: 'ISEQ All-Share',       region: 'Europe', country: 'Ireland', currency: 'EUR' },
  { symbol: '^TA35',       name: 'Tel Aviv 35 Index',    region: 'Europe', country: 'Israel', currency: 'ILS' },
  { symbol: 'OSEBX.OL',   name: 'OSE Benchmark Index',  region: 'Europe', country: 'Norway', currency: 'NOK' },
  { symbol: 'WIG.WA',     name: 'WIG Total Return',      region: 'Europe', country: 'Poland', currency: 'PLN' },
  { symbol: '^IBEX',       name: 'IBEX 35 Index',        region: 'Europe', country: 'Spain', currency: 'EUR' },
  { symbol: '^SSMI',       name: 'Swiss Market Index',   region: 'Europe', country: 'Switzerland', currency: 'CHF' },
  { symbol: '^XU100.IS',   name: 'Borsa Istanbul 100',   region: 'Europe', country: 'Turkey', currency: 'TRY' },
  { symbol: '^FTSE',       name: 'UK FTSE 100',          region: 'Europe', country: 'UK', currency: 'GBP' },
  // Middle East & Africa
  { symbol: '^QSI',        name: 'Qatar Exchange Index', region: 'Middle East', country: 'Qatar', currency: 'QAR' },
  { symbol: 'IMOEX.ME',   name: 'MOEX Russia Index',     region: 'Europe', country: 'Russia', currency: 'RUB' },
  { symbol: '^TASI.SR',    name: 'Tadawul All Share',    region: 'Middle East', country: 'Saudi Arabia', currency: 'SAR' },
  { symbol: '^J203.JO',    name: 'FTSE/JSE All Share',   region: 'Africa', country: 'South Africa', currency: 'ZAR' },
  { symbol: '^DFMGI',      name: 'Dubai DFM General',    region: 'Middle East', country: 'UAE', currency: 'AED' },
];

// Default watchlist symbols for new users (top 10 major indices)
export const DEFAULT_WATCHLIST = [
  '^DJI', '^JKSE', '^N225', '^HSI', '^GDAXI',
  '^FTSE', '^BSESN', '^KS11', '^TWII', '^STI',
];

export const INDEX_MAP = Object.fromEntries(GLOBAL_INDICES.map(i => [i.symbol, i]));

// Exchange rate pairs for Yahoo Finance (base: USD)
export const FOREX_PAIRS = [
  'IDR=X', 'EURUSD=X', 'GBPUSD=X', 'JPY=X', 'HKDUSD=X',
  'SGDUSD=X', 'AUDUSD=X', 'CADUSD=X', 'CHFUSD=X', 'CNY=X',
  'KRW=X', 'TWDUSD=X', 'INR=X', 'MYR=X', 'PHP=X',
  'THB=X', 'VND=X', 'BRL=X', 'MXN=X', 'CLP=X',
  'COP=X', 'NOK=X', 'PLN=X', 'ILS=X', 'QAR=X',
  'SAR=X', 'AED=X', 'TRY=X', 'ZAR=X', 'RUB=X',
];
