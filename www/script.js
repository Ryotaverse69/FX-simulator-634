// FX Investment Simulator
// - Fetches live JPY crosses via exchangerate.host
// - Simulates monthly equity using leverage, deposits, swap, and expected price change

(function () {
  const els = {
    pair: document.getElementById('pair'),
    direction: document.getElementById('direction'),
    months: document.getElementById('months'),
    capital: document.getElementById('capital'),
    deposit: document.getElementById('deposit'),
    leverage: document.getElementById('leverage'),
    currentPrice: document.getElementById('currentPrice'),
    swapPer10kPerDay: document.getElementById('swapPer10kPerDay'),
    monthlyPriceChange: document.getElementById('monthlyPriceChange'),
    run: document.getElementById('run'),
    reset: document.getElementById('reset'),
    tableBody: document.querySelector('#result-table tbody'),
    priceText: document.getElementById('price'),
    priceUpdated: document.getElementById('price-updated'),
    fetchPriceBtn: document.getElementById('fetchPriceBtn'),
    autoFetch: document.getElementById('autoFetch'),
    autoInterval: document.getElementById('autoInterval'),
    autoSim: document.getElementById('autoSim'),
    autoStatus: document.getElementById('autoStatus'),
    broker: document.getElementById('broker'),
    swapSource: document.getElementById('swapSource'),
    themeToggle: document.getElementById('themeToggle'),
    // Tabs - leverage simulator
    levBroker: document.getElementById('lev_broker'),
    levMinUnit: document.getElementById('lev_min_unit'),
    pair2: document.getElementById('pair2'),
    fetchPriceBtn2: document.getElementById('fetchPriceBtn2'),
    levPrice: document.getElementById('lev_price'),
    levEquity: document.getElementById('lev_equity'),
    levUnits: document.getElementById('lev_units'),
    targetLev: document.getElementById('targetLev'),
    levRun: document.getElementById('lev_run'),
    levBackcalc: document.getElementById('lev_backcalc'),
    levClear: document.getElementById('lev_clear'),
    levEffective: document.getElementById('lev_effective'),
    levReqUnits: document.getElementById('lev_required_units'),
    levReqUnitsCeil: document.getElementById('lev_required_units_ceil'),
    levReqUnitsFloor: document.getElementById('lev_required_units_floor'),
    // KPIs
    kpiPrice: document.getElementById('kpi-price'),
    kpiSwap: document.getElementById('kpi-swap'),
    kpiLev: document.getElementById('kpi-lev'),
    // Compare tab
    cmpBroker: document.getElementById('cmp_broker'),
    cmpMonths: document.getElementById('cmp_months'),
    cmpLeverage: document.getElementById('cmp_leverage'),
    cmpCapital: document.getElementById('cmp_capital'),
    cmpDeposit: document.getElementById('cmp_deposit'),
    cmpMonthlyPriceChange: document.getElementById('cmp_monthlyPriceChange'),
    cmpPair1: document.getElementById('cmp_pair1'),
    cmpPair2: document.getElementById('cmp_pair2'),
    cmpPair3: document.getElementById('cmp_pair3'),
    cmpDir1: document.getElementById('cmp_dir1'),
    cmpDir2: document.getElementById('cmp_dir2'),
    cmpDir3: document.getElementById('cmp_dir3'),
    cmpSwap1: document.getElementById('cmp_swap1'),
    cmpSwap2: document.getElementById('cmp_swap2'),
    cmpSwap3: document.getElementById('cmp_swap3'),
    cmpSwapSrc1: document.getElementById('cmp_swapSrc1'),
    cmpSwapSrc2: document.getElementById('cmp_swapSrc2'),
    cmpSwapSrc3: document.getElementById('cmp_swapSrc3'),
    cmpPrice1: document.getElementById('cmp_price1'),
    cmpPrice2: document.getElementById('cmp_price2'),
    cmpPrice3: document.getElementById('cmp_price3'),
    cmpRun: document.getElementById('cmp_run'),
    cmpReset: document.getElementById('cmp_reset'),
    cmpSummaryBody: document.querySelector('#cmp-summary tbody'),
    // Multi positions tab
    multiForm: document.getElementById('multi-form'),
    multiMonths: document.getElementById('multi_months'),
    multiCapital: document.getElementById('multi_capital'),
    multiDeposit: document.getElementById('multi_deposit'),
    multiBroker: document.getElementById('multi_broker'),
    multiAdd: document.getElementById('multi_add'),
    multiFetch: document.getElementById('multi_fetch'),
    multiRun: document.getElementById('multi_run'),
    multiReset: document.getElementById('multi_reset'),
    multiPositionsBody: document.getElementById('multi_positions_body'),
    multiResultBody: document.querySelector('#multi-result-table tbody'),
    multiNotional: document.getElementById('multi_notional'),
    multiInitialLev: document.getElementById('multi_initial_lev'),
    multiFinalLev: document.getElementById('multi_final_lev'),
    multiFinalEquity: document.getElementById('multi_final_equity')
  };

  const PAIRS = {
    USDJPY: { base: 'USD', quote: 'JPY' },
    GBPJPY: { base: 'GBP', quote: 'JPY' },
    EURJPY: { base: 'EUR', quote: 'JPY' },
    MXNJPY: { base: 'MXN', quote: 'JPY' },
    ZARJPY: { base: 'ZAR', quote: 'JPY' },
    TRYJPY: { base: 'TRY', quote: 'JPY' }
  };

  const PAIR_LABELS = {
    USDJPY: 'ドル円 (USD/JPY)',
    GBPJPY: 'ポンド円 (GBP/JPY)',
    EURJPY: 'ユーロ円 (EUR/JPY)',
    MXNJPY: 'メキシコペソ円 (MXN/JPY)',
    ZARJPY: '南アフリカランド円 (ZAR/JPY)',
    TRYJPY: 'トルコリラ円 (TRY/JPY)'
  };
  const LOT_SIZE = 10_000;
  const DEFAULT_MULTI_ROWS = [
    { pair: 'MXNJPY', direction: 'long', lots: 1, monthlyChange: 0, swap: 0 },
    { pair: 'TRYJPY', direction: 'long', lots: 2, monthlyChange: 0, swap: 0 }
  ];

  let chart = null;
  let cmpChart = null;
  let multiChart = null;
  let BROKERS = null; // loaded from brokers.json
  let multiRowSeq = 0;
  const THEME_KEY = 'theme';
  const glowPlugin = {
    id: 'glow',
    afterDatasetsDraw(chart, args, opts) {
      const meta = chart.getDatasetMeta(0);
      if (!meta || meta.hidden) return;
      const ctx = chart.ctx;
      ctx.save();
      ctx.shadowColor = (opts && opts.color) || 'rgba(124,77,255,.45)';
      ctx.shadowBlur = (opts && opts.blur) || 12;
      ctx.globalCompositeOperation = 'lighter';
      meta.dataset.draw(ctx);
      ctx.restore();
    }
  };

  function fmtJPY(v) {
    return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY', maximumFractionDigits: 0 }).format(v);
  }
  function fmtNum(v, digits = 4) {
    return new Intl.NumberFormat('ja-JP', { maximumFractionDigits: digits }).format(v);
  }
  function fmtX(v, digits = 2) {
    if (!Number.isFinite(v)) return '--';
    return `${fmtNum(v, digits)}x`;
  }
  function roundToMultiple(x, m, mode = 'nearest') {
    if (!m || m <= 0) return Math.round(x);
    if (mode === 'up') return Math.ceil(x / m) * m;
    if (mode === 'down') return Math.floor(x / m) * m;
    const up = Math.ceil(x / m) * m;
    const down = Math.floor(x / m) * m;
    return (x - down) <= (up - x) ? down : up;
  }
  function getMinUnitForBroker(brokerKey) {
    if (!brokerKey || !BROKERS || !BROKERS[brokerKey]) return 10000;
    const v = BROKERS[brokerKey].minUnit;
    return Number.isFinite(v) && v > 0 ? v : 10000;
  }
  function setLevMinUnitLabel() {
    if (!els.levMinUnit) return;
    const key = els.levBroker?.value || '';
    const mu = getMinUnitForBroker(key);
    const label = key && BROKERS?.[key]?.label ? `${BROKERS[key].label} 最小単位: ${fmtNum(mu, 0)} 通貨` : `既定最小単位: ${fmtNum(mu, 0)} 通貨`;
    els.levMinUnit.textContent = `（${label}）`;
  }

  // Theme control
  function getPreferredTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
    // default to light if no saved preference
    return 'light';
  }
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    if (els.themeToggle) {
      const next = theme === 'dark' ? 'light' : 'dark';
      els.themeToggle.textContent = next === 'dark' ? 'ダークにする' : 'ライトにする';
      els.themeToggle.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
      els.themeToggle.ariaLabel = 'テーマ切替: ' + (next === 'dark' ? 'ダークにする' : 'ライトにする');
    }
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#0f172a' : '#ffffff');
  }
  function toggleTheme() {
    const next = (document.documentElement.getAttribute('data-theme') === 'dark') ? 'light' : 'dark';
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
  }

  // Load brokers reference (static JSON in repo)
  async function loadBrokers() {
    if (BROKERS) return BROKERS;
    try {
      const res = await fetch('./brokers.json', { cache: 'no-store' });
      if (!res.ok) throw new Error(`brokers.json HTTP ${res.status}`);
      BROKERS = await res.json();
      return BROKERS;
    } catch (e) {
      console.warn('Failed to load brokers.json. Swap auto-fill disabled.', e);
      BROKERS = {};
      return BROKERS;
    }
  }

  function populateBrokerOptions() {
    if (!BROKERS) return;
    const fills = [els.broker, els.levBroker, els.cmpBroker, els.multiBroker].filter(Boolean);
    for (const select of fills) {
      while (select.options.length > 1) select.remove(1);
      for (const key of Object.keys(BROKERS)) {
        const opt = document.createElement('option');
        opt.value = key;
        opt.textContent = BROKERS[key]?.label || key;
        select.appendChild(opt);
      }
    }
    setLevMinUnitLabel();
  }

  function lookupSwap(brokerKey, pairKey, directionKey) {
    if (!brokerKey || !BROKERS || !BROKERS[brokerKey]) return null;
    const entry = BROKERS[brokerKey].pairs?.[pairKey];
    if (!entry) return null;
    const k = directionKey === 'short' ? 'short' : 'long';
    const v = entry[k];
    return Number.isFinite(v) ? v : null;
  }

  function setSwapSource(text) {
    if (els.swapSource) els.swapSource.textContent = text || '';
  }

  function setCmpSwapSource(idx, text) {
    const m = {1: els.cmpSwapSrc1, 2: els.cmpSwapSrc2, 3: els.cmpSwapSrc3};
    if (m[idx]) m[idx].textContent = text || '';
  }

  async function updateSwapFromBroker() {
    try {
      await loadBrokers();
      const brokerKey = els.broker?.value || '';
      if (!brokerKey) { setSwapSource('参照: 手動入力'); return; }
      const pairKey = els.pair?.value || 'USDJPY';
      const directionKey = els.direction?.value || 'long';
      const val = lookupSwap(brokerKey, pairKey, directionKey);
      if (val == null) {
        setSwapSource(`参照: ${BROKERS[brokerKey]?.label || brokerKey} - 該当データなし`);
        return;
      }
      els.swapPer10kPerDay.value = String(val);
      if (els.kpiSwap) els.kpiSwap.textContent = `${fmtNum(val, 0)} 円`;
      setSwapSource(`参照: ${BROKERS[brokerKey]?.label || brokerKey}（${directionKey === 'short' ? '売り' : '買い'}）`);
    } catch (e) {
      console.warn('Swap auto-fill error', e);
      setSwapSource('参照: 手動入力（エラー）');
    }
  }

  async function updateCmpSwapFromBroker() {
    try {
      await loadBrokers();
      const brokerKey = els.cmpBroker?.value || '';
      if (!brokerKey) {
        setCmpSwapSource(1, '参照: 手動入力');
        setCmpSwapSource(2, '参照: 手動入力');
        setCmpSwapSource(3, '参照: 手動入力');
        return;
      }
      const entries = [
        { idx: 1, pair: els.cmpPair1?.value || 'USDJPY', dir: els.cmpDir1?.value || 'long', el: els.cmpSwap1 },
        { idx: 2, pair: els.cmpPair2?.value || 'GBPJPY', dir: els.cmpDir2?.value || 'long', el: els.cmpSwap2 },
        { idx: 3, pair: els.cmpPair3?.value || 'EURJPY', dir: els.cmpDir3?.value || 'long', el: els.cmpSwap3 }
      ];
      for (const e of entries) {
        const val = lookupSwap(brokerKey, e.pair, e.dir);
        if (val == null) {
          setCmpSwapSource(e.idx, `参照: ${BROKERS[brokerKey]?.label || brokerKey} - 該当データなし`);
        } else {
          if (e.el) e.el.value = String(val);
          setCmpSwapSource(e.idx, `参照: ${BROKERS[brokerKey]?.label || brokerKey}（${e.dir === 'short' ? '売り' : '買い'}）`);
        }
      }
    } catch (e) {
      console.warn('Compare swap auto-fill error', e);
      setCmpSwapSource(1, '参照: 手動入力（エラー）');
      setCmpSwapSource(2, '参照: 手動入力（エラー）');
      setCmpSwapSource(3, '参照: 手動入力（エラー）');
    }
  }

  async function applySwapFromBrokerToRow(row) {
    if (!row) return;
    const brokerKey = els.multiBroker?.value || '';
    if (!brokerKey) return;
    try {
      await loadBrokers();
      const pairSel = row.querySelector('.multi-pair');
      const dirSel = row.querySelector('.multi-dir');
      const swapInput = row.querySelector('.multi-swap');
      if (!pairSel || !dirSel || !swapInput) return;
      const val = lookupSwap(brokerKey, pairSel.value, dirSel.value);
      if (val != null) swapInput.value = String(val);
    } catch (e) {
      console.warn('Multi swap auto-fill error', e);
    }
  }

  async function updateMultiSwapFromBroker() {
    const brokerKey = els.multiBroker?.value || '';
    if (!brokerKey) return;
    const rows = els.multiPositionsBody?.querySelectorAll('tr');
    if (!rows || !rows.length) return;
    await Promise.all(Array.from(rows, (row) => applySwapFromBrokerToRow(row)));
  }

  // Fetch helpers with timeout and provider fallback
  async function fetchJSON(url, timeoutMs = 8000) {
    const ctrl = new AbortController();
    const id = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetch(url, { cache: 'no-store', signal: ctrl.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } finally {
      clearTimeout(id);
    }
  }

  async function fetchPrice(pairKey) {
    const p = PAIRS[pairKey];
    if (!p) return null;
    const base = p.base;
    const quote = p.quote;

    // Provider 1: exchangerate.host
    try {
      const url = `https://api.exchangerate.host/latest?base=${encodeURIComponent(base)}&symbols=${encodeURIComponent(quote)}`;
      const data = await fetchJSON(url, 8000);
      const rate = data?.rates?.[quote];
      if (typeof rate === 'number' && isFinite(rate)) return rate;
      throw new Error('exchangerate.host: invalid');
    } catch (_) {}

    // Provider 2: frankfurter.app
    try {
      const url = `https://api.frankfurter.app/latest?from=${encodeURIComponent(base)}&to=${encodeURIComponent(quote)}`;
      const data = await fetchJSON(url, 8000);
      const rate = data?.rates?.[quote];
      if (typeof rate === 'number' && isFinite(rate)) return rate;
      throw new Error('frankfurter: invalid');
    } catch (_) {}

    // Provider 3: open.er-api.com
    try {
      const url = `https://open.er-api.com/v6/latest/${encodeURIComponent(base)}`;
      const data = await fetchJSON(url, 8000);
      const rate = data?.rates?.[quote];
      if (typeof rate === 'number' && isFinite(rate)) return rate;
      throw new Error('er-api: invalid');
    } catch (e) {
      console.error('Price fetch failed on all providers', e);
    }

    throw new Error('価格データの取得に失敗しました');
  }

  async function fetchAndFillPrice() {
    try {
      els.priceText?.classList.add('skeleton');
      const pairKey = els.pair.value;
      const price = await fetchPrice(pairKey);
      els.currentPrice.value = String(price.toFixed(5));
      els.priceText.textContent = fmtNum(price, 5);
      if (els.kpiPrice) els.kpiPrice.textContent = fmtNum(price, 5);
      const now = new Date();
      const brokerKey = els.broker?.value || '';
      const src = brokerKey && BROKERS && BROKERS[brokerKey]?.label ? BROKERS[brokerKey].label : '為替API';
      els.priceUpdated.textContent = `（更新: ${now.toLocaleTimeString('ja-JP')}｜ソース: ${src}）`;
      // Also auto-fill swap if broker is selected
      updateSwapFromBroker();
      if (els.autoSim?.checked) {
        // run simulation after price is updated
        simulate();
      }
      setAutoStatus();
    } catch (e) {
      els.priceText.textContent = '--';
      els.priceUpdated.textContent = '（価格取得エラー）';
      console.error(e);
      setAutoStatus(true);
    } finally { els.priceText?.classList.remove('skeleton'); }
  }

  async function fetchAndFillPrice2() {
    try {
      const pairKey = els.pair2.value;
      const price = await fetchPrice(pairKey);
      els.levPrice.value = String(price.toFixed(5));
    } catch (e) {
      console.error(e);
    }
  }

  async function fetchComparePrices(pairs) {
    // pairs: [{pair, idx}]
    const previews = {1: els.cmpPrice1, 2: els.cmpPrice2, 3: els.cmpPrice3};
    for (const p of pairs) { previews[p.idx]?.classList.add('skeleton'); previews[p.idx].textContent = '--'; }
    try {
      const results = await Promise.all(pairs.map(async (p) => {
        const price = await fetchPrice(p.pair);
        return { idx: p.idx, pair: p.pair, price };
      }));
      for (const r of results) {
        if (previews[r.idx]) previews[r.idx].textContent = `${r.pair}: ${fmtNum(r.price, 5)}`;
      }
      return results;
    } finally {
      for (const p of pairs) { previews[p.idx]?.classList.remove('skeleton'); }
    }
  }

  // Auto-fetch control
  let autoTimer = null;
  function startAuto() {
    stopAuto();
    const sec = Math.max(5, Math.floor(valNum(els.autoInterval, 30)));
    els.autoInterval.value = String(sec);
    // fetch once immediately, then schedule
    fetchAndFillPrice();
    autoTimer = setInterval(fetchAndFillPrice, sec * 1000);
    setAutoStatus();
  }
  function stopAuto() {
    if (autoTimer) clearInterval(autoTimer);
    autoTimer = null;
    setAutoStatus();
  }

  function setAutoStatus(error = false) {
    if (!els.autoStatus) return;
    if (els.autoFetch?.checked) {
      els.autoStatus.textContent = error ? '状態: 稼働中（直近の取得でエラー）' : '状態: 稼働中';
      els.autoStatus.classList.toggle('neg', !!error);
    } else {
      els.autoStatus.textContent = '状態: 停止中';
      els.autoStatus.classList.remove('neg');
    }
  }

  function simulate() {
    const months = clampInt(valNum(els.months, 24), 1, 360);
    const direction = els.direction.value === 'short' ? -1 : 1;
    const capital0 = Math.max(0, valNum(els.capital, 1_000_000));
    const deposit = Math.max(0, valNum(els.deposit, 0));
    const leverage = Math.max(1, valNum(els.leverage, 10));
    const swapPer10kPerDay = valNum(els.swapPer10kPerDay, 0); // JPY per 10k units per day
    const priceChange = valNum(els.monthlyPriceChange, 0) / 100; // monthly expected change

    // start price
    let price0 = valNum(els.currentPrice, 0);
    if (!price0 || !isFinite(price0) || price0 <= 0) {
      alert('現在価格を入力してください（例: USDJPY=150.1234）');
      return;
    }

    // Sim loop
    const daysPerMonth = 30; // simplified constant
    let equity = capital0;
    let price = price0;

    const rows = [];
    const labels = [];
    const equitySeries = [];

    for (let m = 1; m <= months; m++) {
      // target exposure to keep leverage constant each month (rebalance)
      const units = (equity * leverage) / price; // base currency amount

      // evolve price by expected monthly change
      const nextPrice = price * (1 + priceChange);
      const pricePnl = direction * units * (nextPrice - price);
      const swapPnl = (units / 10_000) * swapPer10kPerDay * daysPerMonth; // sign is included in input
      const nextEquity = equity + deposit + pricePnl + swapPnl;

      rows.push({
        month: m,
        price: nextPrice,
        units,
        pricePnl,
        swapPnl,
        deposit,
        equity: nextEquity
      });
      labels.push(`${m}ヶ月`);
      equitySeries.push(nextEquity);

      // advance
      equity = nextEquity;
      price = nextPrice;
    }

    renderTable(rows);
    renderChart(labels, equitySeries);
  }

  function valNum(el, def = 0) {
    const v = Number(el.value);
    return Number.isFinite(v) ? v : def;
  }
  function clampInt(v, min, max) {
    v = Math.round(v);
    return Math.max(min, Math.min(max, v));
  }

  function renderTable(rows) {
    const tbody = els.tableBody;
    tbody.innerHTML = '';
    for (const r of rows) {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${r.month}</td>
        <td>${fmtNum(r.price, 5)}</td>
        <td>${fmtNum(r.units, 2)}</td>
        <td class="${r.pricePnl >= 0 ? 'pos' : 'neg'}">${fmtJPY(r.pricePnl)}</td>
        <td class="${r.swapPnl >= 0 ? 'pos' : 'neg'}">${fmtJPY(r.swapPnl)}</td>
        <td>${fmtJPY(r.deposit)}</td>
        <td><strong>${fmtJPY(r.equity)}</strong></td>
      `;
      tbody.appendChild(tr);
    }
  }

  function renderChart(labels, series) {
    const canvas = document.getElementById('equity-chart');
    const ctx2d = canvas.getContext('2d');
    const gradient = ctx2d.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, 'rgba(83,215,255,.35)');
    gradient.addColorStop(1, 'rgba(83,215,255,0)');
    if (!chart) {
      Chart.register(glowPlugin);
      chart = new Chart(canvas, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: '資産推移',
            data: series,
            borderColor: '#53d7ff',
            borderWidth: 2,
            backgroundColor: gradient,
            fill: true,
            tension: 0.2,
            pointRadius: 2
          }]
        },
        options: {
          responsive: true,
          interaction: { mode: 'index', intersect: false },
          scales: {
            x: {
              grid: { color: 'rgba(255,255,255,.06)' },
              ticks: { color: '#9aa0a6' }
            },
            y: {
              grid: { color: 'rgba(255,255,255,.06)' },
              ticks: {
                color: '#9aa0a6',
                callback: (v) => new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY', maximumFractionDigits: 0 }).format(v)
              }
            }
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: 'rgba(18,22,33,.9)',
              borderColor: '#2a3750',
              borderWidth: 1,
              titleColor: '#e6e6e6',
              bodyColor: '#e6e6e6'
            },
            glow: { color: 'rgba(124,77,255,.45)', blur: 12 }
          }
        }
      });
    } else {
      chart.data.labels = labels;
      chart.data.datasets[0].data = series;
      chart.data.datasets[0].backgroundColor = gradient;
      chart.update();
    }
  }

  function renderCompareChart(labels, datasets) {
    const canvas = document.getElementById('cmp-chart');
    const ctx2d = canvas.getContext('2d');
    const palette = [
      { border: '#53d7ff', bg: 'rgba(83,215,255,0.30)' },
      { border: '#7c4dff', bg: 'rgba(124,77,255,0.28)' },
      { border: '#ff4d87', bg: 'rgba(255,77,135,0.22)' }
    ];
    const ds = datasets.map((d, i) => {
      const grad = ctx2d.createLinearGradient(0, 0, 0, canvas.height);
      grad.addColorStop(0, palette[i % palette.length].bg);
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      return {
        label: d.label,
        data: d.series,
        borderColor: palette[i % palette.length].border,
        borderWidth: 2,
        backgroundColor: grad,
        fill: true,
        tension: 0.2,
        pointRadius: 2
      };
    });
    if (!cmpChart) {
      cmpChart = new Chart(canvas, {
        type: 'line',
        data: { labels, datasets: ds },
        options: {
          responsive: true,
          interaction: { mode: 'index', intersect: false },
          scales: {
            x: { grid: { color: 'rgba(255,255,255,.06)' }, ticks: { color: '#9aa0a6' } },
            y: {
              grid: { color: 'rgba(255,255,255,.06)' },
              ticks: { color: '#9aa0a6', callback: (v) => new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY', maximumFractionDigits: 0 }).format(v) }
            }
          },
          plugins: {
            legend: { display: true, labels: { color: '#9aa0a6' } },
            tooltip: { backgroundColor: 'rgba(18,22,33,.9)', borderColor: '#2a3750', borderWidth: 1, titleColor: '#e6e6e6', bodyColor: '#e6e6e6' }
          }
        }
      });
    } else {
      cmpChart.data.labels = labels;
      cmpChart.data.datasets = ds;
      cmpChart.update();
    }
  }

  function simulateSeriesSimple({ months, direction, capital0, deposit, leverage, swapPer10kPerDay, price0, priceChange }) {
    const daysPerMonth = 30;
    let equity = capital0;
    let price = price0;
    const series = [];
    for (let m = 1; m <= months; m++) {
      const units = (equity * leverage) / price;
      const nextPrice = price * (1 + priceChange);
      const pricePnl = direction * units * (nextPrice - price);
      const swapPnl = (units / 10_000) * swapPer10kPerDay * daysPerMonth;
      const nextEquity = equity + deposit + pricePnl + swapPnl;
      series.push(nextEquity);
      equity = nextEquity;
      price = nextPrice;
    }
    return series;
  }

  function collectMultiPositions() {
    if (!els.multiPositionsBody) return [];
    const rows = Array.from(els.multiPositionsBody.querySelectorAll('tr'));
    return rows.map((row, idx) => {
      const pairSel = row.querySelector('.multi-pair');
      const dirSel = row.querySelector('.multi-dir');
      const lotsInput = row.querySelector('.multi-lots');
      const priceInput = row.querySelector('.multi-price');
      const changeInput = row.querySelector('.multi-change');
      const swapInput = row.querySelector('.multi-swap');

      const pair = (pairSel?.value && PAIR_LABELS[pairSel.value]) ? pairSel.value : 'USDJPY';
      const direction = dirSel?.value === 'short' ? 'short' : 'long';
      const lots = Number(lotsInput?.value);
      const price = Number(priceInput?.value);
      const changePct = Number(changeInput?.value);
      const swapPer10k = Number(swapInput?.value);

      const lotsVal = Number.isFinite(lots) ? Math.max(0, lots) : 0;
      const priceVal = Number.isFinite(price) ? price : 0;
      const changeVal = Number.isFinite(changePct) ? changePct : 0;
      const swapVal = Number.isFinite(swapPer10k) ? swapPer10k : 0;
      const units = lotsVal * LOT_SIZE;

      return {
        idx: idx + 1,
        pair,
        label: PAIR_LABELS[pair] || pair,
        direction,
        lots: lotsVal,
        units,
        price: priceVal,
        monthlyChange: changeVal / 100,
        swapPer10k: swapVal
      };
    });
  }

  function simulateMultiPortfolio() {
    const months = clampInt(valNum(els.multiMonths, 24), 1, 360);
    const capital0 = Math.max(0, valNum(els.multiCapital, 1_000_000));
    const deposit = Math.max(0, valNum(els.multiDeposit, 0));

    const allPositions = collectMultiPositions();
    const activePositions = allPositions.filter(p => p.units > 0);
    if (!activePositions.length) {
      alert('ロット数が0のポジションは除外されます。少なくとも1件のポジションを設定してください。');
      return;
    }
    const missingPrice = activePositions.find(p => !(p.price > 0));
    if (missingPrice) {
      alert(`${missingPrice.label} の現在価格を入力してください。`);
      return;
    }

    const states = activePositions.map(p => ({
      pair: p.pair,
      label: p.label,
      direction: p.direction,
      sign: p.direction === 'short' ? -1 : 1,
      units: p.units,
      price: p.price,
      startPrice: p.price,
      monthlyChange: p.monthlyChange,
      swapPer10k: p.swapPer10k
    }));

    const daysPerMonth = 30;
    let equity = capital0;
    const rows = [];
    const labels = [];
    const equitySeries = [];

    for (let m = 1; m <= months; m++) {
      let pricePnl = 0;
      let swapPnl = 0;
      for (const s of states) {
        const nextPrice = s.price * (1 + s.monthlyChange);
        pricePnl += s.sign * s.units * (nextPrice - s.price);
        swapPnl += (s.units / LOT_SIZE) * s.swapPer10k * daysPerMonth;
        s.price = nextPrice;
      }
      const nextEquity = equity + deposit + pricePnl + swapPnl;
      const notional = states.reduce((sum, s) => sum + Math.abs(s.units * s.price), 0);
      const leverage = nextEquity > 0 ? notional / nextEquity : NaN;

      rows.push({ month: m, equity: nextEquity, notional, leverage, pricePnl, swapPnl, deposit });
      labels.push(`${m}ヶ月`);
      equitySeries.push(nextEquity);

      equity = nextEquity;
    }

    renderMultiPortfolioTable(rows);
    renderMultiPortfolioChart(labels, equitySeries);

    const initialNotional = states.reduce((sum, s) => sum + Math.abs(s.units * s.startPrice), 0);
    const finalNotional = states.reduce((sum, s) => sum + Math.abs(s.units * s.price), 0);
    const finalEquity = rows.length ? rows[rows.length - 1].equity : capital0;
    const finalLev = rows.length ? rows[rows.length - 1].leverage : (finalEquity > 0 ? finalNotional / finalEquity : NaN);
    const initialLev = capital0 > 0 ? initialNotional / capital0 : NaN;

    updateMultiSummary({
      initialNotional,
      initialLev,
      finalNotional,
      finalLev,
      finalEquity
    });
  }

  function renderMultiPortfolioTable(rows) {
    const tbody = els.multiResultBody;
    if (!tbody) return;
    tbody.innerHTML = '';
    for (const r of rows) {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${r.month}</td>
        <td><strong>${fmtJPY(r.equity)}</strong></td>
        <td>${fmtJPY(r.notional)}</td>
        <td>${fmtX(r.leverage, 2)}</td>
        <td class="${r.pricePnl >= 0 ? 'pos' : 'neg'}">${fmtJPY(r.pricePnl)}</td>
        <td class="${r.swapPnl >= 0 ? 'pos' : 'neg'}">${fmtJPY(r.swapPnl)}</td>
        <td>${fmtJPY(r.deposit)}</td>
      `;
      tbody.appendChild(tr);
    }
  }

  function renderMultiPortfolioChart(labels, series) {
    const canvas = document.getElementById('multi-chart');
    if (!canvas) return;
    const ctx2d = canvas.getContext('2d');
    const gradient = ctx2d.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, 'rgba(255,77,135,0.28)');
    gradient.addColorStop(1, 'rgba(255,77,135,0)');
    if (!multiChart) {
      Chart.register(glowPlugin);
      multiChart = new Chart(canvas, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: '複数ポジション資産',
            data: series,
            borderColor: '#ff4d87',
            borderWidth: 2,
            backgroundColor: gradient,
            fill: true,
            tension: 0.2,
            pointRadius: 2
          }]
        },
        options: {
          responsive: true,
          interaction: { mode: 'index', intersect: false },
          scales: {
            x: {
              grid: { color: 'rgba(255,255,255,.06)' },
              ticks: { color: '#9aa0a6' }
            },
            y: {
              grid: { color: 'rgba(255,255,255,.06)' },
              ticks: {
                color: '#9aa0a6',
                callback: (v) => new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY', maximumFractionDigits: 0 }).format(v)
              }
            }
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: 'rgba(18,22,33,.9)',
              borderColor: '#2a3750',
              borderWidth: 1,
              titleColor: '#e6e6e6',
              bodyColor: '#e6e6e6'
            },
            glow: { color: 'rgba(255,77,135,0.35)', blur: 12 }
          }
        }
      });
    } else {
      multiChart.data.labels = labels;
      multiChart.data.datasets[0].data = series;
      multiChart.data.datasets[0].backgroundColor = gradient;
      multiChart.update();
    }
  }

  function updateMultiSummary(summary) {
    if (!els.multiNotional || !els.multiInitialLev || !els.multiFinalLev || !els.multiFinalEquity) return;
    if (!summary) {
      els.multiNotional.textContent = '--';
      els.multiInitialLev.textContent = '--';
      els.multiFinalLev.textContent = '--';
      els.multiFinalEquity.textContent = '--';
      return;
    }
    els.multiNotional.textContent = fmtJPY(summary.initialNotional);
    els.multiInitialLev.textContent = fmtX(summary.initialLev, 2);
    els.multiFinalLev.textContent = fmtX(summary.finalLev, 2);
    els.multiFinalEquity.textContent = fmtJPY(summary.finalEquity);
  }

  function pairOptionsMarkup(selected) {
    const keys = Object.keys(PAIR_LABELS);
    const fallback = keys[0];
    const selectedKey = (selected && PAIR_LABELS[selected]) ? selected : fallback;
    return keys.map(key => `<option value="${key}" ${key === selectedKey ? 'selected' : ''}>${PAIR_LABELS[key]}</option>`).join('');
  }

  function createMultiRow(data = {}) {
    multiRowSeq += 1;
    const tr = document.createElement('tr');
    tr.dataset.rowId = String(multiRowSeq);

    const pair = data.pair && PAIR_LABELS[data.pair] ? data.pair : 'USDJPY';
    const direction = data.direction === 'short' ? 'short' : 'long';
    const lots = Number.isFinite(data.lots) ? Math.max(0, data.lots) : 1;
    const priceVal = (typeof data.price === 'number' && Number.isFinite(data.price)) ? String(data.price) : '';
    const changeVal = Number.isFinite(data.monthlyChange) ? data.monthlyChange : 0;
    const swapVal = Number.isFinite(data.swap) ? data.swap : 0;

    const pairTd = document.createElement('td');
    const pairSelect = document.createElement('select');
    pairSelect.className = 'multi-pair';
    pairSelect.innerHTML = pairOptionsMarkup(pair);
    pairTd.appendChild(pairSelect);

    const dirTd = document.createElement('td');
    const dirSelect = document.createElement('select');
    dirSelect.className = 'multi-dir';
    dirSelect.innerHTML = `<option value="long" ${direction === 'long' ? 'selected' : ''}>買い</option><option value="short" ${direction === 'short' ? 'selected' : ''}>売り</option>`;
    dirTd.appendChild(dirSelect);

    const lotsTd = document.createElement('td');
    const lotsInput = document.createElement('input');
    lotsInput.type = 'number';
    lotsInput.min = '0';
    lotsInput.step = '0.01';
    lotsInput.className = 'multi-lots';
    lotsInput.value = String(lots);
    lotsTd.appendChild(lotsInput);

    const priceTd = document.createElement('td');
    const priceInput = document.createElement('input');
    priceInput.type = 'number';
    priceInput.min = '0';
    priceInput.step = '0.0001';
    priceInput.placeholder = '取得可';
    priceInput.className = 'multi-price';
    priceInput.value = priceVal;
    priceTd.appendChild(priceInput);

    const changeTd = document.createElement('td');
    const changeInput = document.createElement('input');
    changeInput.type = 'number';
    changeInput.step = '0.1';
    changeInput.className = 'multi-change';
    changeInput.value = String(changeVal);
    changeTd.appendChild(changeInput);

    const swapTd = document.createElement('td');
    const swapInput = document.createElement('input');
    swapInput.type = 'number';
    swapInput.step = '0.1';
    swapInput.className = 'multi-swap';
    swapInput.value = String(swapVal);
    swapTd.appendChild(swapInput);

    const actionTd = document.createElement('td');
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'btn-secondary btn-compact multi-remove';
    removeBtn.textContent = '削除';
    actionTd.appendChild(removeBtn);

    tr.appendChild(pairTd);
    tr.appendChild(dirTd);
    tr.appendChild(lotsTd);
    tr.appendChild(priceTd);
    tr.appendChild(changeTd);
    tr.appendChild(swapTd);
    tr.appendChild(actionTd);

    pairSelect.addEventListener('change', () => { applySwapFromBrokerToRow(tr); });
    dirSelect.addEventListener('change', () => { applySwapFromBrokerToRow(tr); });

    return tr;
  }

  function addMultiRow(data = {}) {
    if (!els.multiPositionsBody) return;
    const row = createMultiRow(data);
    els.multiPositionsBody.appendChild(row);
    applySwapFromBrokerToRow(row);
  }

  async function fetchMultiPrices() {
    if (!els.multiPositionsBody) return;
    const rows = Array.from(els.multiPositionsBody.querySelectorAll('tr'));
    if (!rows.length) {
      alert('ポジションを追加してください。');
      return;
    }
    const btn = els.multiFetch;
    let prevLabel = '';
    if (btn) {
      prevLabel = btn.textContent;
      btn.disabled = true;
      btn.textContent = '取得中...';
    }
    let hadError = false;
    try {
      for (const row of rows) {
        const pairSel = row.querySelector('.multi-pair');
        const priceInput = row.querySelector('.multi-price');
        if (!pairSel || !priceInput) continue;
        try {
          const price = await fetchPrice(pairSel.value);
          priceInput.value = String(price.toFixed(5));
        } catch (e) {
          console.warn('Multi price fetch error', e);
          hadError = true;
        }
      }
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = prevLabel || '全ペアの現在価格を取得';
      }
    }
    if (hadError) {
      alert('一部の価格データの取得に失敗しました。通信状況をご確認ください。');
    }
  }

  function resetMultiPortfolio() {
    if (els.multiMonths) els.multiMonths.value = 24;
    if (els.multiCapital) els.multiCapital.value = 1_000_000;
    if (els.multiDeposit) els.multiDeposit.value = 50_000;
    if (els.multiBroker) els.multiBroker.value = '';
    if (els.multiPositionsBody) {
      els.multiPositionsBody.innerHTML = '';
      multiRowSeq = 0;
      DEFAULT_MULTI_ROWS.forEach(cfg => addMultiRow(cfg));
    }
    if (els.multiResultBody) els.multiResultBody.innerHTML = '';
    updateMultiSummary(null);
    if (multiChart) {
      multiChart.destroy();
      multiChart = null;
    }
  }

  async function compareSimulate() {
    const months = clampInt(valNum(els.cmpMonths, 24), 1, 360);
    const capital0 = Math.max(0, valNum(els.cmpCapital, 1_000_000));
    const deposit = Math.max(0, valNum(els.cmpDeposit, 0));
    const leverage = Math.max(1, valNum(els.cmpLeverage, 10));
    const priceChange = valNum(els.cmpMonthlyPriceChange, 0) / 100;

    const groups = [
      { idx: 1, pair: els.cmpPair1?.value || 'USDJPY', dir: els.cmpDir1?.value || 'long', swapEl: els.cmpSwap1 },
      { idx: 2, pair: els.cmpPair2?.value || 'GBPJPY', dir: els.cmpDir2?.value || 'long', swapEl: els.cmpSwap2 },
      { idx: 3, pair: els.cmpPair3?.value || 'EURJPY', dir: els.cmpDir3?.value || 'long', swapEl: els.cmpSwap3 }
    ];

    // Fetch current prices
    let prices;
    try {
      prices = await fetchComparePrices(groups.map(g => ({ idx: g.idx, pair: g.pair })));
    } catch (e) {
      alert('価格データの取得に失敗しました。通信環境をご確認ください。');
      return;
    }
    const priceByIdx = Object.fromEntries(prices.map(r => [r.idx, r.price]));

    // Build labels once
    const labels = Array.from({ length: months }, (_, i) => `${i + 1}ヶ月`);
    const datasets = [];
    const summaryTbody = els.cmpSummaryBody;
    if (summaryTbody) summaryTbody.innerHTML = '';

    for (const g of groups) {
      const direction = g.dir === 'short' ? -1 : 1;
      const swapPer10kPerDay = valNum(g.swapEl, 0);
      const price0 = priceByIdx[g.idx];
      if (!(price0 > 0)) continue;
      const series = simulateSeriesSimple({ months, direction, capital0, deposit, leverage, swapPer10kPerDay, price0, priceChange });
      const label = `${g.pair}（${direction > 0 ? '買い' : '売り'}）`;
      datasets.push({ label, series });
      if (summaryTbody) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${g.pair}</td><td>${direction > 0 ? '買い' : '売り'}</td><td><strong>${fmtJPY(series[series.length - 1])}</strong></td>`;
        summaryTbody.appendChild(tr);
      }
    }

    renderCompareChart(labels, datasets);
  }

  // Leverage simulator
  function computeEffectiveLeverage() {
    const equity = Math.max(0, valNum(els.levEquity, 0));
    const price = Math.max(0, valNum(els.levPrice, 0));
    const units = Math.max(0, valNum(els.levUnits, 0));
    if (!(equity > 0 && price > 0 && units > 0)) {
      els.levEffective.textContent = '--';
      els.levReqUnits.textContent = '--';
      els.levReqUnitsCeil.textContent = '--';
      els.levReqUnitsFloor.textContent = '--';
      return;
    }
    const eff = (units * price) / equity;
    els.levEffective.textContent = fmtX(eff, 2);

    const tgt = Math.max(0, valNum(els.targetLev, 0));
    if (tgt > 0) {
      const reqUnits = (tgt * equity) / price;
      const lots10k = reqUnits / 10000;
      let diff = reqUnits - units;
      const sign = diff >= 0 ? '+' : '';
      els.levReqUnits.textContent = `${fmtNum(reqUnits, 0)} 通貨（約 ${fmtNum(lots10k, 2)} 万通貨、差分 ${sign}${fmtNum(diff, 0)}）`;

      // Broker-aware rounding
      const mu = getMinUnitForBroker(els.levBroker?.value || '');
      const ceilU = roundToMultiple(reqUnits, mu, 'up');
      const floorU = roundToMultiple(reqUnits, mu, 'down');
      const ceilEff = (ceilU * price) / equity;
      const floorEff = floorU > 0 ? (floorU * price) / equity : 0;
      els.levReqUnitsCeil.textContent = `${fmtNum(ceilU, 0)} 通貨（最小単位=${fmtNum(mu,0)}、実行レバ: ${fmtX(ceilEff,2)}）`;
      els.levReqUnitsFloor.textContent = floorU > 0 ? `${fmtNum(floorU, 0)} 通貨（最小単位=${fmtNum(mu,0)}、実行レバ: ${fmtX(floorEff,2)}）` : '--';
    } else {
      els.levReqUnits.textContent = '--';
      els.levReqUnitsCeil.textContent = '--';
      els.levReqUnitsFloor.textContent = '--';
    }
  }

  function backcalcUnitsFromTarget() {
    const equity = Math.max(0, valNum(els.levEquity, 0));
    const price = Math.max(0, valNum(els.levPrice, 0));
    const tgt = Math.max(0, valNum(els.targetLev, 0));
    if (!(equity > 0 && price > 0 && tgt > 0)) {
      alert('資金・価格・目標レバレッジを入力してください');
      return;
    }
    const reqUnits = (tgt * equity) / price;
    const mu = getMinUnitForBroker(els.levBroker?.value || '');
    const ceilU = roundToMultiple(reqUnits, mu, 'up');
    els.levUnits.value = String(Math.max(0, Math.round(ceilU)));
    computeEffectiveLeverage();
  }

  // Event bindings
  els.run.addEventListener('click', simulate);
  els.reset.addEventListener('click', () => {
    els.months.value = 24;
    els.capital.value = 1_000_000;
    els.deposit.value = 50_000;
    els.leverage.value = 10;
    els.swapPer10kPerDay.value = 5;
    els.monthlyPriceChange.value = 0;
    els.currentPrice.value = '';
    els.priceText.textContent = '--';
    els.priceUpdated.textContent = '';
    simulate();
  });
  els.fetchPriceBtn.addEventListener('click', fetchAndFillPrice);
  els.autoFetch.addEventListener('change', () => {
    if (els.autoFetch.checked) startAuto(); else stopAuto();
  });
  els.autoInterval.addEventListener('change', () => {
    if (els.autoFetch.checked) startAuto();
  });
  els.pair.addEventListener('change', () => {
    if (els.autoFetch.checked) fetchAndFillPrice();
    updateSwapFromBroker();
  });
  els.leverage.addEventListener('change', () => {
    if (els.kpiLev) els.kpiLev.textContent = `x${fmtNum(valNum(els.leverage, 10), 0)}`;
  });
  els.direction.addEventListener('change', updateSwapFromBroker);
  els.broker?.addEventListener('change', updateSwapFromBroker);
  els.themeToggle?.addEventListener('click', toggleTheme);

  // Tab: leverage
  els.fetchPriceBtn2?.addEventListener('click', fetchAndFillPrice2);
  els.levRun?.addEventListener('click', computeEffectiveLeverage);
  els.levBackcalc?.addEventListener('click', backcalcUnitsFromTarget);
  els.levClear?.addEventListener('click', () => {
    els.levPrice.value = '';
    els.levEquity.value = 1_000_000;
    els.levUnits.value = '';
    els.targetLev.value = '';
    els.levEffective.textContent = '--';
    els.levReqUnits.textContent = '--';
    els.levReqUnitsCeil.textContent = '--';
    els.levReqUnitsFloor.textContent = '--';
  });
  els.levBroker?.addEventListener('change', () => { setLevMinUnitLabel(); computeEffectiveLeverage(); });

  // Tab: multi positions
  els.multiAdd?.addEventListener('click', () => addMultiRow());
  els.multiFetch?.addEventListener('click', fetchMultiPrices);
  els.multiRun?.addEventListener('click', simulateMultiPortfolio);
  els.multiReset?.addEventListener('click', resetMultiPortfolio);
  els.multiBroker?.addEventListener('change', updateMultiSwapFromBroker);
  els.multiPositionsBody?.addEventListener('click', (ev) => {
    const btn = ev.target.closest('.multi-remove');
    if (!btn) return;
    const row = btn.closest('tr');
    if (row) row.remove();
    if (els.multiPositionsBody && !els.multiPositionsBody.querySelector('tr')) addMultiRow();
  });

  // Tab: compare
  els.cmpRun?.addEventListener('click', compareSimulate);
  els.cmpReset?.addEventListener('click', () => {
    els.cmpMonths.value = 24;
    els.cmpLeverage.value = 10;
    els.cmpCapital.value = 1_000_000;
    els.cmpDeposit.value = 50_000;
    els.cmpMonthlyPriceChange.value = 0;
    els.cmpBroker.value = '';
    els.cmpPair1.value = 'USDJPY'; els.cmpDir1.value = 'long'; els.cmpSwap1.value = '';
    els.cmpPair2.value = 'GBPJPY'; els.cmpDir2.value = 'long'; els.cmpSwap2.value = '';
    els.cmpPair3.value = 'EURJPY'; els.cmpDir3.value = 'long'; els.cmpSwap3.value = '';
    setCmpSwapSource(1, '参照: 手動入力');
    setCmpSwapSource(2, '参照: 手動入力');
    setCmpSwapSource(3, '参照: 手動入力');
    if (els.cmpPrice1) els.cmpPrice1.textContent = '--';
    if (els.cmpPrice2) els.cmpPrice2.textContent = '--';
    if (els.cmpPrice3) els.cmpPrice3.textContent = '--';
    if (els.cmpSummaryBody) els.cmpSummaryBody.innerHTML = '';
    if (cmpChart) { cmpChart.destroy(); cmpChart = null; }
  });
  els.cmpBroker?.addEventListener('change', updateCmpSwapFromBroker);
  els.cmpPair1?.addEventListener('change', updateCmpSwapFromBroker);
  els.cmpPair2?.addEventListener('change', updateCmpSwapFromBroker);
  els.cmpPair3?.addEventListener('change', updateCmpSwapFromBroker);
  els.cmpDir1?.addEventListener('change', updateCmpSwapFromBroker);
  els.cmpDir2?.addEventListener('change', updateCmpSwapFromBroker);
  els.cmpDir3?.addEventListener('change', updateCmpSwapFromBroker);

  // Tabs switching
  function activateTab(name) {
    const views = document.querySelectorAll('.tab-view');
    views.forEach(v => v.classList.toggle('active', v.id === `tab-${name}`));
    const btns = document.querySelectorAll('.tab-btn');
    btns.forEach(b => b.classList.toggle('active', b.getAttribute('data-tab') === name));
  }
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => activateTab(btn.getAttribute('data-tab')));
  });

  // Init
  resetMultiPortfolio();
  // default: manual entry. Use 「取得」ボタンで反映。
  loadBrokers().then(populateBrokerOptions);
  // Theme init
  applyTheme(getPreferredTheme());
  // KPIs init
  if (els.kpiLev) els.kpiLev.textContent = `x${fmtNum(valNum(els.leverage, 10), 0)}`;
  if (els.kpiSwap) els.kpiSwap.textContent = `${fmtNum(valNum(els.swapPer10kPerDay, 0), 0)} 円`;
})();
