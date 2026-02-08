import * as cheerio from 'cheerio';

const URL = 'https://www.central-tanshifx.com/market/swappoint/';
const TARGET_PAIRS = ['TRY_JPY', 'MXN_JPY', 'ZAR_JPY', 'HUF_JPY', 'USD_JPY', 'EUR_JPY', 'CHF_JPY', 'CZK_JPY'];
const UNSUPPORTED = ['CZK_JPY'];
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const PAIR_MAP = {
  'TRY/JPY': 'TRY_JPY', 'トルコリラ/円': 'TRY_JPY', 'トルコリラ': 'TRY_JPY',
  'MXN/JPY': 'MXN_JPY', 'メキシコペソ/円': 'MXN_JPY', 'メキシコペソ': 'MXN_JPY',
  'ZAR/JPY': 'ZAR_JPY', '南アフリカランド/円': 'ZAR_JPY', '南アランド': 'ZAR_JPY',
  'HUF/JPY': 'HUF_JPY', 'ハンガリーフォリント/円': 'HUF_JPY', 'フォリント': 'HUF_JPY',
  'USD/JPY': 'USD_JPY', '米ドル/円': 'USD_JPY', '米ドル': 'USD_JPY',
  'EUR/JPY': 'EUR_JPY', 'ユーロ/円': 'EUR_JPY', 'ユーロ': 'EUR_JPY',
  'CHF/JPY': 'CHF_JPY', 'スイスフラン/円': 'CHF_JPY', 'スイス': 'CHF_JPY',
};

function identifyPair(text) {
  for (const [label, key] of Object.entries(PAIR_MAP)) {
    if (text.includes(label)) return key;
  }
  return null;
}

export async function scrapeCentral() {
  const res = await fetch(URL, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`Central fetch failed: ${res.status}`);
  const html = await res.text();
  const $ = cheerio.load(html);
  const result = Object.fromEntries(TARGET_PAIRS.map(p => [p, null]));

  // Strategy 1: Central Tanshi typically has a single table or per-pair tables
  $('table').each((_, table) => {
    const $table = $(table);

    // Check if table header/caption identifies a single pair
    const caption = $table.find('caption').text() + ' ' + $table.prev('h2, h3, h4, .title').text();
    const tablePair = identifyPair(caption);

    if (tablePair && !UNSUPPORTED.includes(tablePair)) {
      // Calendar-style: get last data row
      const rows = $table.find('tbody tr, tr:not(:first-child)').toArray();
      for (let i = rows.length - 1; i >= 0; i--) {
        const cells = $(rows[i]).find('td').toArray().map(c => $(c).text().trim());
        const nums = cells.map(c => parseFloat(c.replace(/,/g, ''))).filter(n => !isNaN(n));
        if (nums.length >= 2 && !result[tablePair]) {
          result[tablePair] = {
            swapBuy: nums[nums.length - 2],
            swapSell: nums[nums.length - 1],
            unit: 10000,
          };
          break;
        }
      }
      return;
    }

    // Multi-pair table: each row is a different pair
    const rows = $table.find('tr').toArray();
    for (const row of rows) {
      const cells = $(row).find('th, td').toArray().map(c => $(c).text().trim());
      const rowText = cells.join(' ');
      const key = identifyPair(rowText);
      if (!key || result[key] || UNSUPPORTED.includes(key)) continue;

      const numCells = cells.map(c => parseFloat(c.replace(/,/g, ''))).filter(n => !isNaN(n));
      if (numCells.length >= 2) {
        result[key] = {
          swapBuy: numCells[numCells.length - 2],
          swapSell: numCells[numCells.length - 1],
          unit: 10000,
        };
      }
    }
  });

  // Strategy 2: div/dl-based layout
  if (Object.values(result).filter(v => v !== null).length === 0) {
    $('[class*="swap"], [class*="pair"], dl, .item').each((_, el) => {
      const text = $(el).text();
      const key = identifyPair(text);
      if (!key || result[key] || UNSUPPORTED.includes(key)) return;
      const nums = text.match(/-?\d+\.?\d*/g);
      if (nums && nums.length >= 2) {
        result[key] = {
          swapBuy: parseFloat(nums[nums.length - 2]),
          swapSell: parseFloat(nums[nums.length - 1]),
          unit: 10000,
        };
      }
    });
  }

  const found = Object.values(result).filter(v => v !== null).length;
  if (found === 0) console.warn('[Central] No pairs parsed - page structure may have changed');
  return result;
}
