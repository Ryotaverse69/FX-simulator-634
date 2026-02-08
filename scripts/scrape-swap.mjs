import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

import { scrapeGMO } from './scrapers/gmo.mjs';
import { scrapeMinnano } from './scrapers/minnano.mjs';
import { scrapeLightFX } from './scrapers/lightfx.mjs';
import { scrapeGaikaex } from './scrapers/gaikaex.mjs';
import { scrapeDMM } from './scrapers/dmm.mjs';
import { scrapeSBI } from './scrapers/sbi.mjs';
import { scrapeCentral } from './scrapers/central.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = resolve(__dirname, '../data/swap-data.json');

// 既存データをフォールバック用に読み込み
let existing = {};
try {
  existing = JSON.parse(readFileSync(OUT_PATH, 'utf8'));
} catch { /* 初回実行時 */ }

const scrapers = {
  gmo: scrapeGMO,
  minnano: scrapeMinnano,
  lightfx: scrapeLightFX,
  gaikaex: scrapeGaikaex,
  dmm: scrapeDMM,
  sbi: scrapeSBI,
  central: scrapeCentral,
};

const results = {};
const errors = [];

for (const [broker, scraper] of Object.entries(scrapers)) {
  try {
    console.log(`Scraping ${broker}...`);
    results[broker] = await scraper();
    const pairCount = Object.values(results[broker]).filter(v => v !== null).length;
    console.log(`  OK: ${pairCount} pairs`);
    // ブローカー間の負荷分散（2秒待機）
    await new Promise(r => setTimeout(r, 2000));
  } catch (e) {
    console.error(`  FAIL: ${broker}: ${e.message}`);
    errors.push({ broker, error: e.message });
    // 既存データにフォールバック
    if (existing.brokers?.[broker]) {
      results[broker] = existing.brokers[broker];
      console.log(`  Using previous data for ${broker}`);
    }
  }
}

const output = {
  meta: {
    lastUpdated: new Date().toISOString(),
    source: 'auto',
    version: 1,
    ...(errors.length > 0 ? { errors } : {}),
  },
  brokers: results,
};

writeFileSync(OUT_PATH, JSON.stringify(output, null, 2), 'utf8');
console.log(`\nWrote ${OUT_PATH}`);
if (errors.length > 0) {
  console.warn(`${errors.length} broker(s) failed, used fallback data.`);
}
