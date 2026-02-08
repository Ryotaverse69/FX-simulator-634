import puppeteer from 'puppeteer';

const URL = 'https://fx.dmm.com/fx/service/swap/';

const PAIR_MAP = {
  'USD/JPY': 'USD_JPY',
  'EUR/JPY': 'EUR_JPY',
  'TRY/JPY': 'TRY_JPY',
  'MXN/JPY': 'MXN_JPY',
  'ZAR/JPY': 'ZAR_JPY',
  'CHF/JPY': 'CHF_JPY',
};

const UNAVAILABLE = ['HUF_JPY', 'CZK_JPY'];

/**
 * DMM FX swap scraper.
 *
 * DMM FX renders swap tables client-side using Handlebars templates,
 * so we must use Puppeteer to wait for the JS to execute and the DOM
 * to be populated before extracting data.
 *
 * Tables have class `c-table c-table--swapCalendar` with IDs margin1..margin9.
 * Each table header contains a currency pair name (e.g. "USD/JPY").
 * Rows are structured with: 付与日数 (accrual days), 買 (buy swap), 売 (sell swap).
 * Negative values are marked with class `is-minus`.
 *
 * @returns {Promise<Record<string, {swapBuy: number, swapSell: number, unit: number} | null>>}
 */
export async function scrapeDMM() {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (compatible; FXSwapBot/1.0)');

    await page.goto(URL, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });

    // Wait for at least one swap table to appear in the DOM.
    // The page uses Handlebars to render tables after the initial load.
    try {
      await page.waitForSelector(
        '.c-table--swapCalendar, .swap-table, table',
        { timeout: 15000 },
      );
    } catch {
      console.warn('[DMM] Timed out waiting for swap tables to render');
    }

    // Extra wait to give Handlebars templates time to fully render
    await new Promise(r => setTimeout(r, 3000));

    const data = await page.evaluate((pairMap) => {
      const result = {};
      const tables = document.querySelectorAll('table');

      tables.forEach(table => {
        // Attempt to identify the currency pair from the table header area
        const headerText =
          table.querySelector('thead, th, .c-table__mainHead')?.textContent || '';

        for (const [displayName, pairId] of Object.entries(pairMap)) {
          if (
            headerText.includes(displayName) ||
            headerText.includes(displayName.replace('/', ''))
          ) {
            // Walk the rows looking for buy/sell swap values
            const rows = table.querySelectorAll('tbody tr, tr');
            let buySwap = null;
            let sellSwap = null;

            rows.forEach(row => {
              const subHead = row.querySelector('.c-table__subHead, th');
              if (!subHead) return;

              const label = subHead.textContent.trim();
              const valueCell = row.querySelector(
                '.c-table__data, td:last-child',
              );
              if (!valueCell) return;

              const value = parseFloat(
                valueCell.textContent.replace(/,/g, ''),
              );
              if (isNaN(value)) return;

              if (label.includes('買')) buySwap = value;
              if (label.includes('売')) sellSwap = value;
            });

            if (buySwap !== null) {
              result[pairId] = {
                swapBuy: buySwap,
                swapSell: sellSwap ?? 0,
                unit: 10000,
              };
            }
          }
        }
      });

      return result;
    }, PAIR_MAP);

    // Warn if we got fewer pairs than expected
    const foundCount = Object.keys(data).length;
    const expectedCount = Object.keys(PAIR_MAP).length;
    if (foundCount === 0) {
      console.warn(
        '[DMM] Could not extract any swap data — page structure may have changed',
      );
    } else if (foundCount < expectedCount) {
      const missing = Object.values(PAIR_MAP).filter(p => !(p in data));
      console.warn(
        `[DMM] Partial data: found ${foundCount}/${expectedCount} pairs. Missing: ${missing.join(', ')}`,
      );
    }

    // Mark unavailable pairs as null
    const result = { ...data };
    for (const pair of UNAVAILABLE) {
      result[pair] = null;
    }

    return result;
  } catch (err) {
    console.warn(`[DMM] Scraping failed: ${err.message}`);
    // Return whatever we can (unavailable pairs as null, nothing else)
    const fallback = {};
    for (const pair of UNAVAILABLE) {
      fallback[pair] = null;
    }
    return fallback;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
