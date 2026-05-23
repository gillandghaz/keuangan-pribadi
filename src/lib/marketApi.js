// Unified market data client
// Uses Vercel serverless proxy for Yahoo Finance (avoids CORS)
// Falls back to Finnhub for US stocks/crypto if proxy unavailable

const PROXY_BASE = '/api/quotes';
const FINNHUB_KEY = import.meta.env.VITE_FINNHUB_API_KEY;

// In-memory cache: symbol → { data, ts }
const CACHE = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Rate limit: queue for Finnhub (1 req/sec)
const finnhubQueue = [];
let finnhubProcessing = false;
let lastFinnhubReq = 0;

// ─── Yahoo Finance via Vercel Proxy ────────────────────────────────────────

export async function fetchQuotesYahoo(symbols) {
  if (!symbols || symbols.length === 0) return {};

  // Check cache first
  const now = Date.now();
  const toFetch = [];
  const cached = {};

  for (const sym of symbols) {
    const entry = CACHE.get(sym);
    if (entry && now - entry.ts < CACHE_TTL) {
      cached[sym] = entry.data;
    } else {
      toFetch.push(sym);
    }
  }

  if (toFetch.length === 0) return cached;

  // Batch into groups of 20
  const results = { ...cached };
  const batches = [];
  for (let i = 0; i < toFetch.length; i += 20) {
    batches.push(toFetch.slice(i, i + 20));
  }

  for (const batch of batches) {
    try {
      const params = batch.join(',');
      const res = await fetch(`${PROXY_BASE}?symbols=${encodeURIComponent(params)}`);
      if (!res.ok) throw new Error(`Proxy error: ${res.status}`);
      const data = await res.json();
      for (const [sym, quote] of Object.entries(data.result || {})) {
        CACHE.set(sym, { data: quote, ts: Date.now() });
        results[sym] = quote;
      }
    } catch (err) {
      console.warn('Yahoo proxy batch failed:', err.message);
    }
  }

  return results;
}

// Single quote via Yahoo proxy
export async function fetchQuoteYahoo(symbol) {
  const results = await fetchQuotesYahoo([symbol]);
  return results[symbol] || null;
}

// ─── Forex rates (USD base) via Yahoo proxy ───────────────────────────────

let forexCache = null;
let forexCacheTs = 0;

export async function fetchForexRates() {
  const now = Date.now();
  if (forexCache && now - forexCacheTs < CACHE_TTL) {
    return forexCache;
  }

  // Fetch major pairs vs USD
  const pairs = [
    'USDIDR=X', 'USDEUR=X', 'USDGBP=X', 'USDJPY=X', 'USDHKD=X',
    'USDSGD=X', 'USDAUD=X', 'USDCAD=X', 'USDCHF=X', 'USDCNY=X',
    'USDKRW=X', 'USDTWD=X', 'USDINR=X', 'USDMYR=X', 'USDPHP=X',
    'USDTHB=X', 'USDVND=X', 'USDBRL=X', 'USDMXN=X', 'USDCLP=X',
    'USDCOP=X', 'USDNOK=X', 'USDPLN=X', 'USDILS=X', 'USDQAR=X',
    'USDSAR=X', 'USDAED=X', 'USDTRY=X', 'USDZAR=X', 'USDRUB=X',
  ];

  try {
    const results = await fetchQuotesYahoo(pairs);
    const rates = { USD: 1 };
    for (const [pair, data] of Object.entries(results)) {
      // pair like 'USDIDR=X' → currency 'IDR'
      const match = pair.match(/^USD([A-Z]{3})=X$/);
      if (match && data?.price) {
        rates[match[1]] = data.price;
      }
    }
    forexCache = rates;
    forexCacheTs = Date.now();
    return rates;
  } catch (err) {
    console.warn('Forex fetch failed:', err.message);
    return forexCache || { USD: 1 };
  }
}

// Convert amount from one currency to another
export async function convertCurrency(amount, from, to) {
  if (from === to) return amount;
  const rates = await fetchForexRates();
  const fromRate = rates[from] || 1;
  const toRate = rates[to] || 1;
  // rates are USD-based: amount / fromRate * toRate
  return (amount / fromRate) * toRate;
}

// Synchronous convert using cached rates (may be stale)
export function convertCurrencySync(amount, from, to, rates) {
  if (from === to || !rates) return amount;
  const fromRate = rates[from] || 1;
  const toRate = rates[to] || 1;
  return (amount / fromRate) * toRate;
}

// ─── Finnhub fallback for US stocks/crypto ────────────────────────────────

function finnhubFetch(ticker) {
  return new Promise((resolve, reject) => {
    finnhubQueue.push({ ticker: ticker.toUpperCase(), resolve, reject });
    processFinnhubQueue();
  });
}

function processFinnhubQueue() {
  if (finnhubProcessing || finnhubQueue.length === 0 || !FINNHUB_KEY) return;
  finnhubProcessing = true;
  const next = finnhubQueue.shift();
  const wait = Math.max(0, 1050 - (Date.now() - lastFinnhubReq));
  setTimeout(async () => {
    lastFinnhubReq = Date.now();
    try {
      const res = await fetch(
        `https://finnhub.io/api/v1/quote?symbol=${next.ticker}&token=${FINNHUB_KEY}`
      );
      if (res.status === 429) { next.reject(new Error('RATE_LIMIT')); return; }
      const data = await res.json();
      const price = data.c || data.pc || 0;
      next.resolve({ symbol: next.ticker, price, change: data.d, changePct: data.dp });
    } catch (e) {
      next.reject(e);
    } finally {
      finnhubProcessing = false;
      processFinnhubQueue();
    }
  }, wait);
}

// ─── Unified fetch (Yahoo first, Finnhub fallback) ────────────────────────

export async function fetchQuote(symbol) {
  // Try Yahoo first
  try {
    const q = await fetchQuoteYahoo(symbol);
    if (q?.price != null) return q;
  } catch {}

  // Fallback to Finnhub for US/crypto
  if (FINNHUB_KEY) {
    try {
      return await finnhubFetch(symbol);
    } catch {}
  }

  return null;
}

export async function fetchMultipleQuotes(symbols, onProgress) {
  const results = {};
  const errors = {};
  const all = await fetchQuotesYahoo(symbols);

  for (const sym of symbols) {
    if (all[sym]?.price != null) {
      results[sym] = all[sym].price;
      if (onProgress) onProgress({ ticker: sym, price: all[sym].price, success: true });
    } else {
      errors[sym] = 'Not found';
      if (onProgress) onProgress({ ticker: sym, success: false });
    }
  }
  return { results, errors };
}

// Clear all caches (useful for manual refresh)
export function clearCache() {
  CACHE.clear();
  forexCache = null;
  forexCacheTs = 0;
}
