import * as cheerio from 'cheerio';

const URL = 'https://www.click-sec.com/corp/guide/fxneo/swplog/';
const TARGET_PAIRS = ['TRY_JPY', 'MXN_JPY', 'ZAR_JPY', 'HUF_JPY', 'USD_JPY', 'EUR_JPY', 'CHF_JPY', 'CZK_JPY'];
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

// GMO Click pair label -> canonical key mapping
const PAIR_MAP = {
  'トルコリラ/円': 'TRY_JPY', 'TRY/JPY': 'TRY_JPY',
  'メキシコペソ/円': 'MXN_JPY', 'MXN/JPY': 'MXN_JPY',
  '南アフリカランド/円': 'ZAR_JPY', 'ZAR/JPY': 'ZAR_JPY',
  'ハンガリーフォリント/円': 'HUF_JPY', 'HUF/JPY': 'HUF_JPY',
  '米ドル/円': 'USD_JPY', 'USD/JPY': 'USD_JPY',
  'ユーロ/円': 'EUR_JPY', 'EUR/JPY': 'EUR_JPY',
  'スイスフラン/円': 'CHF_JPY', 'CHF/JPY': 'CHF_JPY',
  'チェココルナ/円': 'CZK_JPY', 'CZK/JPY': 'CZK_JPY',
};

const UNITS = {
  TRY_JPY: 10000, MXN_JPY: 100000, ZAR_JPY: 100000,
  HUF_JPY: 100000, USD_JPY: 10000, EUR_JPY: 10000,
  CHF_JPY: 10000, CZK_JPY: 100000,
};

export async function scrapeGMO() {
  const res = await fetch(URL, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`GMO fetch failed: ${res.status}`);
  const html = await res.text();
  const $ = cheerio.load(html);
  const result = Object.fromEntries(TARGET_PAIRS.map(p => [p, null]));

  // Strategy 1: look for individual pair tables/sections
  $('table').each((_, table) => {
    const $table = $(table);
    const headerText = $table.prev('h2, h3, h4, .ttl, .title').text()
      + ' ' + $table.find('caption, thead th').first().text();

    let pairKey = null;
    for (const [label, key] of Object.entries(PAIR_MAP)) {
      if (headerText.includes(label)) { pairKey = key; break; }
    }

    // Strategy 2: scan the first row for pair name
    if (!pairKey) {
      const firstRowText = $table.find('tr').first().text();
      for (const [label, key] of Object.entries(PAIR_MAP)) {
        if (firstRowText.includes(label)) { pairKey = key; break; }
      }
    }

    if (!pairKey) return;

    // Get the last data row (most recent date)
    const rows = $table.find('tbody tr, tr').toArray();
    for (let i = rows.length - 1; i >= 0; i--) {
      const cells = $(rows[i]).find('td');
      if (cells.length < 2) continue;
      const values = cells.toArray().map(c => $(c).text().trim());
      // Find buy/sell numbers - try common column patterns
      const nums = values.map(v => parseFloat(v.replace(/,/g, ''))).filter(n => !isNaN(n));
      if (nums.length >= 2) {
        const buy = nums[nums.length - 2];
        const sell = nums[nums.length - 1];
        result[pairKey] = { swapBuy: buy, swapSell: sell, unit: UNITS[pairKey] || 10000 };
        break;
      }
    }
  });

  // Strategy 3: look for select/option-driven pair data or data attributes
  $('[data-pair], [data-currency]').each((_, el) => {
    const pair = $(el).attr('data-pair') || $(el).attr('data-currency') || '';
    const key = PAIR_MAP[pair] || TARGET_PAIRS.find(p => pair.replace('/', '_') === p);
    if (!key || result[key]) return;
    const buy = parseFloat($(el).attr('data-buy') || $(el).find('.buy').text());
    const sell = parseFloat($(el).attr('data-sell') || $(el).find('.sell').text());
    if (!isNaN(buy) && !isNaN(sell)) {
      result[key] = { swapBuy: buy, swapSell: sell, unit: UNITS[key] || 10000 };
    }
  });

  const found = Object.values(result).filter(v => v !== null).length;
  if (found === 0) console.warn('[GMO] No pairs parsed - page structure may have changed');
  return result;
}
