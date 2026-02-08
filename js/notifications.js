// ============================================================
// notifications.js — スワップ通知システム
// ============================================================

function initNotifications() {
  populateNotificationDropdowns();
  setupNotificationEventListeners();
  renderNotifications();
  restoreBrowserNotificationState();
}

function populateNotificationDropdowns() {
  const select = document.getElementById('alertCurrencyPair');
  select.innerHTML = '';
  baseCurrencyPairs.forEach(pair => {
    const opt = document.createElement('option');
    opt.value = pair.id;
    opt.textContent = `${pair.name}（${pair.fullName}）`;
    select.appendChild(opt);
  });
}

function setupNotificationEventListeners() {
  document.getElementById('fetchSwapRatesBtn').addEventListener('click', fetchSwapRates);
  document.getElementById('simulateChangeBtn').addEventListener('click', simulateSwapRateChange);
  document.getElementById('addAlertBtn').addEventListener('click', addAlert);
  document.getElementById('clearNotificationHistoryBtn').addEventListener('click', clearNotificationHistory);
  document.getElementById('enableBrowserNotifications').addEventListener('change', toggleBrowserNotifications);
}

function restoreBrowserNotificationState() {
  const settings = DataStore.getNotificationSettings();
  const checkbox = document.getElementById('enableBrowserNotifications');
  checkbox.checked = settings.browserNotifications && Notification.permission === 'granted';
}

// ---- スワップレート取得 ----
async function getSwapRateData(broker) {
  // 現在はbrokerSwapDataグローバルから読み取り
  // 将来はここを fetch('/api/swap-rates/' + broker) に差し替え
  const data = brokerSwapData[broker];
  if (!data) return [];
  return Object.entries(data).map(([pair, info]) => ({
    currencyPair: pair,
    swapBuy: info.swapBuy,
    swapSell: info.swapSell,
    unit: info.unit,
  }));
}

async function fetchSwapRates() {
  const today = new Date().toISOString().split('T')[0];
  const brokers = Object.keys(brokerSwapData);
  const previousHistory = DataStore.getSwapRateHistory(30);
  const comparisons = [];

  for (const broker of brokers) {
    const rates = await getSwapRateData(broker);
    const ratesMap = {};
    rates.forEach(r => {
      ratesMap[r.currencyPair] = { swapBuy: r.swapBuy, swapSell: r.swapSell };
    });

    // 前回データを探す
    const prevEntry = previousHistory
      .filter(h => h.broker === broker && h.date !== today)
      .sort((a, b) => b.date.localeCompare(a.date))[0];

    rates.forEach(r => {
      const prev = prevEntry?.rates?.[r.currencyPair];
      comparisons.push({
        currencyPair: r.currencyPair,
        broker,
        brokerName: brokerInfo[broker]?.name || broker,
        prevBuy: prev ? prev.swapBuy : null,
        currentBuy: r.swapBuy,
        changeBuy: prev ? r.swapBuy - prev.swapBuy : null,
        prevSell: prev ? prev.swapSell : null,
        currentSell: r.swapSell,
        changeSell: prev ? r.swapSell - prev.swapSell : null,
      });
    });

    // 保存
    DataStore.saveSwapRates(today, broker, ratesMap);
  }

  renderSwapSummary(comparisons);
  checkThresholds();

  // 更新日時を表示
  document.getElementById('swapLastUpdated').textContent =
    `最終更新: ${new Date().toLocaleString('ja-JP')}`;

  const settings = DataStore.getNotificationSettings();
  settings.lastChecked = new Date().toISOString();
  DataStore.saveNotificationSettings(settings);
}

// ---- デモ用: スワップレート変動シミュレーション ----
function simulateSwapRateChange() {
  const brokers = Object.keys(brokerSwapData);
  brokers.forEach(broker => {
    Object.keys(brokerSwapData[broker]).forEach(pair => {
      const data = brokerSwapData[broker][pair];
      const change = (Math.random() - 0.4) * 6; // -2.4 〜 +3.6
      data.swapBuy = Math.round((data.swapBuy + change) * 10) / 10;
      data.swapSell = Math.round((data.swapSell - change) * 10) / 10;
    });
  });
  showToast('スワップレートにランダム変動を適用しました', 'info');
  fetchSwapRates();
}

// ---- サマリー表示 ----
function renderSwapSummary(comparisons) {
  const tbody = document.getElementById('swapSummaryBody');
  tbody.innerHTML = '';

  comparisons.forEach(c => {
    const tr = document.createElement('tr');
    const pairName = (baseCurrencyPairs.find(p => p.id === c.currencyPair)?.name) || c.currencyPair;

    tr.innerHTML = `
      <td><strong>${pairName}</strong></td>
      <td>${c.brokerName}</td>
      <td>${c.prevBuy !== null ? c.prevBuy : '-'}</td>
      <td>${c.currentBuy}</td>
      <td class="${changeClass(c.changeBuy)}">${formatChange(c.changeBuy)}</td>
      <td>${c.prevSell !== null ? c.prevSell : '-'}</td>
      <td>${c.currentSell}</td>
      <td class="${changeClass(c.changeSell)}">${formatChange(c.changeSell)}</td>
    `;
    tbody.appendChild(tr);
  });
}

function changeClass(val) {
  if (val === null) return 'change-neutral';
  if (val > 0) return 'change-positive';
  if (val < 0) return 'change-negative';
  return 'change-neutral';
}

function formatChange(val) {
  if (val === null) return '-';
  const sign = val > 0 ? '+' : '';
  return `${sign}${val.toFixed(1)}`;
}

// ---- アラート管理 ----
function addAlert() {
  const pair = document.getElementById('alertCurrencyPair').value;
  const broker = document.getElementById('alertBroker').value;
  const direction = document.getElementById('alertDirection').value;
  const value = parseFloat(document.getElementById('alertValue').value);

  if (isNaN(value)) {
    showToast('有効な閾値を入力してください', 'warning');
    return;
  }

  const settings = DataStore.getNotificationSettings();
  settings.thresholds.push({
    id: DataStore.generateId('alert'),
    currencyPair: pair,
    broker,
    direction,
    value,
    enabled: true,
  });
  DataStore.saveNotificationSettings(settings);

  const pairName = baseCurrencyPairs.find(p => p.id === pair)?.name || pair;
  showToast(`${pairName} のアラートを追加しました`, 'success');
  renderAlertThresholds();
}

function removeAlert(alertId) {
  const settings = DataStore.getNotificationSettings();
  settings.thresholds = settings.thresholds.filter(t => t.id !== alertId);
  DataStore.saveNotificationSettings(settings);
  renderAlertThresholds();
}

function toggleAlert(alertId) {
  const settings = DataStore.getNotificationSettings();
  const alert = settings.thresholds.find(t => t.id === alertId);
  if (alert) {
    alert.enabled = !alert.enabled;
    DataStore.saveNotificationSettings(settings);
    renderAlertThresholds();
  }
}

function renderAlertThresholds() {
  const settings = DataStore.getNotificationSettings();
  const thresholds = settings.thresholds;
  const tbody = document.getElementById('alertThresholdsBody');
  tbody.innerHTML = '';

  document.getElementById('noAlertsMsg').style.display = thresholds.length > 0 ? 'none' : 'block';
  document.getElementById('alertThresholdsWrapper').style.display = thresholds.length > 0 ? '' : 'none';

  thresholds.forEach(t => {
    const pairName = baseCurrencyPairs.find(p => p.id === t.currencyPair)?.name || t.currencyPair;
    const brokerName = brokerInfo[t.broker]?.name || t.broker;
    const condLabel = t.direction === 'below' ? '下回ったら' : '上回ったら';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><input type="checkbox" ${t.enabled ? 'checked' : ''} onchange="toggleAlert('${t.id}')"></td>
      <td>${pairName}</td>
      <td>${brokerName}</td>
      <td>${condLabel}</td>
      <td>¥${t.value}</td>
      <td><button class="action-btn action-btn-delete" onclick="removeAlert('${t.id}')">削除</button></td>
    `;
    tbody.appendChild(tr);
  });
}

// ---- 閾値チェック ----
function checkThresholds() {
  const settings = DataStore.getNotificationSettings();
  const triggered = [];

  settings.thresholds.forEach(t => {
    if (!t.enabled) return;
    const swapData = brokerSwapData[t.broker]?.[t.currencyPair];
    if (!swapData) return;

    const currentSwap = swapData.swapBuy; // 買いスワップで判定

    if (t.direction === 'below' && currentSwap < t.value) {
      triggered.push({ ...t, currentSwap });
    } else if (t.direction === 'above' && currentSwap > t.value) {
      triggered.push({ ...t, currentSwap });
    }
  });

  if (triggered.length > 0) {
    fireAlerts(triggered);
  }
}

function fireAlerts(triggeredAlerts) {
  triggeredAlerts.forEach(alert => {
    const pairName = baseCurrencyPairs.find(p => p.id === alert.currencyPair)?.name || alert.currencyPair;
    const condText = alert.direction === 'below' ? '下回りました' : '上回りました';
    const message = `${pairName} のスワップが閾値¥${alert.value}を${condText}（現在: ¥${alert.currentSwap}）`;

    // 通知履歴に記録
    DataStore.addNotification({
      type: 'threshold',
      currencyPair: alert.currencyPair,
      broker: alert.broker,
      message,
    });

    // ブラウザ通知
    const settings = DataStore.getNotificationSettings();
    if (settings.browserNotifications && Notification.permission === 'granted') {
      sendBrowserNotification('FXスワップ通知', message);
    }

    // アプリ内トースト
    showToast(message, 'warning');
  });

  renderNotificationHistory();
}

// ---- ブラウザ通知 ----
async function toggleBrowserNotifications(e) {
  const settings = DataStore.getNotificationSettings();
  if (e.target.checked) {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      settings.browserNotifications = true;
      showToast('ブラウザ通知を有効にしました', 'success');
    } else {
      e.target.checked = false;
      settings.browserNotifications = false;
      showToast('通知が拒否されました。ブラウザの設定を確認してください', 'warning');
    }
  } else {
    settings.browserNotifications = false;
  }
  DataStore.saveNotificationSettings(settings);
}

function sendBrowserNotification(title, body) {
  if (Notification.permission !== 'granted') return;
  new Notification(title, {
    body,
    icon: '📊',
    tag: 'fxswap-' + Date.now(),
  });
}

// ---- 通知履歴 ----
function renderNotificationHistory() {
  const history = DataStore.getNotificationHistory();
  const tbody = document.getElementById('notificationHistoryBody');
  tbody.innerHTML = '';

  document.getElementById('noNotificationsMsg').style.display = history.length > 0 ? 'none' : 'block';
  document.getElementById('notificationHistoryWrapper').style.display = history.length > 0 ? '' : 'none';

  history.slice(0, 100).forEach(n => {
    const pairName = baseCurrencyPairs.find(p => p.id === n.currencyPair)?.name || n.currencyPair || '-';
    const date = new Date(n.timestamp).toLocaleString('ja-JP');
    const typeLabel = n.type === 'threshold' ? 'アラート' : n.type === 'change' ? '変動' : 'その他';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${date}</td>
      <td>${typeLabel}</td>
      <td>${pairName}</td>
      <td>${n.message}</td>
    `;
    tbody.appendChild(tr);
  });
}

function clearNotificationHistory() {
  if (!confirm('通知履歴をすべて削除しますか？')) return;
  DataStore.clearNotificationHistory();
  showToast('通知履歴をクリアしました', 'info');
  renderNotificationHistory();
}

// ---- レンダリング統合 ----
function renderNotifications() {
  renderAlertThresholds();
  renderNotificationHistory();
}

// ---- DOMContentLoaded ----
document.addEventListener('DOMContentLoaded', initNotifications);
