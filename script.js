// GMOクリック証券の通貨ペアデータ（2025年1月時点の参考値）
const currencyPairs = [
  {
    id: 'TRY_JPY',
    name: 'TRY/JPY',
    fullName: 'トルコリラ/円',
    rate: 4.45,
    swapBuy: 42,      // 買いスワップ（円/1万通貨/日）
    swapSell: -72,    // 売りスワップ
    volatility: 25,   // 年率ボラティリティ(%)
    unit: 10000,      // 取引単位
    marginRate: 0.04, // 必要証拠金率（4%＝レバ25倍）
    enabled: true,
    position: 'long'
  },
  {
    id: 'MXN_JPY',
    name: 'MXN/JPY',
    fullName: 'メキシコペソ/円',
    rate: 7.50,
    swapBuy: 26,
    swapSell: -46,
    volatility: 15,
    unit: 100000,
    marginRate: 0.04,
    enabled: true,
    position: 'long'
  },
  {
    id: 'ZAR_JPY',
    name: 'ZAR/JPY',
    fullName: '南アフリカランド/円',
    rate: 8.20,
    swapBuy: 18,
    swapSell: -38,
    volatility: 18,
    unit: 100000,
    marginRate: 0.04,
    enabled: true,
    position: 'long'
  },
  {
    id: 'HUF_JPY',
    name: 'HUF/JPY',
    fullName: 'ハンガリーフォリント/円',
    rate: 0.39,
    swapBuy: 22,      // 10万通貨あたり
    swapSell: -42,
    volatility: 12,
    unit: 100000,
    marginRate: 0.04,
    enabled: true,
    position: 'long'
  },
  {
    id: 'USD_JPY',
    name: 'USD/JPY',
    fullName: '米ドル/円',
    rate: 157.50,
    swapBuy: 205,
    swapSell: -235,
    volatility: 10,
    unit: 10000,
    marginRate: 0.04,
    enabled: false,
    position: 'short'
  },
  {
    id: 'EUR_JPY',
    name: 'EUR/JPY',
    fullName: 'ユーロ/円',
    rate: 164.00,
    swapBuy: 145,
    swapSell: -175,
    volatility: 9,
    unit: 10000,
    marginRate: 0.04,
    enabled: false,
    position: 'short'
  },
  {
    id: 'CHF_JPY',
    name: 'CHF/JPY',
    fullName: 'スイスフラン/円',
    rate: 175.00,
    swapBuy: 50,
    swapSell: -80,
    volatility: 8,
    unit: 10000,
    marginRate: 0.04,
    enabled: false,
    position: 'long'
  }
];

// デフォルトの相関係数マトリクス（概算値）
const defaultCorrelations = {
  'TRY_JPY': { 'TRY_JPY': 1.0, 'MXN_JPY': 0.6, 'ZAR_JPY': 0.65, 'HUF_JPY': 0.5, 'USD_JPY': 0.3, 'EUR_JPY': 0.35, 'CHF_JPY': 0.2 },
  'MXN_JPY': { 'TRY_JPY': 0.6, 'MXN_JPY': 1.0, 'ZAR_JPY': 0.7, 'HUF_JPY': 0.55, 'USD_JPY': 0.5, 'EUR_JPY': 0.45, 'CHF_JPY': 0.3 },
  'ZAR_JPY': { 'TRY_JPY': 0.65, 'MXN_JPY': 0.7, 'ZAR_JPY': 1.0, 'HUF_JPY': 0.5, 'USD_JPY': 0.45, 'EUR_JPY': 0.4, 'CHF_JPY': 0.25 },
  'HUF_JPY': { 'TRY_JPY': 0.5, 'MXN_JPY': 0.55, 'ZAR_JPY': 0.5, 'HUF_JPY': 1.0, 'USD_JPY': 0.4, 'EUR_JPY': 0.7, 'CHF_JPY': 0.6 },
  'USD_JPY': { 'TRY_JPY': 0.3, 'MXN_JPY': 0.5, 'ZAR_JPY': 0.45, 'HUF_JPY': 0.4, 'USD_JPY': 1.0, 'EUR_JPY': 0.85, 'CHF_JPY': 0.75 },
  'EUR_JPY': { 'TRY_JPY': 0.35, 'MXN_JPY': 0.45, 'ZAR_JPY': 0.4, 'HUF_JPY': 0.7, 'USD_JPY': 0.85, 'EUR_JPY': 1.0, 'CHF_JPY': 0.8 },
  'CHF_JPY': { 'TRY_JPY': 0.2, 'MXN_JPY': 0.3, 'ZAR_JPY': 0.25, 'HUF_JPY': 0.6, 'USD_JPY': 0.75, 'EUR_JPY': 0.8, 'CHF_JPY': 1.0 }
};

let correlations = JSON.parse(JSON.stringify(defaultCorrelations));
let allocationChart = null;
let frontierChart = null;

// DOM要素
document.addEventListener('DOMContentLoaded', () => {
  initializeCurrencyTable();
  initializeCorrelationMatrix();
  setupEventListeners();
});

function initializeCurrencyTable() {
  const tbody = document.getElementById('currencyBody');
  tbody.innerHTML = '';

  currencyPairs.forEach(pair => {
    const swapValue = pair.position === 'long' ? pair.swapBuy : Math.abs(pair.swapSell);
    const annualRate = calculateAnnualRate(pair, swapValue);

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>
        <input type="checkbox" data-id="${pair.id}" class="pair-enabled" ${pair.enabled ? 'checked' : ''}>
      </td>
      <td>
        <strong>${pair.name}</strong>
        <br><small>${pair.fullName}</small>
      </td>
      <td>
        <select data-id="${pair.id}" class="pair-position">
          <option value="long" ${pair.position === 'long' ? 'selected' : ''}>買い(Long)</option>
          <option value="short" ${pair.position === 'short' ? 'selected' : ''}>売り(Short)</option>
        </select>
      </td>
      <td>
        <input type="number" data-id="${pair.id}" class="pair-rate" value="${pair.rate}" step="0.01" min="0">
      </td>
      <td>
        <input type="number" data-id="${pair.id}" class="pair-swap" value="${swapValue}" step="1">
        <small>円/${pair.unit.toLocaleString()}通貨</small>
      </td>
      <td class="annual-rate" data-id="${pair.id}">${annualRate.toFixed(2)}%</td>
      <td>
        <input type="number" data-id="${pair.id}" class="pair-volatility" value="${pair.volatility}" step="0.1" min="0" max="100">
      </td>
      <td>${pair.unit.toLocaleString()}</td>
    `;
    tbody.appendChild(row);
  });
}

function calculateAnnualRate(pair, swapPerDay) {
  // 年率 = (スワップ × 365) / (レート × 取引単位) × 100
  const annualSwap = swapPerDay * 365;
  const positionValue = pair.rate * pair.unit;
  return (annualSwap / positionValue) * 100;
}

function initializeCorrelationMatrix() {
  const table = document.getElementById('correlationMatrix');
  const enabledPairs = currencyPairs.filter(p => p.enabled);

  let html = '<thead><tr><th></th>';
  enabledPairs.forEach(p => {
    html += `<th>${p.name}</th>`;
  });
  html += '</tr></thead><tbody>';

  enabledPairs.forEach(p1 => {
    html += `<tr><th>${p1.name}</th>`;
    enabledPairs.forEach(p2 => {
      const value = correlations[p1.id][p2.id];
      const isDiagonal = p1.id === p2.id;
      html += `<td class="${isDiagonal ? 'diagonal' : ''}">
        <input type="number"
          data-row="${p1.id}"
          data-col="${p2.id}"
          value="${value}"
          min="-1" max="1" step="0.05"
          ${isDiagonal ? 'disabled' : ''}>
      </td>`;
    });
    html += '</tr>';
  });
  html += '</tbody>';

  table.innerHTML = html;
}

function setupEventListeners() {
  // 通貨ペア有効/無効の変更
  document.getElementById('currencyBody').addEventListener('change', (e) => {
    if (e.target.classList.contains('pair-enabled')) {
      const id = e.target.dataset.id;
      const pair = currencyPairs.find(p => p.id === id);
      if (pair) {
        pair.enabled = e.target.checked;
        initializeCorrelationMatrix();
      }
    }
    if (e.target.classList.contains('pair-position')) {
      const id = e.target.dataset.id;
      const pair = currencyPairs.find(p => p.id === id);
      if (pair) {
        pair.position = e.target.value;
        updateAnnualRate(id);
      }
    }
    if (e.target.classList.contains('pair-rate')) {
      const id = e.target.dataset.id;
      const pair = currencyPairs.find(p => p.id === id);
      if (pair) {
        pair.rate = parseFloat(e.target.value) || 0;
        updateAnnualRate(id);
      }
    }
    if (e.target.classList.contains('pair-swap')) {
      const id = e.target.dataset.id;
      const pair = currencyPairs.find(p => p.id === id);
      if (pair) {
        if (pair.position === 'long') {
          pair.swapBuy = parseFloat(e.target.value) || 0;
        } else {
          pair.swapSell = -(parseFloat(e.target.value) || 0);
        }
        updateAnnualRate(id);
      }
    }
    if (e.target.classList.contains('pair-volatility')) {
      const id = e.target.dataset.id;
      const pair = currencyPairs.find(p => p.id === id);
      if (pair) {
        pair.volatility = parseFloat(e.target.value) || 0;
      }
    }
  });

  // 相関係数の変更
  document.getElementById('correlationMatrix').addEventListener('change', (e) => {
    if (e.target.tagName === 'INPUT') {
      const row = e.target.dataset.row;
      const col = e.target.dataset.col;
      let value = parseFloat(e.target.value);
      value = Math.max(-1, Math.min(1, value));
      e.target.value = value;
      correlations[row][col] = value;
      correlations[col][row] = value; // 対称性を保持

      // 対称位置の入力も更新
      const symmetricInput = document.querySelector(`input[data-row="${col}"][data-col="${row}"]`);
      if (symmetricInput) {
        symmetricInput.value = value;
      }
    }
  });

  // 相関係数リセット
  document.getElementById('resetCorrelation').addEventListener('click', () => {
    correlations = JSON.parse(JSON.stringify(defaultCorrelations));
    initializeCorrelationMatrix();
  });

  // 最適化目標の変更
  document.getElementById('optimizationTarget').addEventListener('change', (e) => {
    const target = e.target.value;
    document.getElementById('targetReturnGroup').style.display =
      target === 'minRisk' ? 'block' : 'none';
    document.getElementById('targetRiskGroup').style.display =
      target === 'maxReturn' ? 'block' : 'none';
  });

  // 最適化ボタン
  document.getElementById('optimizeBtn').addEventListener('click', () => {
    runOptimization(true);
  });

  // 計算ボタン（現在設定で計算）
  document.getElementById('calculateBtn').addEventListener('click', () => {
    runOptimization(false);
  });
}

function updateAnnualRate(pairId) {
  const pair = currencyPairs.find(p => p.id === pairId);
  if (!pair) return;

  const swapValue = pair.position === 'long' ? pair.swapBuy : Math.abs(pair.swapSell);
  const annualRate = calculateAnnualRate(pair, swapValue);

  const cell = document.querySelector(`.annual-rate[data-id="${pairId}"]`);
  if (cell) {
    cell.textContent = `${annualRate.toFixed(2)}%`;
  }
}

function runOptimization(shouldOptimize) {
  const totalCapital = parseFloat(document.getElementById('totalCapital').value) || 0;
  const targetLeverage = parseFloat(document.getElementById('targetLeverage').value) || 1;
  const optimizationTarget = document.getElementById('optimizationTarget').value;

  const enabledPairs = currencyPairs.filter(p => p.enabled);
  if (enabledPairs.length === 0) {
    alert('少なくとも1つの通貨ペアを有効にしてください。');
    return;
  }

  document.body.classList.add('loading');

  setTimeout(() => {
    let weights;
    if (shouldOptimize) {
      weights = optimizePortfolio(enabledPairs, optimizationTarget);
    } else {
      // 均等配分
      const equalWeight = 1 / enabledPairs.length;
      weights = enabledPairs.map(() => equalWeight);
    }

    const results = calculatePortfolioMetrics(enabledPairs, weights, totalCapital, targetLeverage);
    displayResults(enabledPairs, weights, results, totalCapital, targetLeverage);

    document.body.classList.remove('loading');
    document.getElementById('resultSection').style.display = 'block';
    document.getElementById('resultSection').scrollIntoView({ behavior: 'smooth' });
  }, 100);
}

function optimizePortfolio(pairs, target) {
  const n = pairs.length;

  // シミュレーテッドアニーリングによる最適化
  let bestWeights = Array(n).fill(1 / n);
  let bestSharpe = calculateSharpeRatio(pairs, bestWeights);

  let currentWeights = [...bestWeights];
  let temperature = 1.0;
  const coolingRate = 0.995;
  const iterations = 10000;

  for (let i = 0; i < iterations; i++) {
    // ランダムに重みを調整
    const newWeights = perturbWeights(currentWeights);
    const newSharpe = calculateSharpeRatio(pairs, newWeights);

    // より良い解、または確率的に悪い解を受け入れる
    const delta = newSharpe - calculateSharpeRatio(pairs, currentWeights);
    if (delta > 0 || Math.random() < Math.exp(delta / temperature)) {
      currentWeights = newWeights;

      if (newSharpe > bestSharpe) {
        bestSharpe = newSharpe;
        bestWeights = [...newWeights];
      }
    }

    temperature *= coolingRate;
  }

  return bestWeights;
}

function perturbWeights(weights) {
  const n = weights.length;
  const newWeights = [...weights];

  // ランダムに2つの資産を選んで重みを調整
  const i = Math.floor(Math.random() * n);
  let j;
  do {
    j = Math.floor(Math.random() * n);
  } while (j === i);

  const delta = (Math.random() - 0.5) * 0.2; // ±10%の調整
  newWeights[i] = Math.max(0, Math.min(1, newWeights[i] + delta));
  newWeights[j] = Math.max(0, Math.min(1, newWeights[j] - delta));

  // 正規化
  const sum = newWeights.reduce((a, b) => a + b, 0);
  return newWeights.map(w => Math.max(0, w / sum));
}

function calculateSharpeRatio(pairs, weights) {
  const expectedReturn = calculateExpectedReturn(pairs, weights);
  const risk = calculatePortfolioRisk(pairs, weights);
  const riskFreeRate = 0; // 無リスク金利を0%と仮定

  if (risk === 0) return 0;
  return (expectedReturn - riskFreeRate) / risk;
}

function calculateExpectedReturn(pairs, weights) {
  let totalReturn = 0;
  for (let i = 0; i < pairs.length; i++) {
    const pair = pairs[i];
    const swapValue = pair.position === 'long' ? pair.swapBuy : Math.abs(pair.swapSell);
    const annualRate = calculateAnnualRate(pair, swapValue);

    // 為替変動による期待損失を考慮（高金利通貨は下落傾向）
    // 簡易的に、ボラティリティの一部を期待損失として考慮
    const expectedDepreciation = pair.volatility * 0.3; // 30%程度を期待損失と仮定
    const adjustedReturn = annualRate - expectedDepreciation;

    totalReturn += weights[i] * adjustedReturn;
  }
  return totalReturn;
}

function calculatePortfolioRisk(pairs, weights) {
  let variance = 0;

  for (let i = 0; i < pairs.length; i++) {
    for (let j = 0; j < pairs.length; j++) {
      const corr = correlations[pairs[i].id][pairs[j].id];
      const vol_i = pairs[i].volatility / 100;
      const vol_j = pairs[j].volatility / 100;
      variance += weights[i] * weights[j] * vol_i * vol_j * corr;
    }
  }

  return Math.sqrt(variance) * 100; // パーセント表記
}

function calculatePortfolioMetrics(pairs, weights, totalCapital, targetLeverage) {
  const expectedReturn = calculateExpectedReturn(pairs, weights);
  const risk = calculatePortfolioRisk(pairs, weights);
  const sharpe = calculateSharpeRatio(pairs, weights);

  // 投資可能金額（証拠金×レバレッジ）
  const investableAmount = totalCapital * targetLeverage;

  // 各通貨ペアの配分
  const allocations = pairs.map((pair, i) => {
    const allocationAmount = investableAmount * weights[i];
    const positionValue = pair.rate * pair.unit;
    const lots = Math.floor(allocationAmount / positionValue);
    const actualAmount = lots * positionValue;
    const margin = actualAmount * pair.marginRate;

    const swapValue = pair.position === 'long' ? pair.swapBuy : Math.abs(pair.swapSell);
    const annualSwap = swapValue * 365 * lots;

    return {
      pair,
      weight: weights[i],
      lots,
      actualAmount,
      margin,
      annualSwap
    };
  });

  const totalMargin = allocations.reduce((sum, a) => sum + a.margin, 0);
  const totalAnnualSwap = allocations.reduce((sum, a) => sum + a.annualSwap, 0);

  // リスク寄与度の計算
  const riskContributions = calculateRiskContributions(pairs, weights);

  return {
    expectedReturn,
    risk,
    sharpe,
    allocations,
    totalMargin,
    totalAnnualSwap,
    riskContributions
  };
}

function calculateRiskContributions(pairs, weights) {
  const totalRisk = calculatePortfolioRisk(pairs, weights);
  const contributions = [];

  for (let i = 0; i < pairs.length; i++) {
    // 限界リスク寄与度
    let marginalContribution = 0;
    for (let j = 0; j < pairs.length; j++) {
      const corr = correlations[pairs[i].id][pairs[j].id];
      const vol_i = pairs[i].volatility / 100;
      const vol_j = pairs[j].volatility / 100;
      marginalContribution += weights[j] * vol_i * vol_j * corr;
    }

    const riskContribution = weights[i] * marginalContribution / (totalRisk / 100);
    contributions.push({
      pair: pairs[i],
      contribution: riskContribution * 100,
      percentage: (riskContribution / (totalRisk / 100)) * 100
    });
  }

  return contributions;
}

function displayResults(pairs, weights, results, totalCapital, targetLeverage) {
  // サマリー
  document.getElementById('expectedReturn').textContent = `${results.expectedReturn.toFixed(2)}%`;
  document.getElementById('portfolioRisk').textContent = `${results.risk.toFixed(2)}%`;
  document.getElementById('sharpeRatio').textContent = results.sharpe.toFixed(3);
  document.getElementById('annualSwap').textContent = `¥${results.totalAnnualSwap.toLocaleString()}`;

  // 配分テーブル
  const resultBody = document.getElementById('resultBody');
  resultBody.innerHTML = '';

  results.allocations.forEach(alloc => {
    if (alloc.lots > 0) {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td><strong>${alloc.pair.name}</strong></td>
        <td class="${alloc.pair.position === 'long' ? 'position-long' : 'position-short'}">
          ${alloc.pair.position === 'long' ? '買い' : '売り'}
        </td>
        <td>${(alloc.weight * 100).toFixed(1)}%</td>
        <td>${alloc.lots.toLocaleString()} lot（${(alloc.lots * alloc.pair.unit).toLocaleString()}通貨）</td>
        <td>¥${Math.round(alloc.margin).toLocaleString()}</td>
        <td>¥${alloc.annualSwap.toLocaleString()}</td>
      `;
      resultBody.appendChild(row);
    }
  });

  // 合計行
  const totalRow = document.createElement('tr');
  totalRow.innerHTML = `
    <td colspan="4"><strong>合計</strong></td>
    <td><strong>¥${Math.round(results.totalMargin).toLocaleString()}</strong></td>
    <td><strong>¥${results.totalAnnualSwap.toLocaleString()}</strong></td>
  `;
  totalRow.style.background = '#f1f5f9';
  resultBody.appendChild(totalRow);

  // リスク寄与度テーブル
  const riskBody = document.getElementById('riskContributionBody');
  riskBody.innerHTML = '';

  results.riskContributions.forEach(rc => {
    if (rc.contribution > 0.01) {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td><strong>${rc.pair.name}</strong></td>
        <td>${rc.contribution.toFixed(2)}%</td>
        <td>${rc.percentage.toFixed(1)}%</td>
      `;
      riskBody.appendChild(row);
    }
  });

  // グラフ更新
  updateCharts(results);
}

function updateCharts(results) {
  // 配分円グラフ
  const allocationCtx = document.getElementById('allocationChart').getContext('2d');

  if (allocationChart) {
    allocationChart.destroy();
  }

  const validAllocations = results.allocations.filter(a => a.lots > 0);

  allocationChart = new Chart(allocationCtx, {
    type: 'doughnut',
    data: {
      labels: validAllocations.map(a => a.pair.name),
      datasets: [{
        data: validAllocations.map(a => a.weight * 100),
        backgroundColor: [
          '#2563eb', '#10b981', '#f59e0b', '#ef4444',
          '#8b5cf6', '#06b6d4', '#ec4899'
        ],
        borderWidth: 2,
        borderColor: '#fff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'bottom'
        },
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.label}: ${ctx.raw.toFixed(1)}%`
          }
        }
      }
    }
  });

  // 効率的フロンティア
  const frontierCtx = document.getElementById('frontierChart').getContext('2d');

  if (frontierChart) {
    frontierChart.destroy();
  }

  const frontierData = generateEfficientFrontier(
    currencyPairs.filter(p => p.enabled)
  );

  frontierChart = new Chart(frontierCtx, {
    type: 'scatter',
    data: {
      datasets: [
        {
          label: '効率的フロンティア',
          data: frontierData,
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37, 99, 235, 0.1)',
          showLine: true,
          fill: false,
          pointRadius: 2
        },
        {
          label: '現在のポートフォリオ',
          data: [{ x: results.risk, y: results.expectedReturn }],
          backgroundColor: '#ef4444',
          pointRadius: 10,
          pointStyle: 'star'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        x: {
          title: {
            display: true,
            text: 'リスク（年率%）'
          }
        },
        y: {
          title: {
            display: true,
            text: '期待リターン（年率%）'
          }
        }
      },
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
}

function generateEfficientFrontier(pairs) {
  const points = [];
  const n = pairs.length;
  const steps = 50;

  for (let step = 0; step <= steps; step++) {
    // 様々なリスク許容度でポートフォリオを生成
    const riskAversion = step / steps;
    const weights = generateWeightsForRiskLevel(pairs, riskAversion);

    const risk = calculatePortfolioRisk(pairs, weights);
    const ret = calculateExpectedReturn(pairs, weights);

    points.push({ x: risk, y: ret });
  }

  // リスクでソート
  points.sort((a, b) => a.x - b.x);

  // 効率的フロンティア（同じリスクで最大リターンのみ）
  const frontier = [];
  let maxReturn = -Infinity;

  for (const point of points) {
    if (point.y > maxReturn) {
      maxReturn = point.y;
      frontier.push(point);
    }
  }

  return frontier;
}

function generateWeightsForRiskLevel(pairs, riskAversion) {
  const n = pairs.length;
  const weights = [];

  // リスク許容度に応じて重みを調整
  let totalScore = 0;
  const scores = pairs.map(pair => {
    const swapValue = pair.position === 'long' ? pair.swapBuy : Math.abs(pair.swapSell);
    const annualRate = calculateAnnualRate(pair, swapValue);
    // リターン/リスク比とリスク許容度のバランス
    const score = annualRate / pair.volatility * (1 - riskAversion) +
                  (1 / pair.volatility) * riskAversion;
    totalScore += Math.max(0.01, score);
    return Math.max(0.01, score);
  });

  return scores.map(s => s / totalScore);
}
