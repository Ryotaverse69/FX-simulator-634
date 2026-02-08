// ============================================================
// data-store.js — localStorage抽象化レイヤー
// ============================================================

const STORAGE_KEYS = {
  POSITIONS: 'fxswap_positions',
  CLOSED_POSITIONS: 'fxswap_closed_positions',
  SWAP_HISTORY: 'fxswap_swap_history',
  GOALS: 'fxswap_goals',
  PORTFOLIO_SNAPSHOTS: 'fxswap_portfolio_snapshots',
  NOTIFICATION_SETTINGS: 'fxswap_notification_settings',
  NOTIFICATION_HISTORY: 'fxswap_notification_history',
  SWAP_RATE_HISTORY: 'fxswap_swap_rate_history',
};

const DataStore = {
  // ---- 汎用 CRUD ----
  get(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      if (e.name === 'QuotaExceededError') {
        console.warn('localStorage容量超過。古いデータを削除してください。');
      }
      return false;
    }
  },

  remove(key) {
    localStorage.removeItem(key);
  },

  // ---- ID生成 ----
  generateId(prefix) {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  },

  // ---- ポジション ----
  getPositions() {
    return this.get(STORAGE_KEYS.POSITIONS) || [];
  },

  savePosition(position) {
    const positions = this.getPositions();
    const existing = positions.findIndex(p => p.id === position.id);
    if (existing >= 0) {
      positions[existing] = { ...positions[existing], ...position, updatedAt: new Date().toISOString() };
    } else {
      position.id = position.id || this.generateId('pos');
      position.createdAt = new Date().toISOString();
      position.updatedAt = position.createdAt;
      positions.push(position);
    }
    this.set(STORAGE_KEYS.POSITIONS, positions);
    return position;
  },

  updatePosition(id, updates) {
    const positions = this.getPositions();
    const idx = positions.findIndex(p => p.id === id);
    if (idx >= 0) {
      positions[idx] = { ...positions[idx], ...updates, updatedAt: new Date().toISOString() };
      this.set(STORAGE_KEYS.POSITIONS, positions);
      return positions[idx];
    }
    return null;
  },

  deletePosition(id) {
    const positions = this.getPositions().filter(p => p.id !== id);
    this.set(STORAGE_KEYS.POSITIONS, positions);
    // 関連するスワップ履歴も削除
    const history = this.getSwapHistory().filter(r => r.positionId !== id);
    this.set(STORAGE_KEYS.SWAP_HISTORY, history);
  },

  closePosition(id, exitRate, exitDate) {
    const positions = this.getPositions();
    const idx = positions.findIndex(p => p.id === id);
    if (idx < 0) return null;

    const pos = positions[idx];
    const dirMul = pos.direction === 'long' ? 1 : -1;
    const realizedPnL = (exitRate - pos.entryRate) * pos.units * dirMul;

    // スワップ累計を算出
    const swapRecords = this.getSwapHistory().filter(r => r.positionId === id);
    const totalSwapEarned = swapRecords.reduce((s, r) => s + r.amount, 0);

    const closedPos = {
      ...pos,
      exitRate,
      exitDate,
      realizedPnL: Math.round(realizedPnL),
      totalSwapEarned: Math.round(totalSwapEarned),
      closedAt: new Date().toISOString(),
    };

    // 保有から削除
    positions.splice(idx, 1);
    this.set(STORAGE_KEYS.POSITIONS, positions);

    // 決済済みに追加
    const closed = this.getClosedPositions();
    closed.push(closedPos);
    this.set(STORAGE_KEYS.CLOSED_POSITIONS, closed);

    return closedPos;
  },

  getClosedPositions() {
    return this.get(STORAGE_KEYS.CLOSED_POSITIONS) || [];
  },

  // ---- スワップ履歴 ----
  getSwapHistory(filters) {
    let history = this.get(STORAGE_KEYS.SWAP_HISTORY) || [];
    if (filters) {
      if (filters.positionId) history = history.filter(r => r.positionId === filters.positionId);
      if (filters.currencyPair) history = history.filter(r => r.currencyPair === filters.currencyPair);
      if (filters.dateFrom) history = history.filter(r => r.date >= filters.dateFrom);
      if (filters.dateTo) history = history.filter(r => r.date <= filters.dateTo);
    }
    return history;
  },

  addSwapRecord(record) {
    const history = this.getSwapHistory();
    record.id = record.id || this.generateId('swap');
    history.push(record);
    this.set(STORAGE_KEYS.SWAP_HISTORY, history);
    return record;
  },

  bulkAddSwapRecords(records) {
    const history = this.getSwapHistory();
    records.forEach(r => {
      r.id = r.id || this.generateId('swap');
      history.push(r);
    });
    this.set(STORAGE_KEYS.SWAP_HISTORY, history);
  },

  // ---- 目標 ----
  getGoals() {
    return this.get(STORAGE_KEYS.GOALS) || [];
  },

  saveGoal(goal) {
    const goals = this.getGoals();
    goal.id = goal.id || this.generateId('goal');
    goal.createdAt = goal.createdAt || new Date().toISOString();
    // 同じ種別・年・月の既存目標を上書き
    const idx = goals.findIndex(g => g.type === goal.type && g.year === goal.year && g.month === goal.month);
    if (idx >= 0) {
      goals[idx] = goal;
    } else {
      goals.push(goal);
    }
    this.set(STORAGE_KEYS.GOALS, goals);
    return goal;
  },

  // ---- ポートフォリオスナップショット ----
  getSnapshots(dateRange) {
    let snapshots = this.get(STORAGE_KEYS.PORTFOLIO_SNAPSHOTS) || [];
    if (dateRange) {
      if (dateRange.from) snapshots = snapshots.filter(s => s.date >= dateRange.from);
      if (dateRange.to) snapshots = snapshots.filter(s => s.date <= dateRange.to);
    }
    return snapshots;
  },

  saveSnapshot(snapshot) {
    const snapshots = this.getSnapshots();
    // 同じ日付のスナップショットは上書き
    const idx = snapshots.findIndex(s => s.date === snapshot.date);
    if (idx >= 0) {
      snapshots[idx] = snapshot;
    } else {
      snapshots.push(snapshot);
    }
    // 日付順でソート
    snapshots.sort((a, b) => a.date.localeCompare(b.date));
    this.set(STORAGE_KEYS.PORTFOLIO_SNAPSHOTS, snapshots);
  },

  // ---- 通知設定 ----
  getNotificationSettings() {
    return this.get(STORAGE_KEYS.NOTIFICATION_SETTINGS) || {
      enabled: true,
      browserNotifications: false,
      thresholds: [],
      dailySummaryEnabled: true,
      lastChecked: null,
    };
  },

  saveNotificationSettings(settings) {
    this.set(STORAGE_KEYS.NOTIFICATION_SETTINGS, settings);
  },

  // ---- 通知履歴 ----
  getNotificationHistory() {
    return this.get(STORAGE_KEYS.NOTIFICATION_HISTORY) || [];
  },

  addNotification(notification) {
    const history = this.getNotificationHistory();
    notification.id = notification.id || this.generateId('notif');
    notification.timestamp = notification.timestamp || new Date().toISOString();
    history.unshift(notification); // 新しい順
    // 最大500件に制限
    if (history.length > 500) history.length = 500;
    this.set(STORAGE_KEYS.NOTIFICATION_HISTORY, history);
  },

  clearNotificationHistory() {
    this.set(STORAGE_KEYS.NOTIFICATION_HISTORY, []);
  },

  // ---- スワップレート履歴 ----
  saveSwapRates(date, broker, rates) {
    const history = this.get(STORAGE_KEYS.SWAP_RATE_HISTORY) || [];
    const entry = { date, broker, rates };
    const idx = history.findIndex(h => h.date === date && h.broker === broker);
    if (idx >= 0) {
      history[idx] = entry;
    } else {
      history.push(entry);
    }
    // 直近365日分のみ保持
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 365);
    const cutoffStr = cutoff.toISOString().split('T')[0];
    const pruned = history.filter(h => h.date >= cutoffStr);
    this.set(STORAGE_KEYS.SWAP_RATE_HISTORY, pruned);
  },

  getSwapRateHistory(days) {
    const history = this.get(STORAGE_KEYS.SWAP_RATE_HISTORY) || [];
    if (!days) return history;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const cutoffStr = cutoff.toISOString().split('T')[0];
    return history.filter(h => h.date >= cutoffStr);
  },

  // ---- エクスポート / インポート ----
  exportAllData() {
    const data = { version: '1.0', exportedAt: new Date().toISOString() };
    Object.entries(STORAGE_KEYS).forEach(([key, storageKey]) => {
      data[key] = this.get(storageKey);
    });
    return data;
  },

  importAllData(json) {
    if (!json || json.version !== '1.0') {
      throw new Error('無効なデータ形式です');
    }
    Object.entries(STORAGE_KEYS).forEach(([key, storageKey]) => {
      if (json[key] !== undefined && json[key] !== null) {
        this.set(storageKey, json[key]);
      }
    });
  },

  // ---- ストレージ使用量 ----
  getStorageUsage() {
    let total = 0;
    Object.values(STORAGE_KEYS).forEach(key => {
      const item = localStorage.getItem(key);
      if (item) total += item.length * 2; // UTF-16 = 2 bytes per char
    });
    return {
      usedBytes: total,
      usedKB: (total / 1024).toFixed(1),
      usedMB: (total / (1024 * 1024)).toFixed(2),
      maxMB: 5,
    };
  },
};
