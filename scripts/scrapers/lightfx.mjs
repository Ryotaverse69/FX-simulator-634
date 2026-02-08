import * as cheerio from 'cheerio';

const URL = 'https://lightfx.jp/service/swappoint/';
const TARGET_PAIRS = ['TRY_JPY', 'MXN_JPY', 'ZAR_JPY', 'HUF_JPY', 'USD_JPY', 'EUR_JPY', 'CHF_JPY', 'CZK_JPY'];
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const PAIR_MAP = {
  'TRY/JPY': 'TRY_JPY', 'トルコリラ/円': 'TRY_JPY', 'トルコリラ': 'TRY_JPY',
  'MXN/JPY': 'MXN_JPY', 'メキシコペソ/円': 'MXN_JPY', 'メキシコペソ': 'MXN_JPY',
  'ZAR/JPY': 'ZAR_JPY', '南アフリカランド/円': 'ZAR_JPY', '南アランド': 'ZAR_JPY',
  'HUF/JPY': 'HUF_JPY', 'ハンガリーフォリント/円': 'HUF_JPY', 'フォリント': 'HUF_JPY',
  'USD/JPY': 'USD_JPY', '米ドル/円': 'USD_JPY', '米ドル': 'USD_JPY',
  'EUR/JPY': 'EUR_JPY', 'ユーロ/円': 'EUR_JPY', 'ユーロ': 'EUR_JPY',
  'CHF/JPY': 'CHF_JPY', 'スイスフラン/円': 'CHF_JPY', 'スイス': 'CHF_JPY',
  'CZK/JPY': 'CZK_JPY', 'チェココルナ/円': 'CZK_JPY', 'コルナ': 'CZK_JPY',
};

// LightFX (Traders Securities): MXN, ZAR, HUF use 100,000; others 10,000
const UNITS = {
  TRY_JPY: 10000, MXN_JPY: 100000, ZAR_JPY: 100000,
  HUF_JPY: 100000, USD_JPY: 10000, EUR_JPY: 10000,
  CHF_JPY: 10000, CZK_JPY: 10000,
};

function identifyPair(text) {
  for (const [label, key] of Object.entries(PAIR_MAP)) {
    if (text.includes(label)) return key;
  }
  return null;
}

export async function scrapeLightFX() {
  const res = await fetch(URL, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`LightFX fetch failed: ${res.status}`);
  const html = await res.text();
  const $ = cheerio.load(html);
  const result = Object.fromEntries(TARGET_PAIRS.map(p => [p, null]));

  // Strategy 1: swap tables (similar to minnano - same parent company)
  $('table.table-market, table.swap-table, table[class*="swap"], table[class*="market"]').each((_, table) => {
    parseSwapTable($, $(table), result);
  });

  // Strategy 2: all tables, match by content
  if (Object.values(result).every(v => v === null)) {
    $('table').each((_, table) => {
      parseSwapTable($, $(table), result);
    });
  }

  // Strategy 3: div/list based layout
  if (Object.values(result).every(v => v === null)) {
    $('[class*="swap"], [class*="pair"], [class*="currency"]').each((_, el) => {
      const text = $(el).text();
      const key = identifyPair(text);
      if (!key || result[key]) return;
      const nums = text.match(/-?\d+\.?\d*/g);
      if (nums && nums.length >= 2) {
        result[key] = {
          swapBuy: parseFloat(nums[nums.length - 2]),
          swapSell: parseFloat(nums[nums.length - 1]),
          unit: UNITS[key] || 10000,
        };
      }
    });
  }

  const found = Object.values(result).filter(v => v !== null).length;
  if (found === 0) console.warn('[LightFX] No pairs parsed - page structure may have changed');
  return result;
}

function parseSwapTable($, $table, result) {
  const rows = $table.find('tr').toArray();
  for (const row of rows) {
    const cells = $(row).find('th, td').toArray().map(c => $(c).text().trim());
    const rowText = cells.join(' ');
    const key = identifyPair(rowText);
    if (!key || result[key]) continue;
    const numCells = cells.map(c => parseFloat(c.replace(/,/g, ''))).filter(n => !isNaN(n));
    if (numCells.length >= 2) {
      result[key] = {
        swapBuy: numCells[numCells.length - 2],
        swapSell: numCells[numCells.length - 1],
        unit: UNITS[key] || 10000,
      };
    }
  }
}
