export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { symbols } = req.query;
  if (!symbols) return res.status(400).json({ error: 'symbols required' });

  const symbolList = symbols.split(',').map(s => s.trim()).filter(Boolean).slice(0, 50);
  if (!symbolList.length) return res.status(400).json({ error: 'No valid symbols' });

  try {
    const encoded = symbolList.map(encodeURIComponent).join(',');
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encoded}&fields=regularMarketPrice,regularMarketChange,regularMarketChangePercent,regularMarketPreviousClose,shortName,longName,currency,regularMarketTime`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://finance.yahoo.com/',
        'Origin': 'https://finance.yahoo.com',
      },
    });

    if (!response.ok) throw new Error(`Yahoo Finance HTTP ${response.status}`);

    const data = await response.json();
    const quotes = data?.quoteResponse?.result || [];
    const result = {};
    for (const q of quotes) {
      result[q.symbol] = {
        symbol: q.symbol,
        name: q.shortName || q.longName || q.symbol,
        price: q.regularMarketPrice ?? null,
        change: q.regularMarketChange ?? null,
        changePct: q.regularMarketChangePercent ?? null,
        prevClose: q.regularMarketPreviousClose ?? null,
        currency: q.currency ?? 'USD',
        timestamp: q.regularMarketTime ?? null,
      };
    }

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=60');
    return res.status(200).json({ result, count: Object.keys(result).length });
  } catch (err) {
    console.error('Yahoo proxy error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
