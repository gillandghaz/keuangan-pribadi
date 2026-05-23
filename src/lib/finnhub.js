// Finnhub API client with rate limiting (max 1 req/sec) and 5-min cache

const CACHE = new Map(); // ticker → { price, ts }
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const queue = [];
let processing = false;
let lastReqTime = 0;
const MIN_INTERVAL = 1050; // ~1 req/sec

const API_KEY = import.meta.env.VITE_FINNHUB_API_KEY;

function processQueue() {
  if (processing || queue.length === 0) return;
  processing = true;
  const next = queue.shift();
  const now = Date.now();
  const wait = Math.max(0, MIN_INTERVAL - (now - lastReqTime));
  setTimeout(async () => {
    lastReqTime = Date.now();
    try {
      const res = await fetch(
        `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(next.ticker)}&token=${API_KEY}`
      );
      if (res.status === 429) {
        next.reject(new Error('RATE_LIMIT'));
        return;
      }
      const data = await res.json();
      const price = data.c || data.pc || 0;
      CACHE.set(next.ticker, { price, ts: Date.now() });
      next.resolve(price);
    } catch (e) {
      next.reject(e);
    } finally {
      processing = false;
      processQueue();
    }
  }, wait);
}

export function fetchQuote(ticker) {
  const t = String(ticker || '').toUpperCase().trim();
  if (!t) return Promise.reject(new Error('No ticker'));

  // Check cache
  const cached = CACHE.get(t);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return Promise.resolve(cached.price);
  }

  return new Promise((resolve, reject) => {
    queue.push({ ticker: t, resolve, reject });
    processQueue();
  });
}

export async function fetchMultipleQuotes(tickers, onProgress) {
  const results = {};
  const errors = {};
  for (const ticker of tickers) {
    try {
      const price = await fetchQuote(ticker);
      results[ticker] = price;
      if (onProgress) onProgress({ ticker, price, success: true });
    } catch (e) {
      errors[ticker] = e.message;
      if (onProgress) onProgress({ ticker, success: false, error: e.message });
    }
  }
  return { results, errors };
}
