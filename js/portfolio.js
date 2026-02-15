// ============================================================
// portfolio.js — ポートフォリオ管理機能
// ============================================================

// ---- 初期化 ----
function initPortfolio() {
  populatePortfolioDropdowns();
  setupPortfolioEventListeners();
  populateTaxYearDropdown();
  renderPortfolio();
  updateStorageUsage();
}

function populatePortfolioDropdowns() {
  const select = document.getElementById('pfCurrencyPair');
  select.innerHTML = '';
  baseCurrencyPairs.forEach(pair => {
    const opt = document.createElement('option');
    opt.value = pair.id;
    opt.textContent = `${pair.name}（${pair.fullName}）`;
    select.appendChild(opt);
  });

  // デフォルトのエントリーレートを設定
  updateEntryRateDefault();

  // エントリー日のデフォルトを今日に
  document.getElementById('pfEntryDate').value = new Date().toISOString().split('T')[0];
}

function updateEntryRateDefault() {
  const pairId = document.getElementById('pfCurrencyPair').value;
  const pair = baseCurrencyPairs.find(p => p.id === pairId);
  if (pair) {
    document.getElementById('pfEntryRate').value = pair.rate;
  }
}

function populateTaxYearDropdown() {
  const select = document.getElementById('taxYear');
  const currentYear = new Date().getFullYear();
  select.innerHTML = '';
  for (let y = currentYear; y >= currentYear - 5; y--) {
    const opt = document.createElement('option');
    opt.value = y;
    opt.textContent = `${y}年`;
    select.appendChild(opt);
  }
}

function setupPortfolioEventListeners() {
  document.getElementById('pfCurrencyPair').addEventListener('change', updateEntryRateDefault);
  document.getElementById('pfAddPositionBtn').addEventListener('click', addPosition);
  document.getElementById('pfAccountBalance').addEventListener('input', renderPortfolioSummary);
  document.getElementById('saveGoalBtn').addEventListener('click', saveGoal);
  document.getElementById('exportTaxReportBtn').addEventListener('click', () => {
    const year = parseInt(document.getElementById('taxYear').value);
    generateTaxReport(year);
  });
  document.getElementById('exportPortfolioDataBtn').addEventListener('click', exportPortfolioData);
  document.getElementById('importPortfolioDataBtn').addEventListener('click', () => {
    document.getElementById('importPortfolioDataFile').click();
  });
  document.getElementById('importPortfolioDataFile').addEventListener('change', (e) => {
    if (e.target.files[0]) importPortfolioData(e.target.files[0]);
  });

  // チャートコントロール
  document.getElementById('swapChartPeriod').addEventListener('change', updateSwapCharts);
  document.getElementById('swapChartType').addEventListener('change', updateSwapCharts);
}

// ---- ポジション登録 ----
function addPosition() {
  const pairId = document.getElementById('pfCurrencyPair').value;
  const direction = document.getElementById('pfDirection').value;
  const lots = parseFloat(document.getElementById('pfLots').value);
  const entryRate = parseFloat(document.getElementById('pfEntryRate').value);
  const entryDate = document.getElementById('pfEntryDate').value;
  const broker = document.getElementById('pfBroker').value;
  const memo = document.getElementById('pfMemo').value.trim();

  // バリデーション
  if (!pairId || !entryDate || isNaN(lots) || lots <= 0 || isNaN(entryRate) || entryRate <= 0) {
    showToast('入力内容を確認してください', 'warning');
    return;
  }

  const pair = baseCurrencyPairs.find(p => p.id === pairId);
  const swapData = brokerSwapData[broker]?.[pairId];
  const unit = swapData ? swapData.unit : 10000;

  const position = {
    currencyPair: pairId,
    currencyPairName: pair ? pair.name : pairId,
    direction,
    lots,
    units: lots * unit,
    entryRate,
    entryDate,
    broker,
    memo,
  };

  DataStore.savePosition(position);

  // エントリー日から今日までのスワップを自動計算
  autoCalculateSwapForPosition(position);

  // フォームリセット
  document.getElementById('pfLots').value = 1;
  document.getElementById('pfMemo').value = '';

  showToast(`${pair ? pair.name : pairId} のポジションを登録しました`, 'success');
  renderPortfolio();
}

// ---- スワップ自動計算 ----
function autoCalculateSwapForPosition(position) {
  const swapData = brokerSwapData[position.broker]?.[position.currencyPair];
  if (!swapData) return;

  const dailySwap = calculateDailySwapForPos(position, swapData);
  const startDate = new Date(position.entryDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existingRecords = DataStore.getSwapHistory({ positionId: position.id });
  const existingDates = new Set(existingRecords.map(r => r.date));

  const records = [];
  const d = new Date(startDate);
  while (d <= today) {
    const dateStr = d.toISOString().split('T')[0];
    if (!existingDates.has(dateStr)) {
      records.push({
        positionId: position.id,
        currencyPair: position.currencyPair,
        date: dateStr,
        amount: dailySwap,
        lots: position.lots,
        ratePerUnit: position.direction === 'long' ? swapData.swapBuy : swapData.swapSell,
        broker: position.broker,
        autoCalculated: true,
      });
    }
    d.setDate(d.getDate() + 1);
  }

  if (records.length > 0) {
    DataStore.bulkAddSwapRecords(records);
  }
}

function calculateDailySwapForPos(position, swapData) {
  if (!swapData) return 0;
  const swapRate = position.direction === 'long' ? swapData.swapBuy : swapData.swapSell;
  // スワップはunit通貨あたりの値。ロット数をかける
  return Math.round(swapRate * position.lots * 100) / 100;
}

// ---- ポジション決済 ----
function closePositionPrompt(positionId) {
  const positions = DataStore.getPositions();
  const pos = positions.find(p => p.id === positionId);
  if (!pos) return;

  const pair = baseCurrencyPairs.find(p => p.id === pos.currencyPair);
  const currentRate = pair ? pair.rate : pos.entryRate;

  const exitRate = prompt(`${pos.currencyPairName} の決済レートを入力してください`, currentRate);
  if (exitRate === null) return;

  const exitRateNum = parseFloat(exitRate);
  if (isNaN(exitRateNum) || exitRateNum <= 0) {
    showToast('有効な決済レートを入力してください', 'warning');
    return;
  }

  const exitDate = new Date().toISOString().split('T')[0];
  const closed = DataStore.closePosition(positionId, exitRateNum, exitDate);

  if (closed) {
    showToast(`${pos.currencyPairName} を決済しました（損益: ¥${(closed.realizedPnL + closed.totalSwapEarned).toLocaleString()}）`, 'success');
    renderPortfolio();
  }
}

function deletePositionPrompt(positionId) {
  if (!confirm('このポジションを削除しますか？関連するスワップ履歴も削除されます。')) return;
  DataStore.deletePosition(positionId);
  showToast('ポジションを削除しました', 'info');
  renderPortfolio();
}

// ---- P&L計算 ----
function calculateUnrealizedPnL(position) {
  const pair = baseCurrencyPairs.find(p => p.id === position.currencyPair);
  const currentRate = pair ? pair.rate : position.entryRate;
  const dirMul = position.direction === 'long' ? 1 : -1;
  return (currentRate - position.entryRate) * position.units * dirMul;
}

function getCurrentRate(currencyPairId) {
  const pair = baseCurrencyPairs.find(p => p.id === currencyPairId);
  return pair ? pair.rate : null;
}

function getHoldingDays(entryDate) {
  const start = new Date(entryDate);
  const today = new Date();
  return Math.max(0, Math.floor((today - start) / (1000 * 60 * 60 * 24)));
}

// ---- レンダリング ----
function renderPortfolio() {
  renderOpenPositions();
  renderClosedPositions();
  renderPortfolioSummary();
  renderCurrencyPerformance();
  renderGoalProgress();
  takePortfolioSnapshot();
  updateSectionVisibility();

  // チャート更新
  if (typeof updateSwapCharts === 'function') updateSwapCharts();
  if (typeof renderPortfolioAssetChart === 'function') renderPortfolioAssetChart();
}

function updateSectionVisibility() {
  const positions = DataStore.getPositions();
  const closedPositions = DataStore.getClosedPositions();
  const swapHistory = DataStore.getSwapHistory();

  // 保有ポジション
  const hasPositions = positions.length > 0;
  document.getElementById('noPositionsMsg').style.display = hasPositions ? 'none' : 'block';
  document.getElementById('openPositionsWrapper').style.display = hasPositions ? '' : 'none';

  // チャート・パフォーマンス
  const hasData = swapHistory.length > 0 || hasPositions;
  document.getElementById('swapVisualizationSection').style.display = hasData ? '' : 'none';
  document.getElementById('assetTransitionSection').style.display = hasData ? '' : 'none';
  document.getElementById('currencyPerformanceSection').style.display = hasPositions ? '' : 'none';

  // 決済済み
  document.getElementById('closedPositionsSection').style.display = closedPositions.length > 0 ? '' : 'none';
}

function renderOpenPositions() {
  const positions = DataStore.getPositions();
  const tbody = document.getElementById('openPositionsBody');
  tbody.innerHTML = '';

  positions.forEach(pos => {
    const currentRate = getCurrentRate(pos.currencyPair);
    const unrealizedPnL = calculateUnrealizedPnL(pos);
    const swapData = brokerSwapData[pos.broker]?.[pos.currencyPair];
    const dailySwap = calculateDailySwapForPos(pos, swapData);
    const swapRecords = DataStore.getSwapHistory({ positionId: pos.id });
    const cumulativeSwap = swapRecords.reduce((s, r) => s + r.amount, 0);
    const holdingDays = getHoldingDays(pos.entryDate);
    const pnlClass = unrealizedPnL >= 0 ? 'swap-positive' : 'swap-negative';
    const dirClass = pos.direction === 'long' ? 'position-long' : 'position-short';
    const dirLabel = pos.direction === 'long' ? '買い' : '売り';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${pos.currencyPairName || pos.currencyPair}</strong></td>
      <td class="${dirClass}">${dirLabel}</td>
      <td>${pos.lots}</td>
      <td>${pos.entryRate.toFixed(3)}</td>
      <td>${currentRate !== null ? currentRate.toFixed(3) : '-'}</td>
      <td class="${pnlClass}">¥${Math.round(unrealizedPnL).toLocaleString()}</td>
      <td class="${dailySwap >= 0 ? 'swap-positive' : 'swap-negative'}">¥${dailySwap.toLocaleString()}</td>
      <td>¥${Math.round(cumulativeSwap).toLocaleString()}</td>
      <td>${holdingDays}日</td>
      <td>
        <button class="action-btn action-btn-close" onclick="closePositionPrompt('${pos.id}')">決済</button>
        <button class="action-btn action-btn-delete" onclick="deletePositionPrompt('${pos.id}')">削除</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function renderClosedPositions() {
  const closedPositions = DataStore.getClosedPositions();
  const tbody = document.getElementById('closedPositionsBody');
  tbody.innerHTML = '';

  closedPositions.forEach(pos => {
    const totalPnL = pos.realizedPnL + pos.totalSwapEarned;
    const pnlClass = totalPnL >= 0 ? 'swap-positive' : 'swap-negative';
    const dirClass = pos.direction === 'long' ? 'position-long' : 'position-short';
    const dirLabel = pos.direction === 'long' ? '買い' : '売り';
    const holdingDays = Math.max(0, Math.floor((new Date(pos.exitDate) - new Date(pos.entryDate)) / (1000 * 60 * 60 * 24)));

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${pos.currencyPairName || pos.currencyPair}</strong></td>
      <td class="${dirClass}">${dirLabel}</td>
      <td>${pos.lots}</td>
      <td>${pos.entryRate.toFixed(3)}</td>
      <td>${pos.exitRate.toFixed(3)}</td>
      <td class="${pos.realizedPnL >= 0 ? 'swap-positive' : 'swap-negative'}">¥${pos.realizedPnL.toLocaleString()}</td>
      <td>¥${pos.totalSwapEarned.toLocaleString()}</td>
      <td class="${pnlClass}">¥${totalPnL.toLocaleString()}</td>
      <td>${holdingDays}日</td>
    `;
    tbody.appendChild(tr);
  });
}

function renderPortfolioSummary() {
  const positions = DataStore.getPositions();
  const swapHistory = DataStore.getSwapHistory();
  const closedPositions = DataStore.getClosedPositions();

  // 含み損益合計・想定元本（現在レートベース）
  let totalUnrealizedPnL = 0;
  let totalNotional = 0;
  positions.forEach(pos => {
    totalUnrealizedPnL += calculateUnrealizedPnL(pos);
    const currentRate = getCurrentRate(pos.currencyPair) || pos.entryRate;
    totalNotional += pos.units * currentRate;
  });

  // 累計スワップ
  const totalSwapIncome = swapHistory.reduce((s, r) => s + r.amount, 0);

  // 今月スワップ
  const now = new Date();
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  const monthlySwap = swapHistory
    .filter(r => r.date >= monthStart)
    .reduce((s, r) => s + r.amount, 0);

  // 実行レバレッジ = 想定元本 / 有効証拠金
  const accountBalance = parseFloat(document.getElementById('pfAccountBalance')?.value) || 0;
  const equity = accountBalance + totalUnrealizedPnL;
  const leverage = equity > 0 ? totalNotional / equity : 0;

  const levEl = document.getElementById('pfLeverage');
  levEl.textContent = leverage > 0 ? `${leverage.toFixed(2)}倍` : '-';
  document.getElementById('pfLeverageDetail').textContent =
    leverage > 0 ? `想定元本: ¥${Math.round(totalNotional).toLocaleString()}` : '口座残高を入力してください';

  const pnlEl = document.getElementById('pfUnrealizedPnL');
  pnlEl.textContent = `¥${Math.round(totalUnrealizedPnL).toLocaleString()}`;
  pnlEl.className = `value ${totalUnrealizedPnL >= 0 ? '' : 'pf-negative'}`;

  const pnlRate = totalNotional > 0 ? (totalUnrealizedPnL / totalNotional * 100) : 0;
  document.getElementById('pfUnrealizedPnLRate').textContent = `${pnlRate >= 0 ? '+' : ''}${pnlRate.toFixed(1)}%`;
  document.getElementById('pfTotalSwapIncome').textContent = `¥${Math.round(totalSwapIncome).toLocaleString()}`;
  document.getElementById('pfMonthlySwapIncome').textContent = `今月: ¥${Math.round(monthlySwap).toLocaleString()}`;
}

function renderCurrencyPerformance() {
  const positions = DataStore.getPositions();
  const swapHistory = DataStore.getSwapHistory();
  const tbody = document.getElementById('currencyPerformanceBody');
  tbody.innerHTML = '';

  // 通貨別に集計
  const perfMap = {};
  positions.forEach(pos => {
    if (!perfMap[pos.currencyPair]) {
      perfMap[pos.currencyPair] = { name: pos.currencyPairName || pos.currencyPair, lots: 0, unrealizedPnL: 0, cumulativeSwap: 0, margin: 0 };
    }
    perfMap[pos.currencyPair].lots += pos.lots;
    perfMap[pos.currencyPair].unrealizedPnL += calculateUnrealizedPnL(pos);
    perfMap[pos.currencyPair].margin += pos.units * pos.entryRate * 0.04;
  });

  swapHistory.forEach(r => {
    // 保有中ポジションのスワップのみ集計
    const positionExists = positions.some(p => p.id === r.positionId);
    if (positionExists && perfMap[r.currencyPair]) {
      perfMap[r.currencyPair].cumulativeSwap += r.amount;
    }
  });

  Object.entries(perfMap).forEach(([pairId, perf]) => {
    const totalPnL = perf.unrealizedPnL + perf.cumulativeSwap;
    const pnlRate = perf.margin > 0 ? (totalPnL / perf.margin * 100) : 0;
    const pnlClass = totalPnL >= 0 ? 'swap-positive' : 'swap-negative';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${perf.name}</strong></td>
      <td>${perf.lots}</td>
      <td class="${perf.unrealizedPnL >= 0 ? 'swap-positive' : 'swap-negative'}">¥${Math.round(perf.unrealizedPnL).toLocaleString()}</td>
      <td>¥${Math.round(perf.cumulativeSwap).toLocaleString()}</td>
      <td class="${pnlClass}">¥${Math.round(totalPnL).toLocaleString()}</td>
      <td class="${pnlClass}">${pnlRate >= 0 ? '+' : ''}${pnlRate.toFixed(1)}%</td>
    `;
    tbody.appendChild(tr);
  });
}

// ---- 目標設定・達成率 ----
function saveGoal() {
  const type = document.getElementById('goalType').value;
  const amount = parseInt(document.getElementById('goalAmount').value);
  if (isNaN(amount) || amount <= 0) {
    showToast('有効な目標金額を入力してください', 'warning');
    return;
  }

  const now = new Date();
  const goal = {
    type,
    year: now.getFullYear(),
    month: type === 'monthly' ? now.getMonth() + 1 : null,
    targetAmount: amount,
  };

  DataStore.saveGoal(goal);
  showToast(`${type === 'monthly' ? '月次' : '年次'}目標を¥${amount.toLocaleString()}に設定しました`, 'success');
  renderGoalProgress();
}

function renderGoalProgress() {
  const goals = DataStore.getGoals();
  const swapHistory = DataStore.getSwapHistory();
  const now = new Date();

  // 最新の月次目標を探す
  let activeGoal = goals.find(g => g.type === 'monthly' && g.year === now.getFullYear() && g.month === now.getMonth() + 1);
  if (!activeGoal) {
    activeGoal = goals.find(g => g.type === 'yearly' && g.year === now.getFullYear());
  }

  const container = document.getElementById('goalProgressContainer');

  if (!activeGoal) {
    document.getElementById('pfGoalProgress').textContent = '未設定';
    document.getElementById('pfGoalDetail').textContent = '目標を設定してください';
    container.style.display = 'none';
    return;
  }

  // 期間内のスワップ収入を計算
  let dateFrom, dateTo;
  if (activeGoal.type === 'monthly') {
    dateFrom = `${activeGoal.year}-${String(activeGoal.month).padStart(2, '0')}-01`;
    const nextMonth = activeGoal.month === 12 ? 1 : activeGoal.month + 1;
    const nextYear = activeGoal.month === 12 ? activeGoal.year + 1 : activeGoal.year;
    dateTo = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`;
  } else {
    dateFrom = `${activeGoal.year}-01-01`;
    dateTo = `${activeGoal.year + 1}-01-01`;
  }

  const periodSwap = swapHistory
    .filter(r => r.date >= dateFrom && r.date < dateTo)
    .reduce((s, r) => s + r.amount, 0);

  const progress = Math.min(100, (periodSwap / activeGoal.targetAmount) * 100);

  document.getElementById('pfGoalProgress').textContent = `${progress.toFixed(1)}%`;
  document.getElementById('pfGoalDetail').textContent =
    `¥${Math.round(periodSwap).toLocaleString()} / ¥${activeGoal.targetAmount.toLocaleString()}`;

  container.style.display = 'block';
  document.getElementById('goalProgressFill').style.width = `${progress}%`;
  document.getElementById('goalProgressFill').className =
    `goal-progress-fill ${progress >= 100 ? 'goal-complete' : progress >= 50 ? 'goal-half' : ''}`;
  document.getElementById('goalProgressLabel').textContent =
    `${activeGoal.type === 'monthly' ? `${activeGoal.month}月` : `${activeGoal.year}年`}の目標: ¥${activeGoal.targetAmount.toLocaleString()}`;
}

// ---- スナップショット ----
function takePortfolioSnapshot() {
  const positions = DataStore.getPositions();
  if (positions.length === 0) return;

  const swapHistory = DataStore.getSwapHistory();
  const today = new Date().toISOString().split('T')[0];

  let totalValue = 0;
  let totalUnrealizedPnL = 0;
  const breakdown = {};

  positions.forEach(pos => {
    const pnl = calculateUnrealizedPnL(pos);
    const margin = pos.units * pos.entryRate * 0.04;
    const posSwap = swapHistory
      .filter(r => r.positionId === pos.id)
      .reduce((s, r) => s + r.amount, 0);

    totalUnrealizedPnL += pnl;
    totalValue += margin + pnl + posSwap;

    if (!breakdown[pos.currencyPair]) {
      breakdown[pos.currencyPair] = { value: 0, unrealizedPnL: 0, swapIncome: 0 };
    }
    breakdown[pos.currencyPair].value += margin + pnl + posSwap;
    breakdown[pos.currencyPair].unrealizedPnL += pnl;
    breakdown[pos.currencyPair].swapIncome += posSwap;
  });

  const totalSwapIncome = swapHistory.reduce((s, r) => s + r.amount, 0);

  DataStore.saveSnapshot({
    date: today,
    totalValue: Math.round(totalValue),
    unrealizedPnL: Math.round(totalUnrealizedPnL),
    totalSwapIncome: Math.round(totalSwapIncome),
    positionCount: positions.length,
    breakdown,
  });
}

// ---- 確定申告用CSV ----
function generateTaxReport(year) {
  const closedPositions = DataStore.getClosedPositions()
    .filter(p => p.exitDate && p.exitDate.startsWith(String(year)));
  const swapHistory = DataStore.getSwapHistory()
    .filter(r => r.date.startsWith(String(year)));

  if (closedPositions.length === 0 && swapHistory.length === 0) {
    showToast(`${year}年のデータがありません`, 'warning');
    return;
  }

  const BOM = '\uFEFF';
  let csv = BOM + '種別,通貨ペア,売買方向,取引数量（通貨）,エントリーレート,決済レート,実現損益（円）,スワップ収入（円）,合計損益（円）,エントリー日,決済日,保有日数\n';

  closedPositions.forEach(p => {
    const holdDays = Math.floor((new Date(p.exitDate) - new Date(p.entryDate)) / (1000 * 60 * 60 * 24));
    const total = p.realizedPnL + p.totalSwapEarned;
    csv += `決済,${p.currencyPairName || p.currencyPair},${p.direction === 'long' ? '買い' : '売り'},${p.units},${p.entryRate},${p.exitRate},${p.realizedPnL},${p.totalSwapEarned},${total},${p.entryDate},${p.exitDate},${holdDays}\n`;
  });

  // 通貨別スワップ集計
  const swapByPair = {};
  swapHistory.forEach(r => {
    if (!swapByPair[r.currencyPair]) swapByPair[r.currencyPair] = 0;
    swapByPair[r.currencyPair] += r.amount;
  });

  csv += '\n種別,通貨ペア,年間スワップ収入（円）\n';
  Object.entries(swapByPair).forEach(([pair, total]) => {
    csv += `スワップ集計,${pair},,,,,,${Math.round(total)},,,,\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `fx-tax-report-${year}.csv`;
  a.click();
  URL.revokeObjectURL(url);

  showToast(`${year}年の確定申告用CSVをダウンロードしました`, 'success');
}

// ---- データエクスポート / インポート ----
function exportPortfolioData() {
  const data = DataStore.exportAllData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `fx-portfolio-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('全データをエクスポートしました', 'success');
}

function importPortfolioData(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      DataStore.importAllData(data);
      showToast('データをインポートしました', 'success');
      renderPortfolio();
      if (typeof renderNotifications === 'function') renderNotifications();
    } catch (err) {
      showToast('インポートに失敗しました: ' + err.message, 'warning');
    }
  };
  reader.readAsText(file);
}

function updateStorageUsage() {
  const usage = DataStore.getStorageUsage();
  document.getElementById('storageUsage').textContent =
    `ストレージ使用量: ${usage.usedKB}KB / ${usage.maxMB}MB`;
}

// ---- トースト通知 ----
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// ---- DOMContentLoaded ----
document.addEventListener('DOMContentLoaded', initPortfolio);
