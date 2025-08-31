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
    autoStatus: document.getElementById('autoStatus')
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

  function fmtJPY(v) {
    return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY', maximumFractionDigits: 0 }).format(v);
  }
  function fmtNum(v, digits = 4) {
    return new Intl.NumberFormat('ja-JP', { maximumFractionDigits: digits }).format(v);
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
      const pairKey = els.pair.value;
      const price = await fetchPrice(pairKey);
      els.currentPrice.value = String(price.toFixed(5));
      els.priceText.textContent = fmtNum(price, 5);
      const now = new Date();
      els.priceUpdated.textContent = `（更新: ${now.toLocaleTimeString('ja-JP')}）`;
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
    const ctx = document.getElementById('equity-chart');
    if (!chart) {
      chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: '資産推移',
            data: series,
            borderColor: '#4cc9f0',
            backgroundColor: 'rgba(76,201,240,.15)',
            fill: true,
            tension: 0.2,
            pointRadius: 2
          }]
        },
        options: {
          responsive: true,
          interaction: { mode: 'index', intersect: false },
          scales: {
            y: {
              ticks: {
                callback: (v) => new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY', maximumFractionDigits: 0 }).format(v)
              }
            }
          },
          plugins: {
            legend: { display: false }
          }
        }
      });
    } else {
      chart.data.labels = labels;
      chart.data.datasets[0].data = series;
      chart.update();
    }
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
  });

  // Init
  // default: manual entry. Use 「取得」ボタンで反映。
})();
