// ============================================================
// portfolio-charts.js — ポートフォリオ用チャート描画
// ============================================================

let swapIncomeChartInstance = null;
let swapByCurrencyChartInstance = null;
let portfolioAssetChartInstance = null;

// カラーパレット
const CHART_COLORS = [
  '#2563eb', '#10b981', '#f59e0b', '#ef4444',
  '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
];

function updateSwapCharts() {
  const period = document.getElementById('swapChartPeriod').value;
  const type = document.getElementById('swapChartType').value;
  renderSwapIncomeChart(period, type);
  renderSwapByCurrencyChart();
}

// ---- スワップ収入推移チャート ----
function renderSwapIncomeChart(period, type) {
  const swapHistory = DataStore.getSwapHistory();
  if (swapHistory.length === 0) return;

  // 期間別に集計
  const grouped = {};
  swapHistory.forEach(r => {
    let key;
    if (period === 'daily') {
      key = r.date;
    } else if (period === 'weekly') {
      const d = new Date(r.date);
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      key = weekStart.toISOString().split('T')[0];
    } else {
      key = r.date.substring(0, 7); // YYYY-MM
    }
    if (!grouped[key]) grouped[key] = {};
    if (!grouped[key][r.currencyPair]) grouped[key][r.currencyPair] = 0;
    grouped[key][r.currencyPair] += r.amount;
  });

  const sortedKeys = Object.keys(grouped).sort();
  const allPairs = [...new Set(swapHistory.map(r => r.currencyPair))];

  const canvas = document.getElementById('swapIncomeChart');
  if (swapIncomeChartInstance) swapIncomeChartInstance.destroy();

  if (type === 'bar') {
    const datasets = allPairs.map((pair, i) => ({
      label: pair.replace('_', '/'),
      data: sortedKeys.map(k => Math.round(grouped[k]?.[pair] || 0)),
      backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
    }));

    swapIncomeChartInstance = new Chart(canvas, {
      type: 'bar',
      data: { labels: formatLabels(sortedKeys, period), datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } },
        scales: {
          x: { stacked: true },
          y: { stacked: true, title: { display: true, text: 'スワップ収入（円）' } }
        }
      }
    });
  } else {
    // 累積折れ線
    let cumulative = {};
    allPairs.forEach(p => cumulative[p] = 0);
    let cumulativeTotal = 0;

    const totalData = [];
    const pairData = {};
    allPairs.forEach(p => pairData[p] = []);

    sortedKeys.forEach(k => {
      allPairs.forEach(p => {
        cumulative[p] += (grouped[k]?.[p] || 0);
        pairData[p].push(Math.round(cumulative[p]));
      });
      cumulativeTotal += allPairs.reduce((s, p) => s + (grouped[k]?.[p] || 0), 0);
      totalData.push(Math.round(cumulativeTotal));
    });

    const datasets = [
      {
        label: '合計',
        data: totalData,
        borderColor: '#1e293b',
        backgroundColor: 'rgba(30,41,59,0.1)',
        borderWidth: 2,
        fill: true,
      },
      ...allPairs.map((pair, i) => ({
        label: pair.replace('_', '/'),
        data: pairData[pair],
        borderColor: CHART_COLORS[i % CHART_COLORS.length],
        borderWidth: 1,
        borderDash: [4, 2],
        fill: false,
      }))
    ];

    swapIncomeChartInstance = new Chart(canvas, {
      type: 'line',
      data: { labels: formatLabels(sortedKeys, period), datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } },
        scales: {
          y: { title: { display: true, text: '累積スワップ（円）' } }
        }
      }
    });
  }
}

// ---- 通貨別スワップ収入ドーナツチャート ----
function renderSwapByCurrencyChart() {
  const swapHistory = DataStore.getSwapHistory();
  if (swapHistory.length === 0) return;

  const byPair = {};
  swapHistory.forEach(r => {
    if (!byPair[r.currencyPair]) byPair[r.currencyPair] = 0;
    byPair[r.currencyPair] += r.amount;
  });

  const labels = Object.keys(byPair).map(p => p.replace('_', '/'));
  const data = Object.values(byPair).map(v => Math.round(v));

  const canvas = document.getElementById('swapByCurrencyChart');
  if (swapByCurrencyChartInstance) swapByCurrencyChartInstance.destroy();

  swapByCurrencyChartInstance = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: CHART_COLORS.slice(0, labels.length),
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom' },
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.label}: ¥${ctx.raw.toLocaleString()}`
          }
        }
      }
    }
  });
}

// ---- 資産推移チャート ----
function renderPortfolioAssetChart() {
  const snapshots = DataStore.getSnapshots();
  if (snapshots.length < 2) return;

  const labels = snapshots.map(s => s.date);
  const totalValues = snapshots.map(s => s.totalValue);
  const unrealizedPnLs = snapshots.map(s => s.unrealizedPnL);
  const swapIncomes = snapshots.map(s => s.totalSwapIncome);

  const canvas = document.getElementById('portfolioAssetChart');
  if (portfolioAssetChartInstance) portfolioAssetChartInstance.destroy();

  portfolioAssetChartInstance = new Chart(canvas, {
    type: 'line',
    data: {
      labels: labels.map(l => l.substring(5)), // MM-DD表示
      datasets: [
        {
          label: '総資産評価額',
          data: totalValues,
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37,99,235,0.1)',
          borderWidth: 2,
          fill: true,
          yAxisID: 'y',
        },
        {
          label: '含み損益',
          data: unrealizedPnLs,
          borderColor: '#f59e0b',
          borderWidth: 1.5,
          borderDash: [4, 2],
          fill: false,
          yAxisID: 'y',
        },
        {
          label: '累計スワップ',
          data: swapIncomes,
          borderColor: '#10b981',
          borderWidth: 1.5,
          fill: false,
          yAxisID: 'y',
        },
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom' } },
      scales: {
        y: {
          title: { display: true, text: '金額（円）' },
          ticks: {
            callback: v => `¥${v.toLocaleString()}`
          }
        }
      }
    }
  });
}

// ---- ユーティリティ ----
function formatLabels(keys, period) {
  return keys.map(k => {
    if (period === 'daily') return k.substring(5); // MM-DD
    if (period === 'weekly') return `w${k.substring(5)}`; // wMM-DD
    return k; // YYYY-MM
  });
}
