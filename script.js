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
    kpiLev: document.getElementById('kpi-lev')
  };

  const PAIRS = {
    USDJPY: { base: 'USD', quote: 'JPY' },
    GBPJPY: { base: 'GBP', quote: 'JPY' },
    EURJPY: { base: 'EUR', quote: 'JPY' },
    MXNJPY: { base: 'MXN', quote: 'JPY' },
    ZARJPY: { base: 'ZAR', quote: 'JPY' },
    TRYJPY: { base: 'TRY', quote: 'JPY' }
  };

  let chart = null;
  let BROKERS = null; // loaded from brokers.json
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
    const fills = [els.broker, els.levBroker].filter(Boolean);
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
  // default: manual entry. Use 「取得」ボタンで反映。
  loadBrokers().then(populateBrokerOptions);
  // Theme init
  applyTheme(getPreferredTheme());
  // KPIs init
  if (els.kpiLev) els.kpiLev.textContent = `x${fmtNum(valNum(els.leverage, 10), 0)}`;
  if (els.kpiSwap) els.kpiSwap.textContent = `${fmtNum(valNum(els.swapPer10kPerDay, 0), 0)} 円`;
})();
