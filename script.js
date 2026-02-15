// シード付き疑似乱数生成器（Mulberry32）
// 固定シードを使うことで、最適化結果を再現可能にする
class SeededRandom {
  constructor(seed = 12345) {
    this.seed = seed;
  }

  // 0以上1未満の疑似乱数を生成
  random() {
    let t = this.seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }

  // min以上max未満の整数を生成
  randomInt(min, max) {
    return Math.floor(this.random() * (max - min)) + min;
  }
}

// グローバルな疑似乱数生成器インスタンス
let rng = new SeededRandom(12345);

// 各証券会社の情報
const brokerInfo = {
  gmo: {
    name: 'GMOクリック証券',
    subtitle: 'GMOクリック証券（FXネオ）対応',
    swapUrl: 'https://www.click-sec.com/corp/guide/fxneo/swplog/',
    affiliateUrl: '', // A8.net等で取得後に設定
    features: ['業界最小スプレッド', '高機能チャート', 'スワップ振替可能'],
    recommended: '低コスト重視の方に',
    losscutRate: 50,
    marginCallRate: 100,
    // 通貨ペア別建玉上限（通貨単位）
    maxPositions: {
      TRY_JPY: 1000000, MXN_JPY: 3000000, ZAR_JPY: 3000000,
      HUF_JPY: 10000000, CZK_JPY: 3000000,
      USD_JPY: 10000000, EUR_JPY: 10000000, CHF_JPY: 10000000
    }
  },
  minnano: {
    name: 'みんなのFX',
    subtitle: 'みんなのFX（トレイダーズ証券）対応',
    swapUrl: 'https://min-fx.jp/market/swap/',
    affiliateUrl: '', // A8.net等で取得後に設定
    features: ['高スワップポイント', '1,000通貨取引OK', 'スワップ途中受取可'],
    recommended: 'スワップ投資に最適',
    losscutRate: 100,
    marginCallRate: 100,
    maxPositions: {
      TRY_JPY: 10000000, MXN_JPY: 30000000, ZAR_JPY: 30000000,
      HUF_JPY: 300000000, CZK_JPY: 10000000,
      USD_JPY: 10000000, EUR_JPY: 10000000, CHF_JPY: 10000000
    }
  },
  lightfx: {
    name: 'LIGHT FX',
    subtitle: 'LIGHT FX（トレイダーズ証券）対応',
    swapUrl: 'https://lightfx.jp/service/swappoint/',
    affiliateUrl: '', // A8.net等で取得後に設定
    features: ['業界最高水準スワップ', '約定力99.9%', 'LIGHT ペア対応'],
    recommended: '高金利通貨に強い',
    losscutRate: 100,
    marginCallRate: 100,
    maxPositions: {
      TRY_JPY: 30000000, MXN_JPY: 30000000, ZAR_JPY: 30000000,
      HUF_JPY: 300000000, CZK_JPY: 10000000,
      USD_JPY: 5000000, EUR_JPY: 10000000, CHF_JPY: 10000000
    }
  },
  gaikaex: {
    name: 'GMO外貨ex',
    subtitle: 'GMO外貨ex（GMO外貨）対応',
    swapUrl: 'https://www.gaikaex.com/gaikaex/spread-swap/',
    affiliateUrl: '',
    features: ['1,000通貨取引OK', '豊富な注文方法', 'バイナリーオプション対応'],
    recommended: '少額取引から始めたい方に',
    losscutRate: 50,
    marginCallRate: 100,
    // 通貨ペア個別上限なし（全体で4000万通貨）、HUF/CZK取扱なし
    maxPositions: {
      TRY_JPY: 40000000, MXN_JPY: 40000000, ZAR_JPY: 40000000,
      USD_JPY: 40000000, EUR_JPY: 40000000, CHF_JPY: 40000000
    }
  },
  dmm: {
    name: 'DMM FX',
    subtitle: 'DMM FX（DMM.com証券）対応',
    swapUrl: 'https://fx.dmm.com/fx/service/swap/',
    affiliateUrl: '',
    features: ['口座数国内No.1', '24時間サポート', '取引ツール充実'],
    recommended: '初心者・サポート重視の方に',
    losscutRate: 50,
    marginCallRate: 100,
    // HUF/CZK取扱なし
    maxPositions: {
      TRY_JPY: 100000000, MXN_JPY: 100000000, ZAR_JPY: 100000000,
      USD_JPY: 50000000, EUR_JPY: 30000000, CHF_JPY: 10000000
    }
  },
  sbi: {
    name: 'SBI FXトレード',
    subtitle: 'SBI FXトレード対応',
    swapUrl: 'https://www.sbifxt.co.jp/service/swap.html',
    affiliateUrl: '',
    features: ['1通貨取引OK', 'SBIグループの信頼性', '積立FX対応'],
    recommended: '超少額・積立投資に',
    losscutRate: 50,
    marginCallRate: 100,
    // 通貨ペア別上限なし・総額無制限、HUF/CZK取扱なし
    maxPositions: {
      TRY_JPY: Infinity, MXN_JPY: Infinity, ZAR_JPY: Infinity,
      USD_JPY: Infinity, EUR_JPY: Infinity, CHF_JPY: Infinity
    }
  },
  central: {
    name: 'セントラル短資FX',
    subtitle: 'セントラル短資FX対応',
    swapUrl: 'https://www.central-tanshifx.com/market/swappoint/',
    affiliateUrl: '',
    features: ['100年の歴史', '高金利通貨に強い', 'パーソナルレコード'],
    recommended: '高金利通貨スワップ派に',
    losscutRate: 50,
    marginCallRate: 125,
    // CZK取扱なし
    maxPositions: {
      TRY_JPY: 100000000, MXN_JPY: 1000000000, ZAR_JPY: 1000000000,
      HUF_JPY: 1000000000,
      USD_JPY: 50000000, EUR_JPY: 50000000, CHF_JPY: 50000000
    }
  }
};

// 各証券会社のスワップポイントデータ（フォールバック値 - swap-data.jsonで上書きされる）
// 全通貨ペア1万通貨（10000）単位に統一。ソース: zai.diamond.jp 2026年1月実績平均
let brokerSwapData = {
  gmo: {
    TRY_JPY: { swapBuy: 28.3, swapSell: -28.3, unit: 10000 },
    MXN_JPY: { swapBuy: 14.6, swapSell: -14.6, unit: 10000 },
    ZAR_JPY: { swapBuy: 12.7, swapSell: -12.7, unit: 10000 },
    HUF_JPY: { swapBuy: 2, swapSell: -2, unit: 10000 },
    CZK_JPY: { swapBuy: 10, swapSell: -10, unit: 10000 },
    USD_JPY: { swapBuy: 141, swapSell: -141, unit: 10000 },
    EUR_JPY: { swapBuy: 107, swapSell: -107, unit: 10000 },
    CHF_JPY: { swapBuy: -12, swapSell: 12, unit: 10000 }
  },
  minnano: {
    TRY_JPY: { swapBuy: 25.2, swapSell: -25.2, unit: 10000 },
    MXN_JPY: { swapBuy: 12.7, swapSell: -12.7, unit: 10000 },
    ZAR_JPY: { swapBuy: 11.9, swapSell: -11.9, unit: 10000 },
    HUF_JPY: { swapBuy: 0.5, swapSell: -0.5, unit: 10000 },
    CZK_JPY: { swapBuy: 6, swapSell: -6, unit: 10000 },
    USD_JPY: { swapBuy: 135, swapSell: -135, unit: 10000 },
    EUR_JPY: { swapBuy: 86, swapSell: -86, unit: 10000 },
    CHF_JPY: { swapBuy: -47, swapSell: 47, unit: 10000 }
  },
  lightfx: {
    TRY_JPY: { swapBuy: 25.2, swapSell: -25.2, unit: 10000 },
    MXN_JPY: { swapBuy: 12.7, swapSell: -12.7, unit: 10000 },
    ZAR_JPY: { swapBuy: 11.9, swapSell: -11.9, unit: 10000 },
    HUF_JPY: { swapBuy: 0.5, swapSell: -0.5, unit: 10000 },
    CZK_JPY: { swapBuy: 6, swapSell: -6, unit: 10000 },
    USD_JPY: { swapBuy: 135, swapSell: -135, unit: 10000 },
    EUR_JPY: { swapBuy: 86, swapSell: -86, unit: 10000 },
    CHF_JPY: { swapBuy: -47, swapSell: 47, unit: 10000 }
  },
  gaikaex: {
    // GMO外貨ex — HUF_JPY, CZK_JPY は取扱なし
    TRY_JPY: { swapBuy: 27.3, swapSell: -27.3, unit: 10000 },
    MXN_JPY: { swapBuy: 14.7, swapSell: -14.7, unit: 10000 },
    ZAR_JPY: { swapBuy: 12.8, swapSell: -12.8, unit: 10000 },
    HUF_JPY: null,
    USD_JPY: { swapBuy: 142, swapSell: -142, unit: 10000 },
    EUR_JPY: { swapBuy: 103, swapSell: -103, unit: 10000 },
    CHF_JPY: { swapBuy: -5, swapSell: 5, unit: 10000 },
    CZK_JPY: null
  },
  dmm: {
    // DMM FX — HUF_JPY, CZK_JPY は取扱なし
    TRY_JPY: { swapBuy: 27, swapSell: -30, unit: 10000 },
    MXN_JPY: { swapBuy: 13, swapSell: -16, unit: 10000 },
    ZAR_JPY: { swapBuy: 12, swapSell: -15, unit: 10000 },
    HUF_JPY: null,
    USD_JPY: { swapBuy: 135, swapSell: -138, unit: 10000 },
    EUR_JPY: { swapBuy: 107, swapSell: -110, unit: 10000 },
    CHF_JPY: { swapBuy: -9, swapSell: 6, unit: 10000 },
    CZK_JPY: null
  },
  sbi: {
    // SBI FXトレード — HUF_JPY, CZK_JPY は取扱なし
    TRY_JPY: { swapBuy: 25.1, swapSell: -23, unit: 10000 },
    MXN_JPY: { swapBuy: 12.5, swapSell: -14, unit: 10000 },
    ZAR_JPY: { swapBuy: 11.2, swapSell: -9.6, unit: 10000 },
    HUF_JPY: null,
    USD_JPY: { swapBuy: 131, swapSell: -129, unit: 10000 },
    EUR_JPY: { swapBuy: 99, swapSell: -100, unit: 10000 },
    CHF_JPY: { swapBuy: -34, swapSell: 24, unit: 10000 },
    CZK_JPY: null
  },
  central: {
    // セントラル短資FX — CZK_JPY は取扱なし
    TRY_JPY: { swapBuy: 28.7, swapSell: -28.7, unit: 10000 },
    MXN_JPY: { swapBuy: 13.1, swapSell: -15, unit: 10000 },
    ZAR_JPY: { swapBuy: 13.7, swapSell: -18, unit: 10000 },
    HUF_JPY: { swapBuy: 0.74, swapSell: -0.74, unit: 10000 },
    USD_JPY: { swapBuy: 150, swapSell: -250, unit: 10000 },
    EUR_JPY: { swapBuy: 87, swapSell: -92, unit: 10000 },
    CHF_JPY: { swapBuy: -36, swapSell: 26, unit: 10000 },
    CZK_JPY: null
  }
};

// 複利シミュレーター用の通貨ペア定義
// annualRateChange: 年間レート変動率(%)。マイナス=下落。スワップは実額、レート変動はシミュで月次反映。
const COMPOUND_CURRENCIES = [
  { id: 'HUF_JPY', name: 'HUF/JPY', label: 'ハンガリーフォリント',
    defaultRate: 0.43, defaultSwap: 2, defaultSpread: 0.5, defaultDailyCrashRate: 5, defaultCrashRate: 15, historicalWorstDailyCrashRate: 7, historicalWorstCrashRate: 20, defaultRatio: 70, defaultEnabled: true, annualRateChange: -3 },
  { id: 'TRY_JPY', name: 'TRY/JPY', label: 'トルコリラ',
    defaultRate: 3.6, defaultSwap: 28.3, defaultSpread: 1.7, defaultDailyCrashRate: 18, defaultCrashRate: 35, historicalWorstDailyCrashRate: 20, historicalWorstCrashRate: 50, defaultRatio: 30, defaultEnabled: true, annualRateChange: -15 },
  { id: 'MXN_JPY', name: 'MXN/JPY', label: 'メキシコペソ',
    defaultRate: 8.7, defaultSwap: 14.6, defaultSpread: 0.2, defaultDailyCrashRate: 7, defaultCrashRate: 28, historicalWorstDailyCrashRate: 10, historicalWorstCrashRate: 35, defaultRatio: 0, defaultEnabled: false, annualRateChange: -4 },
  { id: 'ZAR_JPY', name: 'ZAR/JPY', label: '南アフリカランド',
    defaultRate: 9.4, defaultSwap: 12.7, defaultSpread: 0.9, defaultDailyCrashRate: 9, defaultCrashRate: 25, historicalWorstDailyCrashRate: 12, historicalWorstCrashRate: 35, defaultRatio: 0, defaultEnabled: false, annualRateChange: -6 },
  { id: 'CZK_JPY', name: 'CZK/JPY', label: 'チェココルナ',
    defaultRate: 7.0, defaultSwap: 10, defaultSpread: 0.1, defaultDailyCrashRate: 4, defaultCrashRate: 12, historicalWorstDailyCrashRate: 6, historicalWorstCrashRate: 18, defaultRatio: 0, defaultEnabled: false, annualRateChange: -1 }
];

// 基本通貨ペアデータ（レート、ボラティリティ、期待下落率など）
// ボラティリティは過去1年の日次データに基づく年率換算値
// 期待下落率はsujinikublogを参考に設定（TRYは対ドル年率18%下落傾向）
// maxPosition: 最大保有数量（通貨）- GMOクリック証券の上限に準拠
const baseCurrencyPairs = [
  {
    id: 'TRY_JPY',
    name: 'TRY/JPY',
    fullName: 'トルコリラ/円',
    rate: 3.676, // エクセル実データ期間（2024/12/20-2025/12/19）の平均レート
    volatility: 11.08, // エクセル実データより（2024/12/20-2025/12/19）
    expectedDepreciation: 18, // 対ドル年率18%下落を考慮
    marginRate: 0.04,
    defaultEnabled: true,
    defaultPosition: 'long',
    maxPosition: 1000000, // 100万通貨（100lot）
    spread: 1.7, // GMOクリック証券のスプレッド（銭）
    maxDailyDrop: 18, // 1日最大下落率(%) - 2018年8月トルコショック
    maxCrashDrop: 35, // 暴落期間最大下落率(%) - 2018年8月 ~2週間で32%
    historicalWorstDailyDrop: 20, // 1日最悪想定(%)
    historicalWorstCrashDrop: 50 // 最悪想定(%) - 2021年12月 ~6週間で46%
  },
  {
    id: 'MXN_JPY',
    name: 'MXN/JPY',
    fullName: 'メキシコペソ/円',
    rate: 8.748, // エクセル実データ期間（2024/12/20-2025/12/19）の平均レート
    volatility: 13.20, // エクセル実データより
    expectedDepreciation: 5,
    marginRate: 0.04,
    defaultEnabled: true,
    defaultPosition: 'long',
    maxPosition: 3000000, // 300万通貨（30lot）
    spread: 0.2, // GMOクリック証券のスプレッド（銭）
    maxDailyDrop: 7, // 1日最大下落率(%) - 2020年3月COVID
    maxCrashDrop: 28, // 暴落期間最大下落率(%) - 2020年3月COVID ~4週間で28%
    historicalWorstDailyDrop: 10, // 1日最悪想定(%)
    historicalWorstCrashDrop: 35 // 最悪想定(%) - 極端シナリオ
  },
  {
    id: 'ZAR_JPY',
    name: 'ZAR/JPY',
    fullName: '南アフリカランド/円',
    rate: 9.398, // エクセル実データ期間（2024/12/20-2025/12/19）の平均レート
    volatility: 12.68, // エクセル実データより
    expectedDepreciation: 8,
    marginRate: 0.04,
    defaultEnabled: true,
    defaultPosition: 'long',
    maxPosition: 3000000, // 300万通貨（30lot）
    spread: 0.9, // GMOクリック証券のスプレッド（銭）
    maxDailyDrop: 9, // 1日最大下落率(%) - 2020年3月COVID
    maxCrashDrop: 25, // 暴落期間最大下落率(%) - 2020年3月COVID ~6週間で25%
    historicalWorstDailyDrop: 12, // 1日最悪想定(%)
    historicalWorstCrashDrop: 35 // 最悪想定(%) - 政治不安+グローバル危機
  },
  {
    id: 'HUF_JPY',
    name: 'HUF/JPY',
    fullName: 'ハンガリーフォリント/円',
    rate: 0.475, // エクセル実データ期間（2024/12/20-2025/12/19）の平均レート
    volatility: 9.03, // エクセル実データより
    expectedDepreciation: 5, // 過去1年で約5%下落
    marginRate: 0.04,
    defaultEnabled: true,
    defaultPosition: 'long',
    maxPosition: 10000000, // 1000万通貨（100lot）
    spread: 0.5, // GMOクリック証券のスプレッド（銭）
    maxDailyDrop: 5, // 1日最大下落率(%) - 2022年欧州エネルギー危機
    maxCrashDrop: 15, // 暴落期間最大下落率(%) - 2022年欧州エネルギー危機 ~16%
    historicalWorstDailyDrop: 7, // 1日最悪想定(%)
    historicalWorstCrashDrop: 20 // 最悪想定(%) - 欧州危機+円高シナリオ
  },
  {
    id: 'CZK_JPY',
    name: 'CZK/JPY',
    fullName: 'チェココルナ/円',
    rate: 7.587, // エクセル実データ期間（2024/12/20-2025/12/19）の平均レート
    volatility: 8.10, // エクセル実データより
    expectedDepreciation: 2, // EUR連動で安定
    marginRate: 0.04,
    defaultEnabled: true,
    defaultPosition: 'long',
    maxPosition: 5000000, // 500万通貨（50lot）
    spread: 0.1, // GMOクリック証券のスプレッド（銭）
    maxDailyDrop: 4, // 1日最大下落率(%) - EUR連動
    maxCrashDrop: 12, // 暴落期間最大下落率(%) - EUR連動、COVID ~10%
    historicalWorstDailyDrop: 6, // 1日最悪想定(%)
    historicalWorstCrashDrop: 18 // 最悪想定(%) - 欧州危機時
  },
  {
    id: 'USD_JPY',
    name: 'USD/JPY',
    fullName: '米ドル/円',
    rate: 157.738, // エクセル実データ期間（2024/12/20-2025/12/19）の平均レート
    volatility: 9.69, // エクセル実データより
    expectedDepreciation: 0,
    marginRate: 0.04,
    defaultEnabled: false, // ショート専用のためデフォルトはオフ
    defaultPosition: 'short',
    maxPosition: 500000, // 50万通貨（50lot）
    spread: 0.2, // GMOクリック証券のスプレッド（銭）
    maxDailyDrop: 4, // 1日最大下落率(%) - 2024年7-8月キャリー巻き戻し
    maxCrashDrop: 12, // 暴落期間最大下落率(%) - 2024年7-8月キャリー巻き戻し ~12%
    historicalWorstDailyDrop: 6, // 1日最悪想定(%)
    historicalWorstCrashDrop: 18 // 最悪想定(%) - 極端な円高シナリオ
  },
  {
    id: 'EUR_JPY',
    name: 'EUR/JPY',
    fullName: 'ユーロ/円',
    rate: 184.715, // エクセル実データ期間（2024/12/20-2025/12/19）の平均レート
    volatility: 7.38, // エクセル実データより
    expectedDepreciation: 0,
    marginRate: 0.04,
    defaultEnabled: false, // ショート専用のためデフォルトはオフ
    defaultPosition: 'short',
    maxPosition: 500000, // 50万通貨（50lot）
    spread: 0.4, // GMOクリック証券のスプレッド（銭）
    maxDailyDrop: 4, // 1日最大下落率(%) - 2016年Brexit、2024年7-8月
    maxCrashDrop: 12, // 暴落期間最大下落率(%) - 2016年Brexit ~11%、2024年7-8月 ~11%
    historicalWorstDailyDrop: 6, // 1日最悪想定(%)
    historicalWorstCrashDrop: 18 // 最悪想定(%) - 欧州危機+円高シナリオ
  },
  {
    id: 'CHF_JPY',
    name: 'CHF/JPY',
    fullName: 'スイスフラン/円',
    rate: 198.252, // エクセル実データ期間（2024/12/20-2025/12/19）の平均レート
    volatility: 7.29, // エクセル実データより
    expectedDepreciation: -2, // 円安傾向（CHF高）
    marginRate: 0.04,
    defaultEnabled: false, // ショート専用のためデフォルトはオフ
    defaultPosition: 'long', // リスク抑制のためロング（スワップ払いでも有効）
    maxPosition: 500000, // 50万通貨（50lot）
    spread: 1.8, // GMOクリック証券のスプレッド（銭）
    maxDailyDrop: 8, // 1日最大下落率(%) - 2015年スイスフランショック
    maxCrashDrop: 10, // 暴落期間最大下落率(%) - 安全通貨、2024年7-8月 ~8%
    historicalWorstDailyDrop: 12, // 1日最悪想定(%)
    historicalWorstCrashDrop: 15 // 最悪想定(%) - リスクオフ極端シナリオ
  }
];

// 実際に使用する通貨ペアデータ（証券会社のスワップデータを反映）
let currencyPairs = [];

// 現在選択中の証券会社
let currentBroker = 'gmo';

// 証券会社のスワップデータを反映して通貨ペアデータを生成
function initializeCurrencyPairsForBroker(broker) {
  const swapData = brokerSwapData[broker];
  if (!swapData) return;

  const brokerMaxPositions = brokerInfo[broker]?.maxPositions || {};

  currencyPairs = baseCurrencyPairs.map(pair => {
    const data = swapData[pair.id];
    // 証券会社の建玉上限を適用（未設定ならbaseCurrencyPairsのデフォルト値）
    const brokerLimit = brokerMaxPositions[pair.id];
    const maxPos = brokerLimit !== undefined ? brokerLimit : (pair.maxPosition || Infinity);

    // null = この証券会社では取扱なし
    if (data === null || data === undefined) {
      return {
        ...pair,
        swapBuy: 0,
        swapSell: 0,
        unit: 10000,
        enabled: false,
        unavailable: true,
        position: pair.defaultPosition,
        maxPosition: maxPos
      };
    }
    return {
      ...pair,
      swapBuy: data.swapBuy,
      swapSell: data.swapSell,
      unit: data.unit,
      enabled: pair.defaultEnabled,
      unavailable: false,
      position: pair.defaultPosition,
      maxPosition: maxPos
    };
  });
}

// デフォルトの相関係数マトリクス（実データから計算：2024/12/20-2025/12/19の日次データ）
const defaultCorrelations = {
  'TRY_JPY': { 'TRY_JPY': 1.0, 'MXN_JPY': 0.662049, 'ZAR_JPY': 0.55257, 'HUF_JPY': 0.477552, 'CZK_JPY': 0.464028, 'USD_JPY': 0.893818, 'EUR_JPY': 0.578969, 'CHF_JPY': 0.434886 },
  'MXN_JPY': { 'TRY_JPY': 0.662049, 'MXN_JPY': 1.0, 'ZAR_JPY': 0.735979, 'HUF_JPY': 0.641611, 'CZK_JPY': 0.6279, 'USD_JPY': 0.712745, 'EUR_JPY': 0.669433, 'CHF_JPY': 0.441522 },
  'ZAR_JPY': { 'TRY_JPY': 0.55257, 'MXN_JPY': 0.735979, 'ZAR_JPY': 1.0, 'HUF_JPY': 0.539316, 'CZK_JPY': 0.538953, 'USD_JPY': 0.606688, 'EUR_JPY': 0.565715, 'CHF_JPY': 0.35481 },
  'HUF_JPY': { 'TRY_JPY': 0.477552, 'MXN_JPY': 0.641611, 'ZAR_JPY': 0.539316, 'HUF_JPY': 1.0, 'CZK_JPY': 0.878546, 'USD_JPY': 0.486274, 'EUR_JPY': 0.873407, 'CHF_JPY': 0.594905 },
  'CZK_JPY': { 'TRY_JPY': 0.464028, 'MXN_JPY': 0.6279, 'ZAR_JPY': 0.538953, 'HUF_JPY': 0.878546, 'CZK_JPY': 1.0, 'USD_JPY': 0.49376, 'EUR_JPY': 0.915651, 'CHF_JPY': 0.684818 },
  'USD_JPY': { 'TRY_JPY': 0.893818, 'MXN_JPY': 0.712745, 'ZAR_JPY': 0.606688, 'HUF_JPY': 0.486274, 'CZK_JPY': 0.49376, 'USD_JPY': 1.0, 'EUR_JPY': 0.61084, 'CHF_JPY': 0.483346 },
  'EUR_JPY': { 'TRY_JPY': 0.578969, 'MXN_JPY': 0.669433, 'ZAR_JPY': 0.565715, 'HUF_JPY': 0.873407, 'CZK_JPY': 0.915651, 'USD_JPY': 0.61084, 'EUR_JPY': 1.0, 'CHF_JPY': 0.774325 },
  'CHF_JPY': { 'TRY_JPY': 0.434886, 'MXN_JPY': 0.441522, 'ZAR_JPY': 0.35481, 'HUF_JPY': 0.594905, 'CZK_JPY': 0.684818, 'USD_JPY': 0.483346, 'EUR_JPY': 0.774325, 'CHF_JPY': 1.0 }
};

let correlations = JSON.parse(JSON.stringify(defaultCorrelations));
let allocationChart = null;
let frontierChart = null;

// 為替レートAPI設定
const EXCHANGE_RATE_API = 'https://api.exchangerate-api.com/v4/latest/JPY';

// swap-data.json から最新スワップデータを取得
async function loadSwapData() {
  try {
    const res = await fetch('./data/swap-data.json?t=' + Date.now());
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (json.brokers) {
      Object.keys(json.brokers).forEach(broker => {
        brokerSwapData[broker] = json.brokers[broker];
      });
    }
    console.log('スワップデータ更新:', json.meta?.lastUpdated || 'unknown');
    return json.meta || {};
  } catch (e) {
    console.warn('swap-data.json の読み込みに失敗。ハードコード値を使用:', e.message);
    return null;
  }
}

// 初期化処理
document.addEventListener('DOMContentLoaded', async () => {
  // ハードコード値で即座に初期表示
  initializeCurrencyPairsForBroker(currentBroker);
  initializeCurrencyTable();
  initializeCorrelationMatrix();
  setupEventListeners();
  updateBrokerCta(currentBroker);
  renderBrokerComparison();

  // バックグラウンドで最新データを取得し、成功したら再描画
  const meta = await loadSwapData();
  if (meta) {
    initializeCurrencyPairsForBroker(currentBroker);
    initializeCurrencyTable();
    updateCompoundSwapsForBroker(currentBroker);
    renderBrokerComparison();
    const dateEl = document.getElementById('swapDataUpdatedAt');
    if (dateEl && meta.lastUpdated) {
      dateEl.textContent = `スワップデータ: ${new Date(meta.lastUpdated).toLocaleDateString('ja-JP')} 更新`;
    }
  }
});

// 証券会社切り替え関数
function switchBroker(broker) {
  currentBroker = broker;

  // 証券会社情報を更新
  const info = brokerInfo[broker];
  document.getElementById('brokerSubtitle').textContent = info.subtitle;
  document.getElementById('brokerLink').href = info.swapUrl;

  // ボタンのアクティブ状態を更新
  document.querySelectorAll('.broker-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelector(`[data-broker="${broker}"]`).classList.add('active');

  // 通貨ペアデータを再生成
  initializeCurrencyPairsForBroker(broker);

  // テーブルを再初期化
  initializeCurrencyTable();

  // アフィリエイトCTA更新
  updateBrokerCta(broker);

  // 複利シミュレーターのスワップ値を更新
  updateCompoundSwapsForBroker(broker);

  console.log(`証券会社を ${info.name} に切り替えました`);
}

// 複利シミュ: 証券会社情報表示
function updateCompoundBrokerInfo(broker) {
  const info = brokerInfo[broker];
  const infoEl = document.getElementById('compoundBrokerInfo');
  if (infoEl && info) {
    infoEl.textContent = `${info.name} — ロスカット水準: ${info.losscutRate}%`;
  }
}

// 複利シミュレーターのスワップ値を証券会社に合わせて更新
function updateCompoundSwapsForBroker(broker) {
  const swapData = brokerSwapData[broker];
  if (!swapData) return;

  COMPOUND_CURRENCIES.forEach(c => {
    const swapInput = document.getElementById(`compound_${c.id}_swap`);
    if (!swapInput) return;

    const data = swapData[c.id];
    if (data === null || data === undefined) {
      // 取扱なし → 無効化
      swapInput.value = 0;
      swapInput.disabled = true;
      const checkbox = document.getElementById(`compound_${c.id}_enabled`);
      if (checkbox) {
        checkbox.checked = false;
        checkbox.disabled = true;
        const inputs = document.querySelectorAll(`tr[data-currency="${c.id}"] input:not([type="checkbox"])`);
        inputs.forEach(inp => inp.disabled = true);
      }
      const ratioInput = document.getElementById(`compound_${c.id}_ratio`);
      if (ratioInput) ratioInput.value = 0;
    } else {
      // 万通貨あたりに正規化（unitが100000の場合は÷10）
      const normalizedSwap = data.swapBuy * (10000 / data.unit);
      swapInput.value = Math.round(normalizedSwap * 10) / 10;
      swapInput.disabled = !document.getElementById(`compound_${c.id}_enabled`)?.checked;
      const checkbox = document.getElementById(`compound_${c.id}_enabled`);
      if (checkbox) checkbox.disabled = false;
    }
  });
  // 配分バリデーション再実行
  if (typeof validateRatioSum === 'function') validateRatioSum();
}

// 証券会社CTAリンク更新
function updateBrokerCta(broker) {
  const info = brokerInfo[broker];
  const ctaText = document.getElementById('brokerCtaText');
  const ctaLink = document.getElementById('brokerCtaLink');
  if (!ctaText) return;

  const features = info.features ? info.features.join(' / ') : '';
  ctaText.textContent = `${info.name} — ${info.recommended || ''}${features ? '（' + features + '）' : ''}`;

  if (info.affiliateUrl) {
    ctaLink.href = info.affiliateUrl;
    ctaLink.style.display = 'inline-block';
  } else {
    ctaLink.style.display = 'none';
  }
}

// おすすめ証券会社比較カード生成
function renderBrokerComparison() {
  const container = document.getElementById('brokerCards');
  if (!container) return;

  container.innerHTML = Object.entries(brokerInfo).map(([key, info]) => {
    const swapData = brokerSwapData[key];
    const topSwaps = Object.entries(swapData)
      .filter(([, v]) => v !== null && v.swapBuy > 0)
      .sort((a, b) => {
        const aPerUnit = a[1].swapBuy / (a[1].unit / 10000);
        const bPerUnit = b[1].swapBuy / (b[1].unit / 10000);
        return bPerUnit - aPerUnit;
      })
      .slice(0, 3)
      .map(([pair, v]) => {
        const perLot = v.swapBuy / (v.unit / 10000);
        return `${pair.replace('_', '/')}: ${perLot}円/日`;
      });

    const hasAffiliate = !!info.affiliateUrl;
    const linkUrl = hasAffiliate ? info.affiliateUrl : info.swapUrl;

    return `
      <div class="broker-card">
        <div class="broker-card-header">
          <h3>${info.name}</h3>
          <span class="broker-card-badge">${info.recommended || ''}</span>
        </div>
        <ul class="broker-card-features">
          ${info.features.map(f => `<li>${f}</li>`).join('')}
        </ul>
        <div class="broker-card-swaps">
          <span class="broker-card-swaps-title">人気通貨スワップ（1万通貨/日）</span>
          ${topSwaps.map(s => `<span class="broker-card-swap-item">${s}</span>`).join('')}
        </div>
        <a href="${linkUrl}" target="_blank" rel="noopener" class="broker-card-cta">
          ${hasAffiliate ? '無料で口座開設' : '公式サイトを見る'}
        </a>
      </div>
    `;
  }).join('');
}

// 通貨ペアテーブル初期化
function initializeCurrencyTable() {
  const tbody = document.getElementById('currencyBody');
  tbody.innerHTML = '';

  currencyPairs.forEach(pair => {
    const row = document.createElement('tr');

    // 取扱なしの通貨ペアはdisabled表示
    if (pair.unavailable) {
      row.classList.add('pair-unavailable');
      row.innerHTML = `
        <td><input type="checkbox" class="currency-enabled" data-id="${pair.id}" disabled></td>
        <td><strong>${pair.name}</strong><br><small>${pair.fullName}</small><br><span class="unavailable-badge">取扱なし</span></td>
        <td><select class="position-select" data-id="${pair.id}" disabled><option>—</option></select></td>
        <td>${pair.rate.toFixed(3)}</td>
        <td><input type="number" class="swap-input" data-id="${pair.id}" value="—" disabled></td>
        <td class="annual-rate" data-id="${pair.id}">—</td>
        <td>${pair.volatility.toFixed(2)}%</td>
        <td>—</td>
      `;
      tbody.appendChild(row);
      return;
    }

    // スワップポイント（ポジションによって切り替え）
    const swapValue = pair.position === 'long' ? pair.swapBuy : Math.abs(pair.swapSell);
    const annualRate = calculateAnnualRate(pair, swapValue);

    row.innerHTML = `
      <td><input type="checkbox" class="currency-enabled" data-id="${pair.id}" ${pair.enabled ? 'checked' : ''}></td>
      <td><strong>${pair.name}</strong><br><small>${pair.fullName}</small></td>
      <td>
        <select class="position-select" data-id="${pair.id}">
          <option value="long" ${pair.position === 'long' ? 'selected' : ''}>買い (Long)</option>
          <option value="short" ${pair.position === 'short' ? 'selected' : ''}>売り (Short)</option>
        </select>
      </td>
      <td>${pair.rate.toFixed(3)}</td>
      <td><input type="number" class="swap-input ${swapValue >= 0 ? 'swap-positive' : 'swap-negative'}" data-id="${pair.id}" value="${swapValue}" step="0.1"></td>
      <td class="annual-rate" data-id="${pair.id}">${annualRate.toFixed(2)}%</td>
      <td>${pair.volatility.toFixed(2)}%</td>
      <td>${(pair.unit / 1000).toLocaleString()}千通貨</td>
    `;

    tbody.appendChild(row);
  });

  // イベントリスナーを設定
  document.querySelectorAll('.currency-enabled').forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
      const id = e.target.dataset.id;
      const pair = currencyPairs.find(p => p.id === id);
      if (pair) {
        pair.enabled = e.target.checked;
      }
    });
  });

  document.querySelectorAll('.position-select').forEach(select => {
    select.addEventListener('change', (e) => {
      const id = e.target.dataset.id;
      const pair = currencyPairs.find(p => p.id === id);
      if (pair) {
        pair.position = e.target.value;
        // スワップ入力欄もポジションに合わせて更新
        const swapInput = document.querySelector(`.swap-input[data-id="${id}"]`);
        if (swapInput) {
          const newSwapValue = pair.position === 'long' ? pair.swapBuy : Math.abs(pair.swapSell);
          swapInput.value = newSwapValue;
          swapInput.className = `swap-input ${newSwapValue >= 0 ? 'swap-positive' : 'swap-negative'}`;
        }
        updateAnnualRate(id);
      }
    });
  });

  // スワップポイント入力のイベントリスナー
  document.querySelectorAll('.swap-input').forEach(input => {
    input.addEventListener('change', (e) => {
      const id = e.target.dataset.id;
      const pair = currencyPairs.find(p => p.id === id);
      if (pair) {
        const newValue = parseFloat(e.target.value) || 0;
        if (pair.position === 'long') {
          pair.swapBuy = newValue;
          pair.swapSell = -newValue;
        } else {
          pair.swapSell = -newValue;
          pair.swapBuy = -newValue;
        }
        e.target.className = `swap-input ${newValue >= 0 ? 'swap-positive' : 'swap-negative'}`;
        updateAnnualRate(id);
      }
    });
  });
}

// 年率換算計算
function calculateAnnualRate(pair, swapValue) {
  const notional = pair.rate * pair.unit;
  const annualSwap = swapValue * 365;
  const margin = notional * pair.marginRate;
  return (annualSwap / margin) * 100;
}

// 相関係数マトリクス初期化
function initializeCorrelationMatrix() {
  const table = document.getElementById('correlationMatrix');
  table.innerHTML = '';

  // ヘッダー行
  const headerRow = document.createElement('tr');
  headerRow.innerHTML = '<th></th>';
  currencyPairs.forEach(pair => {
    headerRow.innerHTML += `<th>${pair.name}</th>`;
  });
  table.appendChild(headerRow);

  // データ行
  currencyPairs.forEach((pair1, i) => {
    const row = document.createElement('tr');
    row.innerHTML = `<th>${pair1.name}</th>`;

    currencyPairs.forEach((pair2, j) => {
      const value = correlations[pair1.id][pair2.id];
      const isEditable = i !== j; // 対角線以外は編集可能

      if (isEditable) {
        row.innerHTML += `<td><input type="number" class="corr-input" data-i="${pair1.id}" data-j="${pair2.id}" value="${value.toFixed(3)}" step="0.001" min="-1" max="1"></td>`;
      } else {
        row.innerHTML += `<td class="diagonal">1.000</td>`;
      }
    });

    table.appendChild(row);
  });

  // 相関係数入力のイベントリスナー
  document.querySelectorAll('.corr-input').forEach(input => {
    input.addEventListener('change', (e) => {
      const i = e.target.dataset.i;
      const j = e.target.dataset.j;
      let value = parseFloat(e.target.value);

      // 範囲制限
      value = Math.max(-1, Math.min(1, value));
      e.target.value = value.toFixed(3);

      // 対称性を保つ
      correlations[i][j] = value;
      correlations[j][i] = value;

      // 対応するセルも更新
      const mirrorInput = document.querySelector(`.corr-input[data-i="${j}"][data-j="${i}"]`);
      if (mirrorInput) {
        mirrorInput.value = value.toFixed(3);
      }
    });
  });
}

// イベントリスナー設定
function setupEventListeners() {
  // 証券会社切り替え（最適化タブのボタンのみ）
  document.querySelectorAll('.broker-btn[data-broker]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const broker = e.currentTarget.dataset.broker;
      if (broker) switchBroker(broker);
    });
  });

  // 為替レート更新ボタン
  document.getElementById('refreshRatesBtn').addEventListener('click', async () => {
    try {
      const response = await fetch(EXCHANGE_RATE_API);
      const data = await response.json();

      if (!data.rates) {
        throw new Error('APIレスポンスが正しくありません');
      }

      console.log('為替レートAPIレスポンス:', data);

      // 各通貨ペアのレートを更新
      let updatedCount = 0;
      currencyPairs.forEach(pair => {
        // 通貨ペアIDから通貨コードを抽出（例: TRY_JPY → TRY）
        const currencyCode = pair.id.split('_')[0];

        if (data.rates[currencyCode]) {
          // JPYベースのAPIなので、逆数を取る（例: TRY/JPY = 1 / (JPY/TRY)）
          const newRate = 1 / data.rates[currencyCode];
          pair.rate = newRate;
          updatedCount++;
          console.log(`${pair.id}: ${newRate.toFixed(4)}`);
        }
      });

      // テーブルを再描画
      initializeCurrencyTable();

      // 更新日時を表示
      const updateTime = new Date(data.time_last_updated * 1000);
      document.getElementById('rateUpdateTime').textContent = `為替レート: ${updateTime.toLocaleDateString('ja-JP')}時点`;

      alert(`為替レートを更新しました。\n\n${updatedCount}通貨ペアのレートを更新しました。`);
    } catch (error) {
      console.error('為替レート更新エラー:', error);
      alert(`為替レートの更新に失敗しました。\n\nエラー: ${error.message}`);
    }
  });

  // 相関係数リセットボタン
  document.getElementById('resetCorrelation').addEventListener('click', () => {
    correlations = JSON.parse(JSON.stringify(defaultCorrelations));
    initializeCorrelationMatrix();
  });

  // 最適化ボタン
  document.getElementById('optimizeBtn').addEventListener('click', () => {
    runOptimization();
  });

  // 設定エクスポートボタン
  document.getElementById('exportSettingsBtn').addEventListener('click', () => {
    exportSettings();
  });

  // 設定インポートボタン
  document.getElementById('importSettingsBtn').addEventListener('click', () => {
    document.getElementById('importSettingsFile').click();
  });

  // ファイル選択時のインポート処理
  document.getElementById('importSettingsFile').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      importSettings(file);
      e.target.value = ''; // ファイル選択をリセット
    }
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

// スプレッドコストを計算する関数
// pairs: 通貨ペア配列、lots: ロット数配列（1000通貨単位）
function calculateSpreadCost(pairs, lots) {
  let totalSpreadCost = 0;

  for (let i = 0; i < pairs.length; i++) {
    const pair = pairs[i];
    const lotCount = Math.abs(lots[i]); // ロング・ショートに関わらず絶対値
    const currencyAmount = lotCount * 1000; // 通貨単位に変換

    // スプレッドコスト（円）= 通貨量 × スプレッド（銭）÷ 100
    const spreadInYen = (pair.spread || 0) / 100;
    const spreadCost = currencyAmount * spreadInYen;

    totalSpreadCost += spreadCost;
  }

  return totalSpreadCost;
}

function runOptimization() {
  const totalCapital = parseFloat(document.getElementById('totalCapital').value) || 0;
  const targetLeverage = parseFloat(document.getElementById('targetLeverage').value) || 25;
  const allowShorts = document.getElementById('allowShortPositions').checked;
  const considerSpread = document.getElementById('considerSpreadCost').checked;

  console.log(`目標レバレッジ: ${targetLeverage}倍`);

  // 最適化対象の通貨ペアを取得（有効化された通貨のみ）
  let enabledPairs = currencyPairs.filter(p => p.enabled);

  if (enabledPairs.length === 0) {
    alert('少なくとも1つの通貨ペアを有効にしてください。');
    return;
  }

  // スプレッドコストを考慮する場合、有効資金を計算
  let effectiveCapital = totalCapital;
  let estimatedSpreadCost = 0;

  if (considerSpread) {
    // 有効化されている通貨ペアの平均スプレッド率を計算
    // スプレッド率 = (スプレッド in 銭) / (レート × 100)
    let totalSpreadRate = 0;
    enabledPairs.forEach(pair => {
      const spreadInYen = (pair.spread || 0) / 100; // 銭を円に変換
      const spreadRate = spreadInYen / pair.rate; // レートに対する比率
      totalSpreadRate += spreadRate;
    });
    const avgSpreadRate = totalSpreadRate / enabledPairs.length;

    // 概算スプレッドコスト = 投資資金 × レバレッジ × 平均スプレッド率
    estimatedSpreadCost = totalCapital * targetLeverage * avgSpreadRate;
    effectiveCapital = totalCapital - estimatedSpreadCost;

    console.log(`元の投資資金: ${totalCapital.toLocaleString()}円`);
    console.log(`平均スプレッド率: ${(avgSpreadRate * 100).toFixed(3)}%`);
    console.log(`概算スプレッドコスト: ${Math.round(estimatedSpreadCost).toLocaleString()}円 (${(estimatedSpreadCost / totalCapital * 100).toFixed(2)}%)`);
    console.log(`有効資金（最適化に使用）: ${Math.round(effectiveCapital).toLocaleString()}円`);

    if (effectiveCapital <= 0) {
      alert('スプレッドコストを差し引くと有効資金がゼロ以下になります。投資資金を増やすか、レバレッジを下げてください。');
      return;
    }
  } else {
    console.log(`投資資金: ${totalCapital.toLocaleString()}円`);
  }

  document.body.classList.add('loading');

  setTimeout(() => {
    try {
      let results;
      results = optimizeMaxSharpeRatio(enabledPairs, effectiveCapital, targetLeverage, allowShorts);

      if (!results) {
        console.error('最適化結果が取得できませんでした');
        alert('最適化に失敗しました。コンソールを確認してください。');
        document.body.classList.remove('loading');
        return;
      }

      // 元の投資資金と概算スプレッドコストを記録
      results.originalCapital = totalCapital;
      results.estimatedSpreadCost = estimatedSpreadCost;
      results.considerSpread = considerSpread;

      console.log('最適化結果:', results);
      displayResults(enabledPairs, results.weights || [], results, effectiveCapital, targetLeverage, allowShorts);

      document.body.classList.remove('loading');
      document.getElementById('resultSection').style.display = 'block';
      document.getElementById('resultSection').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      console.error('最適化中にエラーが発生しました:', error);
      alert(`エラーが発生しました: ${error.message}\n\nコンソールで詳細を確認してください。`);
      document.body.classList.remove('loading');
    }
  }, 100);
}

// シャープレシオ最大化（ロットベース）
// 目的関数: シャープレシオ = スワップ / リスク の最大化
// 制約: レバレッジ制約以下、ポジション上限
function optimizeMaxSharpeRatio(pairs, totalCapital, maxLeverage, allowShorts) {
  console.log('=== 配分最適化 v3 (分析的配分) ===');
  const n = pairs.length;
  const OPTIMIZATION_UNIT = 1000;

  const lotValues = pairs.map(pair => pair.rate * OPTIMIZATION_UNIT);
  const maxLots = pairs.map(pair => Math.floor(pair.maxPosition / OPTIMIZATION_UNIT));
  const lotVolatilities = pairs.map(pair => (pair.volatility / 100) * pair.rate * OPTIMIZATION_UNIT);
  const maxInvestable = totalCapital * maxLeverage;

  console.log(`レバレッジ制約: ${maxLeverage}倍 (最大投資額: ${maxInvestable.toLocaleString()}円)`);

  // ロング通貨とショート通貨を分離
  const longIndices = [];
  const shortIndices = [];
  for (let i = 0; i < n; i++) {
    const isShortOnly = pairs[i].id === 'USD_JPY' || pairs[i].id === 'EUR_JPY';
    if (isShortOnly) shortIndices.push(i);
    else longIndices.push(i);
  }

  const numLong = longIndices.length;
  if (numLong === 0) {
    console.error('ロング通貨が1つもありません');
    return calculateResultsByLotsCorrect(pairs, Array(n).fill(0), totalCapital, lotValues, lotVolatilities);
  }

  // ショート通貨の予算
  const shortBudgetRatio = (allowShorts && shortIndices.length > 0) ? 0.15 : 0;
  const longBudget = maxInvestable * (1 - shortBudgetRatio) * 0.95;
  const shortBudgetPerCurrency = shortBudgetRatio > 0
    ? (maxInvestable * shortBudgetRatio * 0.95) / shortIndices.length : 0;

  // === Step 1: 各通貨の個別Sharpe比を計算 ===
  const individualSharpes = [];
  for (let k = 0; k < numLong; k++) {
    const i = longIndices[k];
    // 1000通貨あたりの年間ネットリターン
    const swapPer1000 = pairs[i].swapBuy / (pairs[i].unit / OPTIMIZATION_UNIT);
    const annualSwap = swapPer1000 * 365;
    const posValue = OPTIMIZATION_UNIT * pairs[i].rate;
    const depLoss = posValue * ((pairs[i].expectedDepreciation || 0) / 100);
    const netReturn = annualSwap - depLoss;
    const risk = lotVolatilities[i]; // 1000通貨あたりの年間リスク（円）
    const sharpe = risk > 0 ? netReturn / risk : 0;
    individualSharpes.push(sharpe);
    console.log(`  ${pairs[i].name}: 個別Sharpe=${sharpe.toFixed(4)} (swap=${annualSwap.toFixed(0)}, dep=-${depLoss.toFixed(0)}, net=${netReturn.toFixed(0)}, risk=${risk.toFixed(0)})`);
  }

  // === Step 2: 分析的配分計算 ===
  // 均等配分(50%) + Sharpe比例配分(50%) のブレンド
  const alpha = 0.5; // 分散重視度（0=Sharpe比例のみ, 1=均等のみ）
  const equalWeight = 1 / numLong;

  // 負のSharpeは0にクリップ
  const clippedSharpes = individualSharpes.map(s => Math.max(s, 0));
  const totalSharpe = clippedSharpes.reduce((sum, s) => sum + s, 0);

  const weights = [];
  for (let k = 0; k < numLong; k++) {
    const sharpeWeight = totalSharpe > 0 ? clippedSharpes[k] / totalSharpe : equalWeight;
    const blended = alpha * equalWeight + (1 - alpha) * sharpeWeight;
    weights.push(blended);
  }

  // 正規化（合計100%）
  const weightSum = weights.reduce((s, w) => s + w, 0);
  const normalizedWeights = weights.map(w => w / weightSum);

  console.log(`配分計算 (α=${alpha}): ${longIndices.map((idx, k) => pairs[idx].name + '=' + (normalizedWeights[k] * 100).toFixed(1) + '%').join(', ')}`);

  // === Step 3: ロット数に変換 ===
  let bestLots = Array(n).fill(0);

  for (let k = 0; k < numLong; k++) {
    const i = longIndices[k];
    const budget = longBudget * normalizedWeights[k];
    bestLots[i] = Math.min(maxLots[i], Math.max(0, Math.floor(budget / lotValues[i])));
  }

  // ショート通貨
  if (allowShorts) {
    for (const i of shortIndices) {
      const lotCount = Math.floor(shortBudgetPerCurrency / lotValues[i]);
      bestLots[i] = -Math.max(10, Math.min(maxLots[i], lotCount));
    }
  }

  // === Step 4: レバレッジ最終調整 ===
  let finalInvestment = bestLots.reduce((sum, lot, i) => sum + Math.abs(lot) * lotValues[i], 0);
  const targetUtilization = maxInvestable * 0.95;

  if (finalInvestment < targetUtilization && finalInvestment > 0) {
    const scale = Math.min(1.5, targetUtilization / finalInvestment);
    bestLots = bestLots.map((lot, i) => {
      if (lot > 0) return Math.min(maxLots[i], Math.floor(lot * scale));
      else if (lot < 0) return Math.max(-maxLots[i], Math.ceil(lot * scale));
      return 0;
    });
    finalInvestment = bestLots.reduce((sum, lot, i) => sum + Math.abs(lot) * lotValues[i], 0);
    if (finalInvestment > maxInvestable) {
      const downScale = maxInvestable / finalInvestment;
      bestLots = bestLots.map((lot, i) => {
        if (lot > 0) return Math.floor(lot * downScale);
        else if (lot < 0) return Math.ceil(lot * downScale);
        return 0;
      });
    }
  } else if (finalInvestment > maxInvestable) {
    const downScale = maxInvestable / finalInvestment;
    bestLots = bestLots.map((lot, i) => {
      if (lot > 0) return Math.floor(lot * downScale);
      else if (lot < 0) return Math.ceil(lot * downScale);
      return 0;
    });
  }

  // 最終結果のログ
  const finalLongInv = longIndices.reduce((sum, i) => sum + Math.abs(bestLots[i]) * lotValues[i], 0);
  for (let k = 0; k < numLong; k++) {
    const i = longIndices[k];
    const inv = Math.abs(bestLots[i]) * lotValues[i];
    const pct = finalLongInv > 0 ? (inv / finalLongInv * 100) : 0;
    console.log(`  最終配分 ${pairs[i].name}: ${pct.toFixed(1)}% (${bestLots[i]}ロット)`);
  }

  return calculateResultsByLotsCorrect(pairs, bestLots, totalCapital, lotValues, lotVolatilities);
}

// 実質年間リターン計算：スワップ収入 - 期待下落による含み損
// lotsは1000通貨単位での数量
function calculateNetAnnualReturn(pairs, lots) {
  const OPTIMIZATION_UNIT = 1000;
  const annualSwap = calculateDailySwapCorrect(pairs, lots) * 365;
  let depreciationPL = 0;
  for (let i = 0; i < pairs.length; i++) {
    if (lots[i] === 0) continue;
    const positionValue = Math.abs(lots[i]) * OPTIMIZATION_UNIT * pairs[i].rate;
    const depRate = (pairs[i].expectedDepreciation || 0) / 100;
    if (lots[i] > 0) {
      // ロング: 通貨下落は損失
      depreciationPL -= positionValue * depRate;
    } else {
      // ショート: 通貨下落は利益
      depreciationPL += positionValue * depRate;
    }
  }
  return annualSwap + depreciationPL;
}

// 正しいスワップ計算：ロットの符号に応じてswapBuy/swapSellを使い分ける
// lotsは1000通貨単位での数量
function calculateDailySwapCorrect(pairs, lots) {
  const OPTIMIZATION_UNIT = 1000;
  let dailySwap = 0;
  for (let i = 0; i < pairs.length; i++) {
    // 1000通貨あたりのスワップポイントに換算
    const swapPer1000Buy = pairs[i].swapBuy / (pairs[i].unit / OPTIMIZATION_UNIT);
    const swapPer1000Sell = pairs[i].swapSell / (pairs[i].unit / OPTIMIZATION_UNIT);

    if (lots[i] > 0) {
      // ロング: swapBuyを使用
      dailySwap += lots[i] * swapPer1000Buy;
    } else if (lots[i] < 0) {
      // ショート: swapSellを使用（絶対値）
      dailySwap += Math.abs(lots[i]) * swapPer1000Sell;
    }
  }
  return dailySwap;
}

function calculateSharpeByLotsCorrect(pairs, lots, lotVolatilities) {
  const netReturn = calculateNetAnnualReturn(pairs, lots);
  const risk = calculatePortfolioRiskByLots(pairs, lots, lotVolatilities);
  return risk > 0 ? netReturn / risk : 0;
}

// 正しい結果計算関数
// lotsは1000通貨単位での数量
function calculateResultsByLotsCorrect(pairs, lots, totalCapital, lotValues, lotVolatilities) {
  const OPTIMIZATION_UNIT = 1000;
  const dailySwap = calculateDailySwapCorrect(pairs, lots);
  const annualSwap = dailySwap * 365;
  const netAnnualReturn = calculateNetAnnualReturn(pairs, lots);
  const riskYen = calculatePortfolioRiskByLots(pairs, lots, lotVolatilities);
  const sharpe = riskYen > 0 ? netAnnualReturn / riskYen : 0;

  // 各ペアの配分詳細
  const allocations = pairs.map((pair, i) => {
    // lotsは1000通貨単位なので、実際の通貨数に変換
    const units = lots[i] * OPTIMIZATION_UNIT;
    const amount = Math.abs(units) * pair.rate;
    const margin = amount * pair.marginRate;

    // 1000通貨あたりのスワップポイントに換算
    const swapPer1000Buy = pair.swapBuy / (pair.unit / OPTIMIZATION_UNIT);
    const swapPer1000Sell = pair.swapSell / (pair.unit / OPTIMIZATION_UNIT);
    const swap = lots[i] > 0
      ? lots[i] * swapPer1000Buy
      : (lots[i] < 0 ? Math.abs(lots[i]) * swapPer1000Sell : 0);

    // 表示用のロット数を計算（証券会社の単位）
    const displayLots = units / pair.unit;

    return {
      pair: pair, // pairオブジェクト全体を保存
      units: units,
      lots: lots[i], // 1000通貨単位での数量
      displayLots: displayLots, // 証券会社の単位でのロット数
      actualAmount: amount,
      margin: margin,
      annualSwap: swap * 365,
      position: lots[i] > 0 ? 'long' : (lots[i] < 0 ? 'short' : 'none')
    };
  });

  const totalInvestment = allocations.reduce((sum, a) => sum + a.actualAmount, 0);
  const totalMargin = allocations.reduce((sum, a) => sum + a.margin, 0);

  // スプレッドコストを計算
  const spreadCost = calculateSpreadCost(pairs, lots);

  // 配分比率（weight）を計算
  allocations.forEach(alloc => {
    alloc.weight = totalInvestment > 0 ? alloc.actualAmount / totalInvestment : 0;
  });

  // リスク寄与度の計算（ロットベース）
  const riskContributions = [];
  if (riskYen > 0) {
    for (let i = 0; i < pairs.length; i++) {
      let marginalContribution = 0;
      for (let j = 0; j < pairs.length; j++) {
        const corr = correlations[pairs[i].id][pairs[j].id];
        const signI = lots[i] >= 0 ? 1 : -1;
        const signJ = lots[j] >= 0 ? 1 : -1;
        marginalContribution += Math.abs(lots[j]) * lotVolatilities[i] * lotVolatilities[j] * corr * signI * signJ;
      }
      const contribution = Math.abs(lots[i]) * marginalContribution / riskYen;
      riskContributions.push({
        pair: pairs[i],
        contribution: (contribution / riskYen) * 100,
        percentage: (contribution / riskYen) * 100
      });
    }
  }

  // 期待リターン: スワップ収入 - 通貨下落による含み損
  const expectedReturn = totalCapital > 0 ? (netAnnualReturn / totalCapital) * 100 : 0;
  const depreciationLoss = annualSwap - netAnnualReturn; // 期待下落損（正の値=損失）

  return {
    allocations: allocations,
    totalAnnualSwap: annualSwap,
    netAnnualReturn: netAnnualReturn,
    depreciationLoss: depreciationLoss,
    totalMargin: totalMargin,
    riskYen: riskYen,
    sharpe: sharpe,
    totalInvestment: totalInvestment,
    expectedReturn: expectedReturn,
    expectedReturnYen: netAnnualReturn,
    riskContributions: riskContributions,
    weights: lots, // ロット数を返す
    spreadCost: spreadCost // スプレッドコスト（円）
  };
}

function initializeLotsForSharpe(lots, pairs, lotValues, maxLots, lotVolatilities, maxInvestable, allowShorts) {
  // 有効通貨に円建てで均等配分する初期化
  // ショート専用通貨は10%、ヘッジ通貨は5%、残りをロング通貨に均等配分
  const targetInvestment = maxInvestable * 0.90;

  // 通貨をカテゴリ分類
  const longIndices = [];
  const shortIndices = [];
  for (let i = 0; i < pairs.length; i++) {
    const isShortOnly = pairs[i].id === 'USD_JPY' || pairs[i].id === 'EUR_JPY';
    if (isShortOnly) {
      shortIndices.push(i);
    } else {
      longIndices.push(i);
    }
  }

  // ロング通貨に均等配分
  const longBudget = allowShorts ? targetInvestment * 0.85 : targetInvestment;
  const shortBudget = allowShorts ? targetInvestment * 0.15 : 0;
  const perLongBudget = longIndices.length > 0 ? longBudget / longIndices.length : 0;
  const perShortBudget = shortIndices.length > 0 ? shortBudget / shortIndices.length : 0;

  for (const i of longIndices) {
    const lotCount = Math.floor(perLongBudget / lotValues[i]);
    lots[i] = Math.max(10, Math.min(maxLots[i], lotCount));
  }

  if (allowShorts) {
    for (const i of shortIndices) {
      const lotCount = Math.floor(perShortBudget / lotValues[i]);
      lots[i] = Math.min(-10, Math.max(-maxLots[i], -lotCount));
    }
  }

  console.log(`初期化: ロング${longIndices.length}通貨に均等配分 (各¥${Math.round(perLongBudget).toLocaleString()})`);
}

function perturbLotsForSharpe(currentLots, pairs, swapsPerLot, lotValues, lotVolatilities, maxLots, maxInvestable, allowShorts) {
  const n = currentLots.length;
  const newLots = [...currentLots];

  // ロング通貨のインデックスを特定
  const longIndices = [];
  const shortOnlyIndices = [];
  const hedgeIndices = [];
  for (let k = 0; k < n; k++) {
    const isShortOnly = pairs[k].id === 'USD_JPY' || pairs[k].id === 'EUR_JPY';
    const isHedge = pairs[k].id === 'CHF_JPY';
    if (isShortOnly) shortOnlyIndices.push(k);
    else if (isHedge) hedgeIndices.push(k);
    else longIndices.push(k);
  }

  // 40%の確率でスワップ操作（ロング通貨間の配分移動）
  if (longIndices.length >= 2 && rng.random() < 0.4) {
    // 2つのロング通貨を選んで、片方を減らしてもう片方を増やす
    const idx1 = longIndices[Math.floor(rng.random() * longIndices.length)];
    let idx2 = longIndices[Math.floor(rng.random() * longIndices.length)];
    while (idx2 === idx1) {
      idx2 = longIndices[Math.floor(rng.random() * longIndices.length)];
    }

    // 移動量は円建てで等価になるよう調整
    const baseAmount = lotValues[idx1] * (Math.floor(rng.random() * 20) + 5); // 5〜24ユニット分の円額
    const delta1 = Math.max(1, Math.round(baseAmount / lotValues[idx1]));
    const delta2 = Math.max(1, Math.round(baseAmount / lotValues[idx2]));

    newLots[idx1] = Math.max(0, newLots[idx1] - delta1);
    newLots[idx2] = Math.min(maxLots[idx2], newLots[idx2] + delta2);
    return newLots;
  }

  // 通常の単一通貨摂動
  const i = Math.floor(rng.random() * n);
  const pair = pairs[i];

  // 変更量を最大ロット数に応じて調整（1000通貨単位での微調整）
  const maxPossibleLots = maxLots[i];
  let delta;
  if (maxPossibleLots > 50000) {
    delta = Math.floor(rng.random() * 1900) + 100;
  } else if (maxPossibleLots > 5000) {
    delta = Math.floor(rng.random() * 490) + 10;
  } else {
    delta = Math.floor(rng.random() * 190) + 10;
  }

  const isShortOnlyCurrency = pair.id === 'USD_JPY' || pair.id === 'EUR_JPY';
  const isHedgeCurrency = pair.id === 'CHF_JPY';

  if (allowShorts && isShortOnlyCurrency) {
    const maxShortLots = Math.floor(maxLots[i] * 0.5);
    const minShortLots = -10;
    if (rng.random() < 0.7) {
      newLots[i] = Math.max(-maxShortLots, newLots[i] - delta);
    } else {
      newLots[i] = Math.max(minShortLots, Math.min(-10, newLots[i] + delta));
    }
  } else if (allowShorts && isHedgeCurrency) {
    const maxShortLots = Math.floor(maxLots[i] * 0.5);
    if (rng.random() < 0.6) {
      newLots[i] = Math.max(-maxShortLots, newLots[i] - delta);
    } else {
      newLots[i] = Math.min(maxLots[i], newLots[i] + delta);
    }
  } else {
    // ロング通貨は50/50で増減（偏りなし）
    if (rng.random() < 0.5) {
      newLots[i] = Math.min(maxLots[i], currentLots[i] + delta);
    } else {
      newLots[i] = Math.max(0, currentLots[i] - delta);
    }
  }

  return newLots;
}

function calculatePortfolioRiskByLots(pairs, lots, lotVolatilities) {
  // ポートフォリオの分散を計算（円建て）
  let variance = 0;

  for (let i = 0; i < pairs.length; i++) {
    for (let j = 0; j < pairs.length; j++) {
      const corr = correlations[pairs[i].id][pairs[j].id];
      // ロット数の符号を考慮（ショートは負）
      const signI = lots[i] >= 0 ? 1 : -1;
      const signJ = lots[j] >= 0 ? 1 : -1;
      variance += Math.abs(lots[i]) * Math.abs(lots[j]) * lotVolatilities[i] * lotVolatilities[j] * corr * signI * signJ;
    }
  }

  return Math.sqrt(Math.max(0, variance));
}

// 集中度（HHI: Herfindahl-Hirschman Index）を計算
// 全て1通貨に集中 → 1.0、N通貨に均等分散 → 1/N
function calculateConcentrationHHI(lots, lotValues) {
  const totalInvestment = lots.reduce((sum, lot, i) => sum + Math.abs(lot) * lotValues[i], 0);
  if (totalInvestment === 0) return 1;
  let hhi = 0;
  for (let i = 0; i < lots.length; i++) {
    const weight = (Math.abs(lots[i]) * lotValues[i]) / totalInvestment;
    hhi += weight * weight;
  }
  return hhi;
}

// 効率的フロンティアを計算（複数のリスク水準で最適化を実行）
function calculateEfficientFrontier(pairs, totalCapital, maxLeverage, allowShorts) {
  const frontierPoints = [];

  // 複数のレバレッジ水準で最適化を実行（7点）
  const scaleLevels = [0.2, 0.4, 0.6, 0.8, 1.0, 1.2, 1.4];

  console.log('効率的フロンティアを計算中...');

  for (let i = 0; i < scaleLevels.length; i++) {
    const multiplier = scaleLevels[i];

    try {
      let results;
      const adjustedLeverage = maxLeverage * multiplier;
      console.log(`ポイント ${i + 1}/${scaleLevels.length}: レバレッジ = ${adjustedLeverage.toFixed(1)}倍`);
      results = optimizeMaxSharpeRatio(pairs, totalCapital, adjustedLeverage, allowShorts);

      if (results && results.riskYen && totalCapital > 0) {
        const annualRiskYen = results.riskYen;
        const riskRate = (annualRiskYen / totalCapital) * 100;
        const returnRate = results.expectedReturn;

        frontierPoints.push({
          x: riskRate,
          y: returnRate,
          sharpe: results.sharpe,
          multiplier: multiplier
        });

        console.log(`  -> リスク: ${riskRate.toFixed(2)}%, リターン: ${returnRate.toFixed(2)}%, シャープ: ${results.sharpe.toFixed(3)}`);
      }
    } catch (error) {
      console.error(`ポイント ${i + 1} の計算に失敗:`, error);
    }
  }

  // リスクの昇順でソート
  frontierPoints.sort((a, b) => a.x - b.x);

  console.log(`効率的フロンティア計算完了: ${frontierPoints.length}ポイント`);
  return frontierPoints;
}

function displayResults(pairs, weights, results, totalCapital, targetLeverage, allowShorts) {
  // 暴落耐性モード / 暴落完全防御モード
  const optCrashSafe = document.getElementById('optimizerCrashSafe')?.checked || false;
  const optCrashFullDefense = document.getElementById('optimizerCrashFullDefense')?.checked || false;
  // どちらかが有効ならストレステストも自動的に実行
  const optStressEnabled = optCrashSafe || optCrashFullDefense;
  let crashSafeScale = 1;
  let activeDefenseMode = null; // 'safe' or 'fullDefense'

  if (optCrashFullDefense || optCrashSafe) {
    const capitalForStress = results.originalCapital || totalCapital;
    let preTotalUnrealizedLoss = 0;
    let prePostCrashNotional = 0;

    // 完全防御モード: historicalWorstCrashDrop + 維持率300%目標
    // 耐性モード: maxCrashDrop + 維持率200%目標
    const useHistorical = optCrashFullDefense;
    const targetMaintenanceRate = optCrashFullDefense ? 3.0 : 2.0;

    const useDaily = document.querySelector('input[name="optimizerCrashDuration"]:checked')?.value === 'daily';
    results.allocations.forEach(alloc => {
      if (alloc.lots === 0) return;
      const crashRate = useHistorical
        ? ((useDaily ? alloc.pair.historicalWorstDailyDrop : alloc.pair.historicalWorstCrashDrop) || alloc.pair.maxCrashDrop || 10) / 100
        : ((useDaily ? alloc.pair.maxDailyDrop : alloc.pair.maxCrashDrop) || 10) / 100;
      const absUnits = Math.abs(alloc.units);
      const currentNotional = absUnits * alloc.pair.rate;
      const unrealizedLoss = alloc.position === 'long'
        ? currentNotional * crashRate
        : -(currentNotional * crashRate);
      preTotalUnrealizedLoss += unrealizedLoss;
      prePostCrashNotional += currentNotional * (1 - crashRate);
    });

    // targetMaintenanceRate倍の維持率を確保: equity / margin >= targetMaintenanceRate
    // equity = capital - loss*scale, margin = notional*scale*0.04
    // (capital - loss*scale) / (notional*scale*0.04) >= targetMaintenanceRate
    // capital >= scale * (loss + notional*0.04*targetMaintenanceRate)
    const denom = preTotalUnrealizedLoss + prePostCrashNotional * 0.04 * targetMaintenanceRate;
    if (denom > 0) {
      const requiredScale = capitalForStress / denom;
      // 目標維持率ギリギリまでポジションを最適化（拡大・縮小の両方向）
      crashSafeScale = requiredScale * 0.99;  // 1%安全バッファ
      activeDefenseMode = optCrashFullDefense ? 'fullDefense' : 'safe';
      const modeName = optCrashFullDefense ? '暴落完全防御モード' : '暴落耐性モード';
      const direction = crashSafeScale < 1 ? 'スケールダウン' : 'スケールアップ';
      console.log(`${modeName}: ポジションを${(crashSafeScale * 100).toFixed(1)}%に${direction}`);

      // Scale all allocations
      results.allocations.forEach(alloc => {
        alloc.units = Math.round(alloc.units * crashSafeScale);
        alloc.lots = alloc.lots * crashSafeScale;
        alloc.displayLots = alloc.displayLots * crashSafeScale;
        alloc.margin = alloc.margin * crashSafeScale;
        alloc.annualSwap = alloc.annualSwap * crashSafeScale;
        alloc.actualAmount = alloc.actualAmount * crashSafeScale;
      });

      // Scale totals
      results.totalAnnualSwap *= crashSafeScale;
      results.totalMargin *= crashSafeScale;
      if (results.riskYen) results.riskYen *= crashSafeScale;
      if (results.expectedReturnYen) results.expectedReturnYen *= crashSafeScale;
      if (results.spreadCost) results.spreadCost *= crashSafeScale;
      if (results.estimatedSpreadCost) results.estimatedSpreadCost *= crashSafeScale;
      if (results.depreciationLoss) results.depreciationLoss *= crashSafeScale;
      if (results.netAnnualReturn) results.netAnnualReturn *= crashSafeScale;
    }
  }

  // 日次・月次リスクの計算（年間リスクを日次に変換）
  const annualToDailyFactor = Math.sqrt(252);
  const dailyRiskYen = results.riskYen ? results.riskYen / annualToDailyFactor : 0;
  const monthlyRiskYen = dailyRiskYen * Math.sqrt(20); // 月20営業日
  const annualRiskYen = results.riskYen || 0;

  // 日次・月次スワップ
  const dailySwap = results.totalAnnualSwap / 365;
  const monthlySwap = results.totalAnnualSwap / 12;

  // 実効レバレッジとスプレッドコスト
  const totalInvestment = results.allocations.reduce((sum, a) => sum + a.actualAmount, 0);
  const considerSpread = results.considerSpread || false;
  const originalCapital = results.originalCapital || totalCapital;

  // スプレッドコスト情報
  const actualSpreadCost = results.spreadCost || 0;
  const estimatedSpreadCost = results.estimatedSpreadCost || 0;

  // レバレッジは元の投資資金に対して計算
  const actualLeverage = originalCapital > 0 ? totalInvestment / originalCapital : 0;
  const spreadCostRate = originalCapital > 0 ? (actualSpreadCost / originalCapital) * 100 : 0;

  // 期待リターン計算
  // 実質リターン = スワップ収入 - 期待下落損 - スプレッドコスト
  const depreciationLoss = results.depreciationLoss || 0;
  const netReturn = results.totalAnnualSwap - depreciationLoss - (considerSpread ? actualSpreadCost : 0);
  const expectedReturn = originalCapital > 0 ? (netReturn / originalCapital) * 100 : 0;

  // スワップ表示（純粋なスワップ収入を表示）
  document.getElementById('annualSwap').textContent = `¥${Math.round(results.totalAnnualSwap).toLocaleString()} / 年`;
  document.getElementById('dailySwap').textContent = `¥${Math.round(dailySwap).toLocaleString()}`;
  document.getElementById('monthlySwap').textContent = `¥${Math.round(monthlySwap).toLocaleString()}`;

  document.getElementById('annualRisk').textContent = `¥${Math.round(annualRiskYen).toLocaleString()} / 年`;
  document.getElementById('dailyRisk').textContent = `¥${Math.round(dailyRiskYen).toLocaleString()}`;
  document.getElementById('monthlyRisk').textContent = `¥${Math.round(monthlyRiskYen).toLocaleString()}`;

  document.getElementById('sharpeRatio').textContent = results.sharpe.toFixed(3);

  // レバレッジとスプレッドコストを表示
  let leverageText = `レバレッジ: ${actualLeverage.toFixed(2)}倍`;

  if (considerSpread && actualSpreadCost > 0) {
    leverageText += ` | スプレッド損: ¥${Math.round(actualSpreadCost).toLocaleString()} (${spreadCostRate.toFixed(2)}%)`;
  }

  document.getElementById('actualLeverage').textContent = leverageText;

  // コンソールに詳細を出力
  console.log(`投資資金: ¥${originalCapital.toLocaleString()}`);
  console.log(`年間スワップ（税引前）: ¥${Math.round(results.totalAnnualSwap).toLocaleString()}`);
  if (depreciationLoss > 0) {
    console.log(`期待下落損: ¥${Math.round(depreciationLoss).toLocaleString()}`);
  }
  if (considerSpread && actualSpreadCost > 0) {
    console.log(`スプレッドコスト: ¥${Math.round(actualSpreadCost).toLocaleString()} (${spreadCostRate.toFixed(2)}%)`);
  }
  console.log(`実質リターン: ¥${Math.round(netReturn).toLocaleString()} (${expectedReturn.toFixed(2)}%)`)

  document.getElementById('expectedReturn').textContent = `${expectedReturn.toFixed(2)}%`;
  const expectedReturnYenEl = document.getElementById('expectedReturnYen');
  if (expectedReturnYenEl) {
    expectedReturnYenEl.textContent = `（¥${Math.round(netReturn).toLocaleString()}）`;
  }

  // 内訳表示
  const breakdownEl = document.getElementById('returnBreakdown');
  if (breakdownEl) {
    const parts = [`スワップ ¥${Math.round(results.totalAnnualSwap).toLocaleString()}`];
    if (depreciationLoss > 0) {
      parts.push(`期待下落損 -¥${Math.round(depreciationLoss).toLocaleString()}`);
    }
    if (considerSpread && actualSpreadCost > 0) {
      parts.push(`スプレッド -¥${Math.round(actualSpreadCost).toLocaleString()}`);
    }
    breakdownEl.textContent = parts.length > 1 ? parts.join(' / ') : '';
  }

  // 配分テーブル
  const resultBody = document.getElementById('resultBody');
  resultBody.innerHTML = '';

  results.allocations.forEach(alloc => {
    if (alloc.lots !== 0) {
      const row = document.createElement('tr');
      const absDisplayLots = Math.abs(alloc.displayLots);
      const units = Math.abs(alloc.units);
      const dailySwap = alloc.annualSwap / 365;
      row.innerHTML = `
        <td><strong>${alloc.pair.name}</strong></td>
        <td class="${alloc.position === 'long' ? 'position-long' : 'position-short'}">
          ${alloc.position === 'long' ? '買い' : '売り'}
        </td>
        <td>${(alloc.weight * 100).toFixed(1)}%</td>
        <td>${absDisplayLots.toFixed(1)} lot（${units.toLocaleString()}通貨）</td>
        <td>¥${Math.round(alloc.margin).toLocaleString()}</td>
        <td class="${dailySwap >= 0 ? 'swap-positive' : 'swap-negative'}">¥${Math.round(dailySwap).toLocaleString()}</td>
        <td>¥${alloc.annualSwap.toLocaleString()}</td>
      `;
      resultBody.appendChild(row);
    }
  });

  // 合計行
  const totalDailySwap = results.totalAnnualSwap / 365;
  const totalRow = document.createElement('tr');
  totalRow.innerHTML = `
    <td colspan="4"><strong>合計</strong></td>
    <td><strong>¥${Math.round(results.totalMargin).toLocaleString()}</strong></td>
    <td class="${totalDailySwap >= 0 ? 'swap-positive' : 'swap-negative'}"><strong>¥${Math.round(totalDailySwap).toLocaleString()}</strong></td>
    <td><strong>¥${results.totalAnnualSwap.toLocaleString()}</strong></td>
  `;
  totalRow.style.background = '#f1f5f9';
  resultBody.appendChild(totalRow);

  // ストレステスト計算（暴落モードが有効なら自動実行）
  const stressResultDiv = document.getElementById('optimizerStressResult');

  if (optStressEnabled && stressResultDiv) {
    stressResultDiv.style.display = 'block';

    const OPTIMIZATION_UNIT = 1000;
    let totalUnrealizedLoss = 0;
    let postCrashNotional = 0;
    const stressDetails = [];

    // 完全防御モード時はhistoricalWorstCrashDropを使用
    const useHistoricalForStress = optCrashFullDefense;

    const useDailyForStress = document.querySelector('input[name="optimizerCrashDuration"]:checked')?.value === 'daily';
    results.allocations.forEach(alloc => {
      if (alloc.lots === 0) return;
      const crashRate = useHistoricalForStress
        ? ((useDailyForStress ? alloc.pair.historicalWorstDailyDrop : alloc.pair.historicalWorstCrashDrop) || alloc.pair.maxCrashDrop || 10) / 100
        : ((useDailyForStress ? alloc.pair.maxDailyDrop : alloc.pair.maxCrashDrop) || 10) / 100;
      const absUnits = Math.abs(alloc.units);
      const currentNotional = absUnits * alloc.pair.rate;

      // ロングは下落で損失、ショートは下落で利益
      let unrealizedLoss;
      if (alloc.position === 'long') {
        unrealizedLoss = currentNotional * crashRate;
      } else {
        unrealizedLoss = -(currentNotional * crashRate); // ショートは暴落で利益
      }

      const crashedNotional = currentNotional * (1 - crashRate);
      totalUnrealizedLoss += unrealizedLoss;
      postCrashNotional += crashedNotional;

      stressDetails.push({
        pair: alloc.pair,
        position: alloc.position,
        crashRate: crashRate,
        unrealizedLoss: unrealizedLoss,
        units: alloc.units
      });
    });

    const postCrashEquity = originalCapital - totalUnrealizedLoss;
    const postCrashMargin = postCrashNotional * 0.04;
    const maintenanceRate = postCrashMargin > 0 ? (postCrashEquity / postCrashMargin) * 100 : Infinity;

    // サマリー更新
    document.getElementById('optStressEquity').textContent = `¥${Math.round(postCrashEquity).toLocaleString()}`;
    document.getElementById('optStressLoss').textContent = `含み損 ¥${Math.round(totalUnrealizedLoss).toLocaleString()}`;

    document.getElementById('optStressMaintenanceRate').textContent =
      maintenanceRate === Infinity ? '∞' : `${maintenanceRate.toFixed(1)}%`;

    const verdictCard = document.getElementById('optStressVerdict').closest('.result-item');
    const broker = brokerInfo[currentBroker];
    const brokerLosscutRate = broker?.losscutRate || 100;
    const brokerMarginCallRate = broker?.marginCallRate || 100;
    const brokerName = broker?.name || '';

    if (maintenanceRate < brokerLosscutRate) {
      document.getElementById('optStressMaintenanceDetail').textContent = 'ロスカット圏';
      document.getElementById('optStressVerdict').textContent = 'ロスカット';
      document.getElementById('optStressVerdictDetail').textContent = `${brokerName}のLC水準${brokerLosscutRate}%未満`;
      verdictCard.className = 'result-item stress-danger';
    } else if (maintenanceRate < brokerMarginCallRate) {
      document.getElementById('optStressMaintenanceDetail').textContent = '追証・警告圏';
      document.getElementById('optStressVerdict').textContent = '追証リスク';
      document.getElementById('optStressVerdictDetail').textContent = `${brokerName}の追証水準${brokerMarginCallRate}%未満`;
      verdictCard.className = 'result-item stress-danger';
    } else if (maintenanceRate < 200) {
      document.getElementById('optStressMaintenanceDetail').textContent = '警告圏';
      document.getElementById('optStressVerdict').textContent = '警告';
      document.getElementById('optStressVerdictDetail').textContent = `維持率200%未満（LC水準${brokerLosscutRate}%）`;
      verdictCard.className = 'result-item stress-warning';
    } else {
      document.getElementById('optStressMaintenanceDetail').textContent = '安全圏';
      document.getElementById('optStressVerdict').textContent = '耐久可能';
      document.getElementById('optStressVerdictDetail').textContent = `維持率${maintenanceRate.toFixed(0)}%（LC水準${brokerLosscutRate}%）`;
      verdictCard.className = 'result-item stress-safe';
    }

    // 詳細テーブル
    const stressBody = document.getElementById('stressDetailBody');
    stressBody.innerHTML = '';
    stressDetails.forEach(d => {
      const row = document.createElement('tr');
      const lossClass = d.unrealizedLoss > 0 ? 'stress-status-danger' : 'stress-status-safe';
      row.innerHTML = `
        <td><strong>${d.pair.name}</strong></td>
        <td>${d.position === 'long' ? '買い' : '売り'}</td>
        <td>${(d.crashRate * 100).toFixed(0)}%</td>
        <td class="${lossClass}">${d.unrealizedLoss > 0 ? '-' : '+'}¥${Math.abs(Math.round(d.unrealizedLoss)).toLocaleString()}</td>
      `;
      stressBody.appendChild(row);
    });
    // 合計行
    const stressTotalRow = document.createElement('tr');
    stressTotalRow.style.background = '#f1f5f9';
    const totalLossClass = totalUnrealizedLoss > 0 ? 'stress-status-danger' : 'stress-status-safe';
    stressTotalRow.innerHTML = `
      <td colspan="3"><strong>合計含み損益</strong></td>
      <td class="${totalLossClass}"><strong>${totalUnrealizedLoss > 0 ? '-' : '+'}¥${Math.abs(Math.round(totalUnrealizedLoss)).toLocaleString()}</strong></td>
    `;
    stressBody.appendChild(stressTotalRow);

    // 暴落耐性モード/完全防御モードでスケーリングした場合はメモを表示
    if (activeDefenseMode && crashSafeScale !== 1) {
      const noteRow = document.createElement('tr');
      const isFullDefense = activeDefenseMode === 'fullDefense';
      noteRow.style.background = isFullDefense ? '#fef3c7' : '#eff6ff';
      const icon = isFullDefense ? '🛡️' : '⚡';
      const modeName = isFullDefense ? '暴落完全防御モード' : '暴落耐性モード';
      const color = isFullDefense ? '#92400e' : '#2563eb';
      const targetPct = isFullDefense ? '300%' : '200%';
      const action = crashSafeScale < 1 ? '自動縮小' : '自動拡大';
      const extra = `<br><small>暴落後の維持率が${targetPct}になるようポジションを最適化</small>`;
      noteRow.innerHTML = `
        <td colspan="4" style="color: ${color}; font-size: 0.85rem; padding: 8px;">
          ${icon} ${modeName}: ポジションを元の <strong>${(crashSafeScale * 100).toFixed(1)}%</strong> に${action}しました${extra}
        </td>
      `;
      stressBody.appendChild(noteRow);
    }
  } else if (stressResultDiv) {
    stressResultDiv.style.display = 'none';
  }

  // リスク寄与度テーブル
  const riskBody = document.getElementById('riskContributionBody');
  riskBody.innerHTML = '';

  results.riskContributions.forEach(contrib => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><strong>${contrib.pair.name}</strong></td>
      <td>${contrib.contribution.toFixed(2)}%</td>
      <td>${contrib.percentage.toFixed(1)}%</td>
    `;
    riskBody.appendChild(row);
  });

  // ポートフォリオ構成グラフ
  const allocationCtx = document.getElementById('allocationChart');
  if (allocationCtx) {
    const ctx = allocationCtx.getContext('2d');

    if (allocationChart) {
      allocationChart.destroy();
    }

    const validAllocations = results.allocations.filter(a => a.weight > 0);

    allocationChart = new Chart(ctx, {
      type: 'pie',
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
  }

  // 効率的フロンティア
  const frontierCtx = document.getElementById('frontierChart');
  if (frontierCtx) {
    const ctx = frontierCtx.getContext('2d');

    if (frontierChart) {
      frontierChart.destroy();
    }

    // リスク率（年率%）を計算
    const riskRate = totalCapital > 0 ? (annualRiskYen / totalCapital) * 100 : 0;
    const returnRate = expectedReturn;

    // 効率的フロンティアの計算は無効化（計算コストが高く、結果が不安定なため）
    // 現在のポートフォリオのみを表示
    const datasets = [{
      label: '最適化ポートフォリオ',
      data: [{ x: riskRate, y: returnRate }],
      backgroundColor: '#ef4444',
      pointRadius: 10,
      pointStyle: 'star',
      showLine: false
    }];

    frontierChart = new Chart(ctx, {
      type: 'scatter',
      data: {
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
          x: {
            title: {
              display: true,
              text: 'リスク（年率%）'
            },
            beginAtZero: true
          },
          y: {
            title: {
              display: true,
              text: '期待リターン（年率%）'
            },
            beginAtZero: true
          }
        },
        plugins: {
          legend: {
            position: 'bottom'
          },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const point = ctx.raw;
                const lines = [
                  `リスク: ${point.x.toFixed(2)}%`,
                  `リターン: ${point.y.toFixed(2)}%`
                ];
                if (point.sharpe !== undefined) {
                  lines.push(`シャープレシオ: ${point.sharpe.toFixed(3)}`);
                }
                return lines;
              }
            }
          }
        }
      }
    });
  }
}

// 設定のエクスポート（保存）
function exportSettings() {
  try {
    // 現在の設定を収集
    const settings = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      broker: currentBroker,
      investment: {
        totalCapital: parseFloat(document.getElementById('totalCapital').value) || 0,
        targetLeverage: parseFloat(document.getElementById('targetLeverage').value) || 25
      },
      optimization: {
        allowShorts: document.getElementById('allowShortPositions').checked
      },
      currencyPairs: currencyPairs.map(pair => ({
        id: pair.id,
        enabled: pair.enabled,
        position: pair.position
      })),
      correlations: correlations
    };

    // JSONファイルとしてダウンロード
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const dateStr = new Date().toISOString().split('T')[0];
    a.download = `fx-swap-settings-${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log('設定をエクスポートしました');
  } catch (error) {
    console.error('設定のエクスポートに失敗しました:', error);
    alert('設定の保存に失敗しました。コンソールを確認してください。');
  }
}

// 設定のインポート（読み込み）
function importSettings(file) {
  const reader = new FileReader();

  reader.onload = (e) => {
    try {
      const settings = JSON.parse(e.target.result);

      // バージョンチェック（将来の拡張用）
      if (!settings.version) {
        throw new Error('設定ファイルのバージョンが不明です');
      }

      // 証券会社を切り替え
      if (settings.broker && settings.broker !== currentBroker) {
        switchBroker(settings.broker);
      }

      // 投資条件を復元
      if (settings.investment) {
        document.getElementById('totalCapital').value = settings.investment.totalCapital || 500000;
        document.getElementById('targetLeverage').value = settings.investment.targetLeverage || 25;
      }

      // 最適化設定を復元
      if (settings.optimization) {
        document.getElementById('allowShortPositions').checked = settings.optimization.allowShorts !== false;
      }

      // 通貨ペアの設定を復元
      if (settings.currencyPairs) {
        settings.currencyPairs.forEach(savedPair => {
          const pair = currencyPairs.find(p => p.id === savedPair.id);
          if (pair) {
            pair.enabled = savedPair.enabled !== false;
            pair.position = savedPair.position || pair.defaultPosition;

            // UIを更新
            const checkbox = document.querySelector(`.currency-enabled[data-id="${pair.id}"]`);
            if (checkbox) {
              checkbox.checked = pair.enabled;
            }

            const select = document.querySelector(`.position-select[data-id="${pair.id}"]`);
            if (select) {
              select.value = pair.position;
            }
          }
        });
      }

      // 相関係数を復元
      if (settings.correlations) {
        correlations = JSON.parse(JSON.stringify(settings.correlations));
        initializeCorrelationMatrix();
      }

      console.log('設定をインポートしました:', settings);
      alert('設定を読み込みました。');
    } catch (error) {
      console.error('設定のインポートに失敗しました:', error);
      alert(`設定の読み込みに失敗しました: ${error.message}\n\nコンソールで詳細を確認してください。`);
    }
  };

  reader.onerror = () => {
    console.error('ファイルの読み込みに失敗しました');
    alert('ファイルの読み込みに失敗しました。');
  };

  reader.readAsText(file);
}

// ===== 複利シミュレーション機能 =====

// 複利シミュレーション用の設定
const COMPOUND_CONFIG = {
  broker: 'gmo',
  currencies: {
    HUF_JPY: {
      id: 'HUF_JPY',
      name: 'HUF/JPY',
      rate: 0.475,
      swapBuy: 2,  // 1万通貨あたり/日
      unit: 10000,
      marginRate: 0.04
    },
    TRY_JPY: {
      id: 'TRY_JPY',
      name: 'TRY/JPY',
      rate: 3.676,
      swapBuy: 12,  // 1万通貨あたり/日
      unit: 10000,
      marginRate: 0.04
    }
  },
  leverageRules: [
    { maxAssets: 500000, maxLeverage: 5, reinvestThreshold: 5 },
    { maxAssets: 1000000, maxLeverage: 3, reinvestThreshold: 3 },
    { maxAssets: Infinity, maxLeverage: 2, reinvestThreshold: 2 }
  ]
};

// 複利シミュレーション用のグラフインスタンス
let assetGrowthChart = null;
let ratioOptChart = null;

// 複利シミュレーター通貨設定UIを動的生成
function renderCompoundCurrencyConfig() {
  const container = document.getElementById('compoundCurrencyConfig');
  if (!container) return;

  let html = `
    <div class="compound-currency-table-wrapper">
      <table class="compound-currency-table">
        <thead>
          <tr>
            <th>有効</th>
            <th>通貨ペア</th>
            <th>配分(%)</th>
            <th>レート(円)</th>
            <th>スワップ(円/万通貨/日)</th>
            <th class="spread-col">スプレッド(銭)</th>
            <th>年間変動率(%)</th>
            <th class="crash-rate-col">暴落時最大下落率(%)</th>
          </tr>
        </thead>
        <tbody>
  `;

  COMPOUND_CURRENCIES.forEach(c => {
    html += `
      <tr class="compound-currency-row" data-currency="${c.id}">
        <td><input type="checkbox" id="compound_${c.id}_enabled" ${c.defaultEnabled ? 'checked' : ''}></td>
        <td><strong>${c.name}</strong><br><small>${c.label}</small></td>
        <td><input type="number" id="compound_${c.id}_ratio" value="${c.defaultRatio}" min="0" max="100" step="5" class="currency-input" ${!c.defaultEnabled ? 'disabled' : ''}></td>
        <td><input type="number" id="compound_${c.id}_rate" value="${c.defaultRate}" min="0.01" max="200" step="0.01" class="currency-input" ${!c.defaultEnabled ? 'disabled' : ''}></td>
        <td><input type="number" id="compound_${c.id}_swap" value="${c.defaultSwap}" min="0" max="200" step="0.1" class="currency-input" ${!c.defaultEnabled ? 'disabled' : ''}></td>
        <td class="spread-col"><input type="number" id="compound_${c.id}_spread" value="${c.defaultSpread}" min="0" max="50" step="0.1" class="currency-input" ${!c.defaultEnabled ? 'disabled' : ''}></td>
        <td><input type="number" id="compound_${c.id}_rateChange" value="${c.annualRateChange}" min="-50" max="50" step="0.5" class="currency-input" ${!c.defaultEnabled ? 'disabled' : ''} style="color: ${c.annualRateChange < 0 ? '#ef4444' : '#10b981'}"></td>
        <td class="crash-rate-col"><input type="number" id="compound_${c.id}_crash" value="${c.defaultCrashRate}" min="1" max="50" step="1" class="currency-input" ${!c.defaultEnabled ? 'disabled' : ''}></td>
      </tr>
    `;
  });

  html += `
        </tbody>
      </table>
    </div>
    <div id="ratioValidation" class="ratio-validation"></div>
  `;

  container.innerHTML = html;

  // 有効/無効切替イベント
  COMPOUND_CURRENCIES.forEach(c => {
    const checkbox = document.getElementById(`compound_${c.id}_enabled`);
    if (checkbox) {
      checkbox.addEventListener('change', () => {
        const inputs = document.querySelectorAll(`tr[data-currency="${c.id}"] input:not([type="checkbox"])`);
        inputs.forEach(inp => inp.disabled = !checkbox.checked);
        if (!checkbox.checked) {
          document.getElementById(`compound_${c.id}_ratio`).value = 0;
        }
        validateRatioSum();
      });
    }
    // 配分変更時のバリデーション
    const ratioInput = document.getElementById(`compound_${c.id}_ratio`);
    if (ratioInput) {
      ratioInput.addEventListener('input', validateRatioSum);
    }
  });

  // ストレステスト有効/無効で下落率列の表示切替
  updateCrashRateVisibility();
  validateRatioSum();
}

// 配分合計バリデーション
function validateRatioSum() {
  const validation = document.getElementById('ratioValidation');
  if (!validation) return;

  let sum = 0;
  COMPOUND_CURRENCIES.forEach(c => {
    const enabled = document.getElementById(`compound_${c.id}_enabled`)?.checked;
    if (enabled) {
      sum += parseFloat(document.getElementById(`compound_${c.id}_ratio`)?.value) || 0;
    }
  });

  if (Math.abs(sum - 100) < 0.01) {
    validation.textContent = `配分合計: ${sum}% ✓`;
    validation.className = 'ratio-validation ratio-valid';
  } else {
    validation.textContent = `配分合計: ${sum}%（100%にしてください）`;
    validation.className = 'ratio-validation ratio-invalid';
  }
}

// 複利シミュの現在のモードを取得
function getCompoundMode() {
  const radios = document.querySelectorAll('input[name="compoundMode"]');
  for (const radio of radios) {
    if (radio.checked) return radio.value;
  }
  return 'leverage'; // デフォルト
}

// 暴落率サマリー表示更新（共通ヘルパー）
function updateCrashRateSummary(summaryElId, pairs, durationName, isFullDefense, useDaily) {
  const el = document.getElementById(summaryElId);
  if (!el) return;
  const parts = pairs.map(p => {
    let rate;
    if (isFullDefense) {
      rate = useDaily ? (p.historicalWorstDailyDrop || p.maxDailyDrop || 10) : (p.historicalWorstCrashDrop || p.maxCrashDrop || 10);
    } else {
      rate = useDaily ? (p.maxDailyDrop || 10) : (p.maxCrashDrop || 10);
    }
    return `${p.name.split('/')[0]} ${rate}%`;
  });
  el.innerHTML = `<span style="color: #475569;">適用暴落率（${durationName}）:</span> ${parts.join(' / ')}`;
}

// ポートフォリオ最適化の暴落率サマリー更新
function updateOptimizerCrashRateSummary() {
  const safe = document.getElementById('optimizerCrashSafe')?.checked;
  const full = document.getElementById('optimizerCrashFullDefense')?.checked;
  const group = document.getElementById('optimizerCrashDurationGroup');
  if (group) group.style.display = (safe || full) ? '' : 'none';
  if (!safe && !full) return;
  const useDaily = document.querySelector('input[name="optimizerCrashDuration"]:checked')?.value === 'daily';
  const enabledPairs = currencyPairs.filter(p => document.querySelector(`.currency-enabled[data-id="${p.id}"]`)?.checked);
  updateCrashRateSummary('optimizerCrashRateSummary', enabledPairs, useDaily ? '1日' : '暴落期間', full, useDaily);
}

// 複利シミュの暴落率サマリー更新
function updateCompoundCrashRateSummary() {
  const mode = getCompoundMode();
  const isCrash = mode === 'crashSafe' || mode === 'fullDefense';
  if (!isCrash) return;
  const useDaily = document.querySelector('input[name="compoundCrashDuration"]:checked')?.value === 'daily';
  const enabledPairs = COMPOUND_CURRENCIES.filter(c => document.getElementById(`compound_${c.id}_enabled`)?.checked);
  const pairs = enabledPairs.map(c => ({
    name: c.name,
    maxDailyDrop: c.defaultDailyCrashRate,
    maxCrashDrop: c.defaultCrashRate,
    historicalWorstDailyDrop: c.historicalWorstDailyCrashRate,
    historicalWorstCrashDrop: c.historicalWorstCrashRate
  }));
  updateCrashRateSummary('compoundCrashRateSummary', pairs, useDaily ? '1日' : '暴落期間', mode === 'fullDefense', useDaily);
}

// 軌道修正の暴落率サマリー更新
function updateRebalanceCrashRateSummary() {
  const safe = document.getElementById('rebalanceCrashSafe')?.checked;
  const full = document.getElementById('rebalanceCrashFullDefense')?.checked;
  const group = document.getElementById('rebalanceCrashDurationGroup');
  if (group) group.style.display = (safe || full) ? '' : 'none';
  if (!safe && !full) return;
  const useDaily = document.querySelector('input[name="rebalanceCrashDuration"]:checked')?.value === 'daily';
  // 軌道修正のポジションテーブルから使用中の通貨ペアを取得
  const usedPairIds = new Set();
  document.querySelectorAll('#rebalancePositionBody .rb-pair').forEach(sel => {
    if (sel.value) usedPairIds.add(sel.value);
  });
  const pairs = baseCurrencyPairs.filter(p => usedPairIds.has(p.id));
  updateCrashRateSummary('rebalanceCrashRateSummary', pairs.length > 0 ? pairs : baseCurrencyPairs, useDaily ? '1日' : '暴落期間', full, useDaily);
}

// 暴落モード有効/無効で下落率列の表示切替 + レバレッジルールセクション制御
function updateCrashRateVisibility() {
  const mode = getCompoundMode();
  const isCrashMode = mode === 'crashSafe' || mode === 'fullDefense';

  // 下落率列の表示切替（暴落モード時 OR レバレッジルール時の暴落結果表示のため常に表示）
  document.querySelectorAll('.crash-rate-col').forEach(el => {
    el.style.display = isCrashMode ? '' : 'none';
  });

  // レバレッジルールセクションの有効/無効切替
  const leverageSection = document.getElementById('leverageRulesSection');
  if (leverageSection) {
    if (isCrashMode) {
      leverageSection.style.opacity = '0.5';
      leverageSection.style.pointerEvents = 'none';
      leverageSection.querySelectorAll('input').forEach(inp => inp.disabled = true);
    } else {
      leverageSection.style.opacity = '1';
      leverageSection.style.pointerEvents = '';
      leverageSection.querySelectorAll('input').forEach(inp => inp.disabled = false);
    }
  }

  // ラジオボタンのスタイル更新
  document.querySelectorAll('.mode-radio-label').forEach(label => {
    label.style.borderColor = '#e2e8f0';
    label.style.background = '';
  });
  if (mode === 'leverage') {
    const el = document.getElementById('modeLabelLeverage');
    if (el) { el.style.borderColor = '#3b82f6'; el.style.background = '#eff6ff'; }
  } else if (mode === 'crashSafe') {
    const el = document.getElementById('modeLabelCrashSafe');
    if (el) { el.style.borderColor = '#3b82f6'; el.style.background = '#eff6ff'; }
  } else if (mode === 'fullDefense') {
    const el = document.getElementById('modeLabelFullDefense');
    if (el) { el.style.borderColor = '#f59e0b'; el.style.background = '#fffbeb'; }
  }

  // 暴落想定期間トグルの表示/非表示
  const crashDurationGroup = document.getElementById('compoundCrashDurationGroup');
  if (crashDurationGroup) {
    crashDurationGroup.style.display = isCrashMode ? '' : 'none';
  }
  if (isCrashMode) {
    updateCompoundCrashRateSummary();
  }
}

// DOMから有効通貨の設定を読み取る
function readCompoundCurrencies(ratioOverrides) {
  const mode = getCompoundMode();
  const isCrashMode = mode === 'crashSafe' || mode === 'fullDefense';
  const compoundBroker = document.querySelector('.compound-broker-btn.active')?.dataset?.compoundBroker || currentBroker;
  const brokerMaxPos = brokerInfo[compoundBroker]?.maxPositions || {};
  const currencies = [];

  COMPOUND_CURRENCIES.forEach(c => {
    const enabled = document.getElementById(`compound_${c.id}_enabled`)?.checked;
    if (!enabled) return;

    const ratio = ratioOverrides
      ? (ratioOverrides[c.id] !== undefined ? ratioOverrides[c.id] : 0)
      : (parseFloat(document.getElementById(`compound_${c.id}_ratio`)?.value) || 0) / 100;

    // ブローカー別の保有上限（通貨単位）→ lot数（万通貨単位）に変換
    // maxPositionsに通貨がない場合は取扱なし（0）
    const maxPosCurrency = (c.id in brokerMaxPos) ? brokerMaxPos[c.id] : 0;
    const maxLots = Math.floor(maxPosCurrency / 10000);

    currencies.push({
      id: c.id,
      name: c.name,
      rate: parseFloat(document.getElementById(`compound_${c.id}_rate`)?.value) || c.defaultRate,
      swap: parseFloat(document.getElementById(`compound_${c.id}_swap`)?.value) || c.defaultSwap,
      spread: parseFloat(document.getElementById(`compound_${c.id}_spread`)?.value) || c.defaultSpread || 0,
      ratio: ratio,
      dailyCrashRate: (c.defaultDailyCrashRate || c.defaultCrashRate) / 100,
      crashRate: (parseFloat(document.getElementById(`compound_${c.id}_crash`)?.value) || c.defaultCrashRate) / 100,
      historicalWorstDailyCrashRate: (c.historicalWorstDailyCrashRate || c.historicalWorstCrashRate || c.defaultCrashRate) / 100,
      historicalWorstCrashRate: (c.historicalWorstCrashRate || c.defaultCrashRate) / 100,
      annualRateChange: (parseFloat(document.getElementById(`compound_${c.id}_rateChange`)?.value) || 0) / 100,
      unit: 10000,
      marginRate: 0.04,
      maxLots: maxLots
    });
  });

  return currencies;
}

// 複利シミュレーションのメイン関数
function runCompoundSimulation(options = {}) {
  const { ratioOverrides, silent } = options;
  const initialCapital = parseFloat(document.getElementById('compoundInitialCapital').value) || 400000;
  const months = Math.max(1, parseInt(document.getElementById('compoundMonths').value) || 36);
  const monthlyDeposit = parseFloat(document.getElementById('compoundMonthlyDeposit')?.value) || 0;
  const compoundBroker = document.querySelector('.compound-broker-btn.active')?.dataset?.compoundBroker || currentBroker;
  const spreadEnabled = document.getElementById('compoundSpreadEnabled')?.checked || false;

  // N通貨の設定を読み取り
  const currencies = readCompoundCurrencies(ratioOverrides);
  if (currencies.length === 0) {
    if (!silent) alert('有効な通貨ペアが選択されていません。');
    return [];
  }

  // レバレッジルールを入力欄から取得
  const rule1Threshold = parseFloat(document.getElementById('rule1Threshold').value) || 500000;
  const rule1Leverage = parseFloat(document.getElementById('rule1Leverage').value) || 5;
  const rule2Threshold = parseFloat(document.getElementById('rule2Threshold').value) || 1000000;
  const rule2Leverage = parseFloat(document.getElementById('rule2Leverage').value) || 3;
  const rule3Leverage = parseFloat(document.getElementById('rule3Leverage').value) || 2;

  const leverageRules = [
    { maxAssets: rule1Threshold, maxLeverage: rule1Leverage, reinvestThreshold: rule1Leverage },
    { maxAssets: rule2Threshold, maxLeverage: rule2Leverage, reinvestThreshold: rule2Leverage },
    { maxAssets: Infinity, maxLeverage: rule3Leverage, reinvestThreshold: rule3Leverage }
  ];

  // モード判定（ラジオボタン）
  const mode = getCompoundMode();
  const crashSafeMode = mode === 'crashSafe';
  const crashFullDefenseMode = mode === 'fullDefense';
  const stressTestEnabled = crashSafeMode || crashFullDefenseMode;
  // レバレッジルールモード時も暴落結果を表示するためストレス計算は常に行う
  const showStressResults = true;
  const activeCompoundDefense = crashFullDefenseMode ? 'fullDefense' : (crashSafeMode ? 'safe' : null);

  if (!silent) {
    const ratioStr = currencies.map(c => `${c.name}=${(c.ratio*100).toFixed(0)}%`).join(', ');
    console.log(`複利シミュレーション開始: 初期資金=${initialCapital}円, ${ratioStr}, 期間=${months}ヶ月, モード=${mode}`);
    if (stressTestEnabled) {
      const crashStr = currencies.map(c => `${c.name}=${(c.crashRate*100).toFixed(0)}%`).join(', ');
      console.log(`暴落防御モード有効: ${crashStr}`);
    }
  }
  let maxSafeLeverage = Infinity;
  if (crashSafeMode || crashFullDefenseMode) {
    // 完全防御モード: historicalWorstCrashRateを使用、耐性モード: crashRateを使用
    // 完全防御モード: historicalWorstCrashRate + 維持率300%目標
    // 耐性モード: crashRate + 維持率200%目標
    const useDailyCompound = document.querySelector('input[name="compoundCrashDuration"]:checked')?.value === 'daily';
    const weightedCrashRate = crashFullDefenseMode
      ? currencies.reduce((sum, c) => sum + c.ratio * (useDailyCompound ? c.historicalWorstDailyCrashRate : c.historicalWorstCrashRate), 0)
      : currencies.reduce((sum, c) => sum + c.ratio * (useDailyCompound ? c.dailyCrashRate : c.crashRate), 0);
    const targetMaintenanceRate = crashFullDefenseMode ? 3.0 : 2.0;
    maxSafeLeverage = 1 / (weightedCrashRate + (1 - weightedCrashRate) * 0.04 * targetMaintenanceRate) * 0.99;
    if (!silent) {
      const modeName = crashFullDefenseMode ? '暴落完全防御モード' : '暴落耐性モード';
      console.log(`${modeName}: 加重暴落率=${(weightedCrashRate*100).toFixed(1)}%, 最大安全レバレッジ=${maxSafeLeverage.toFixed(2)}倍`);
    }
  }

  // 初期状態を設定
  let state = {
    totalAssets: initialCapital,
    cashReserve: initialCapital,
    lots: {},
    accumulatedSwap: 0
  };
  currencies.forEach(c => { state.lots[c.id] = 0; });

  // 初期ポジションを購入
  // 防御モード時はmaxSafeLeverageをそのまま目標レバレッジとして使用（ギリギリまでポジションを持つ）
  const initialMaxLeverage = (crashSafeMode || crashFullDefenseMode) ? maxSafeLeverage : rule1Leverage;
  // スプレッドコスト計算ヘルパー: spread(銭) × 0.01 × lots × unit
  function calcSpreadCost(lots, currencyList) {
    if (!spreadEnabled) return 0;
    let cost = 0;
    currencyList.forEach(c => {
      cost += (c.spread || 0) * 0.01 * (lots[c.id] || 0) * c.unit;
    });
    return cost;
  }

  const initialPurchase = calculateInitialPurchaseN(initialCapital, currencies, initialMaxLeverage);
  Object.keys(initialPurchase.lots).forEach(id => { state.lots[id] = initialPurchase.lots[id]; });
  const initialSpreadCost = calcSpreadCost(initialPurchase.lots, currencies);
  state.cashReserve = initialCapital - initialPurchase.totalMargin - initialSpreadCost;

  const results = [];
  let reinvestCount = 0;
  let totalCumulativeSwap = 0; // 再投資でリセットされないスワップ累計
  let totalSpreadCost = initialSpreadCost; // スプレッドコスト累計
  const positionLimitHits = {}; // 上限到達した通貨と到達月を記録

  // 各通貨の現在レート（月ごとに変動する）と購入時平均レートを追跡
  const currentRates = {};
  const avgEntryRates = {};
  currencies.forEach(c => {
    currentRates[c.id] = c.rate;
    avgEntryRates[c.id] = c.rate;
  });

  // 想定元本合計を計算するヘルパー（初期レート用、初期購入計算で使用）
  function calcTotalNotional(lots) {
    return currencies.reduce((sum, c) => sum + lots[c.id] * c.unit * c.rate, 0);
  }

  // レート変動を考慮した想定元本計算ヘルパー
  function calcTotalNotionalWithRates(lots) {
    return currencies.reduce((sum, c) => sum + lots[c.id] * c.unit * currentRates[c.id], 0);
  }

  // 含み損益の計算
  function calcUnrealizedPL(lots) {
    let pl = 0;
    currencies.forEach(c => {
      if (lots[c.id] > 0) {
        pl += lots[c.id] * c.unit * (currentRates[c.id] - avgEntryRates[c.id]);
      }
    });
    return pl;
  }

  // N通貨ストレステスト計算ヘルパー
  // レバレッジルールモード: maxCrashDrop(defaultCrashRate)で計算（表示のみ）
  // 暴落耐性モード: crashRateで計算
  // 暴落完全防御モード: historicalWorstCrashRateで計算
  function calcStressData(lots, totalAssets) {
    let totalLoss = 0;
    let postCrashNotional = 0;
    const useDailyStress = document.querySelector('input[name="compoundCrashDuration"]:checked')?.value === 'daily';
    currencies.forEach(c => {
      let rate;
      if (crashFullDefenseMode) {
        rate = useDailyStress ? c.historicalWorstDailyCrashRate : c.historicalWorstCrashRate;
      } else if (crashSafeMode) {
        rate = useDailyStress ? c.dailyCrashRate : c.crashRate;
      } else {
        rate = (useDailyStress ? c.dailyCrashRate : c.crashRate) || (c.historicalWorstCrashRate || 0.1);
      }
      totalLoss += lots[c.id] * c.unit * currentRates[c.id] * rate;
      postCrashNotional += lots[c.id] * c.unit * currentRates[c.id] * (1 - rate);
    });
    const postCrashEquity = totalAssets - totalLoss;
    const postCrashMargin = postCrashNotional * 0.04;
    const maintenanceRate = postCrashMargin > 0 ? (postCrashEquity / postCrashMargin) * 100 : Infinity;
    return {
      postCrashEquity,
      maintenanceRate,
      stressStatus: maintenanceRate < (brokerInfo[compoundBroker]?.losscutRate || 100) ? 'margin_call' : maintenanceRate < 200 ? 'warning' : 'safe',
      unrealizedLoss: totalLoss
    };
  }

  // 月0（初期状態）を記録
  const initialNotional = calcTotalNotional(state.lots);
  const initialMargin = initialNotional * 0.04;
  const month0Assets = initialMargin + state.cashReserve;
  const initialLeverage = month0Assets > 0 ? initialNotional / month0Assets : 0;
  results.push({
    month: 0,
    totalAssets: month0Assets,
    lots: { ...state.lots },
    leverage: initialLeverage,
    monthlySwap: 0,
    cumulativeSwap: 0,
    unrealizedPL: 0,
    spreadCost: totalSpreadCost,
    action: 'initial',
    milestone: false,
    stress: calcStressData(state.lots, month0Assets),
    rates: { ...currentRates }
  });

  // 月ごとにシミュレーション
  for (let month = 1; month <= months; month++) {
    // 0. レート変動を適用（月次: 年間変動率 / 12）
    currencies.forEach(c => {
      if (c.annualRateChange !== 0) {
        currentRates[c.id] *= (1 + c.annualRateChange / 12);
      }
    });

    // 1. 月間スワップ計算（30日）— スワップは実額のまま（レート変動の影響は含み損で別途反映）
    let monthlySwap = 0;
    currencies.forEach(c => {
      monthlySwap += state.lots[c.id] * c.swap * 30;
    });

    // 2. スワップを累積
    state.accumulatedSwap += monthlySwap;
    totalCumulativeSwap += monthlySwap;

    // 2.5. 毎月追加入金をキャッシュに加算
    if (monthlyDeposit > 0) {
      state.cashReserve += monthlyDeposit;
    }

    // 3. 総資産を計算（含み損益を反映）
    const totalNotional = calcTotalNotionalWithRates(state.lots);
    const totalMargin = totalNotional * 0.04;
    const unrealizedPL = calcUnrealizedPL(state.lots);
    state.totalAssets = totalMargin + state.cashReserve + state.accumulatedSwap + unrealizedPL;

    // 4. 現在のレバレッジを計算
    const currentLeverage = state.totalAssets > 0 ? totalNotional / state.totalAssets : 0;

    // 5. レバレッジルールを判定
    const rule = leverageRules.find(r => state.totalAssets <= r.maxAssets);
    let targetLeverage = rule ? rule.reinvestThreshold : rule3Leverage;
    if (crashSafeMode || crashFullDefenseMode) {
      // 防御モード時はmaxSafeLeverageを目標レバレッジとして使用（ギリギリまでポジションを持つ）
      targetLeverage = maxSafeLeverage;
    }

    // 6. 再投資判定とアクション
    let action = 'none';
    let milestone = false;

    if (results.length > 0) {
      const prevAssets = results[results.length - 1].totalAssets;
      if (prevAssets < rule1Threshold && state.totalAssets >= rule1Threshold) {
        milestone = true;
        if (!silent) console.log(`月${month}: ${(rule1Threshold/10000).toFixed(0)}万円到達！`);
      }
      if (prevAssets < rule2Threshold && state.totalAssets >= rule2Threshold) {
        milestone = true;
        if (!silent) console.log(`月${month}: ${(rule2Threshold/10000).toFixed(0)}万円到達！`);
      }
    }

    if (currentLeverage <= targetLeverage) {
      const availableCash = state.accumulatedSwap + state.cashReserve;

      if (availableCash > 0) {
        const maxAdditionalNotional = (state.totalAssets * targetLeverage) - totalNotional;

        if (maxAdditionalNotional > 10000) {
          // 現在のレートで追加購入（レート変動後の価格で買う）
          const currenciesWithCurrentRates = currencies.map(c => ({ ...c, rate: currentRates[c.id] }));
          const purchase = calculateAdditionalPurchaseN(availableCash, currenciesWithCurrentRates, maxAdditionalNotional, state.lots);

          const anyPurchased = currencies.some(c => purchase.lots[c.id] > 0);
          if (anyPurchased) {
            // 平均取得レートを更新（加重平均）
            currencies.forEach(c => {
              if (purchase.lots[c.id] > 0) {
                const oldLots = state.lots[c.id];
                const newLots = purchase.lots[c.id];
                avgEntryRates[c.id] = (oldLots * avgEntryRates[c.id] + newLots * currentRates[c.id]) / (oldLots + newLots);
                state.lots[c.id] += newLots;
              }
            });
            const reinvestSpreadCost = calcSpreadCost(purchase.lots, currenciesWithCurrentRates);
            totalSpreadCost += reinvestSpreadCost;
            state.cashReserve = availableCash - purchase.totalMargin - reinvestSpreadCost;
            state.accumulatedSwap = 0;
            action = 'reinvest';
            reinvestCount++;
            // 上限到達チェック
            currencies.forEach(c => {
              if (c.maxLots && c.maxLots !== Infinity && state.lots[c.id] >= c.maxLots && !positionLimitHits[c.id]) {
                positionLimitHits[c.id] = { name: c.name, month: month, lots: state.lots[c.id], maxLots: c.maxLots };
                if (!silent) console.log(`月${month}: ${c.name} が保有上限 ${c.maxLots.toLocaleString()}万通貨に到達`);
              }
            });
          }
        }
      }
    } else {
      action = 'accumulate';
    }

    // 7. 結果を記録（現在のレートで再計算）
    const newTotalNotional = calcTotalNotionalWithRates(state.lots);
    const newTotalMargin = newTotalNotional * 0.04;
    const newUnrealizedPL = calcUnrealizedPL(state.lots);
    state.totalAssets = newTotalMargin + state.cashReserve + state.accumulatedSwap + newUnrealizedPL;
    const newLeverage = state.totalAssets > 0 ? newTotalNotional / state.totalAssets : 0;

    results.push({
      month: month,
      totalAssets: state.totalAssets,
      lots: { ...state.lots },
      leverage: newLeverage,
      monthlySwap: monthlySwap,
      cumulativeSwap: totalCumulativeSwap,
      totalDeposit: monthlyDeposit * month,
      unrealizedPL: newUnrealizedPL,
      spreadCost: totalSpreadCost,
      action: action,
      milestone: milestone,
      stress: calcStressData(state.lots, state.totalAssets),
      rates: { ...currentRates }
    });
  }

  // 結果を表示（silentモードでは表示をスキップ）
  if (!silent) {
    displayCompoundResults(results, initialCapital, reinvestCount, showStressResults, crashSafeMode || crashFullDefenseMode, maxSafeLeverage, currencies, activeCompoundDefense, compoundBroker, monthlyDeposit, positionLimitHits);
  }

  return results;
}

// 配分最適化
// N通貨の配分組合せを生成（合計100%、0〜100%を許可）
function generateRatioCombinations(n, step = 5) {
  if (n === 1) return [[100]];

  // 4通貨以上の場合はstep=10に自動切替
  if (n >= 4 && step < 10) step = 10;

  const results = [];
  function recurse(remaining, depth, current) {
    if (depth === n - 1) {
      current.push(remaining);
      results.push([...current]);
      current.pop();
      return;
    }
    for (let v = 0; v <= remaining; v += step) {
      current.push(v);
      recurse(remaining - v, depth + 1, current);
      current.pop();
    }
  }
  recurse(100, 0, []);
  return results;
}

function optimizeCompoundRatio() {
  const initialCapital = parseFloat(document.getElementById('compoundInitialCapital').value) || 400000;
  const mode = getCompoundMode();
  const stressTestEnabled = mode === 'crashSafe' || mode === 'fullDefense';

  // 有効通貨を読み取り（配分は無視、IDリストとして使用）
  const currencies = readCompoundCurrencies();
  if (currencies.length === 0) {
    alert('有効な通貨ペアが選択されていません。');
    return;
  }

  const combinations = generateRatioCombinations(currencies.length);
  console.log(`配分最適化: ${currencies.length}通貨, ${combinations.length}パターン`);

  const ratioResults = [];

  combinations.forEach(combo => {
    // 配分overridesを作成
    const ratioOverrides = {};
    currencies.forEach((c, i) => {
      ratioOverrides[c.id] = combo[i] / 100;
    });

    const results = runCompoundSimulation({ ratioOverrides, silent: true });
    if (results.length === 0) return;

    const finalResult = results[results.length - 1];
    const totalSwap = results.reduce((sum, r) => sum + r.monthlySwap, 0);

    let minMaintenanceRate = Infinity;
    if (stressTestEnabled) {
      results.forEach(r => {
        if (r.stress && r.stress.maintenanceRate < minMaintenanceRate) {
          minMaintenanceRate = r.stress.maintenanceRate;
        }
      });
    }

    ratioResults.push({
      combo,  // [70, 30, 0, ...]
      ratioOverrides,
      label: currencies.map((c, i) => combo[i] > 0 ? `${c.name.split('/')[0]}${combo[i]}` : '').filter(s => s).join('/'),
      finalAssets: finalResult.totalAssets,
      totalSwap,
      finalLeverage: finalResult.leverage,
      minMaintenanceRate: minMaintenanceRate === Infinity ? null : minMaintenanceRate,
      riskAdjustedScore: 0
    });
  });

  // リスク調整スコアの計算
  // finalAssets = スワップ収入 + 含み損益（通貨下落損）を含む実質リターン
  // minMaintenanceRate = 暴落時の安全度（リスク指標）
  const normalize = (values) => {
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min || 1;
    return values.map(v => (v - min) / range);
  };

  const normalizedAssets = normalize(ratioResults.map(r => r.finalAssets));
  const normalizedSwaps = normalize(ratioResults.map(r => r.totalSwap));

  if (stressTestEnabled && ratioResults.some(r => r.minMaintenanceRate !== null)) {
    // 暴落防御モード: 実質リターン40% + 暴落安全性40% + スワップ収入20%
    ratioResults.forEach((r, i) => {
      let normalizedSafety = 1;
      if (r.minMaintenanceRate !== null) {
        if (r.minMaintenanceRate >= 300) normalizedSafety = 1.0;
        else if (r.minMaintenanceRate >= 100) normalizedSafety = (r.minMaintenanceRate - 100) / 200;
        else normalizedSafety = 0;
      }
      r.riskAdjustedScore = normalizedAssets[i] * 0.4 + normalizedSafety * 0.4 + normalizedSwaps[i] * 0.2;
    });
  } else {
    // 通常モード: 実質リターン（finalAssets）が全てを含む指標
    // finalAssets = 初期資金 + スワップ累計 + 含み損益（通貨下落損） - スプレッドコスト
    ratioResults.forEach((r, i) => {
      r.riskAdjustedScore = normalizedAssets[i];
    });
  }

  // 最適配分の決定
  const best = ratioResults.reduce((a, b) => a.riskAdjustedScore > b.riskAdjustedScore ? a : b);
  const months = parseInt(document.getElementById('compoundMonths').value) || 36;

  console.log(`配分最適化完了: 最適=${best.label}, 最終資産=¥${Math.round(best.finalAssets).toLocaleString()}` +
    (stressTestEnabled ? `, 最低維持率=${best.minMaintenanceRate?.toFixed(1)}%, スコア=${best.riskAdjustedScore.toFixed(3)}` : ''));

  // 結果セクションを表示
  const resultSection = document.getElementById('ratioOptResult');
  resultSection.style.display = 'block';

  // サマリー更新
  document.getElementById('optimalRatioSummary').textContent = best.label;
  document.getElementById('optimalRatioDetail').textContent =
    currencies.map((c, i) => `${c.name}: ${best.combo[i]}%`).join(' / ');
  document.getElementById('optimalFinalAssets').textContent = `¥${Math.round(best.finalAssets).toLocaleString()}`;
  document.getElementById('optimalAssetGrowth').textContent = `+¥${Math.round(best.finalAssets - initialCapital).toLocaleString()}`;
  document.getElementById('optimalTotalSwap').textContent = `¥${Math.round(best.totalSwap).toLocaleString()}`;
  document.getElementById('optimalMonthlySwap').textContent = `月平均 ¥${Math.round(best.totalSwap / months).toLocaleString()}`;

  const minRateEl = document.getElementById('optimalMinMaintenanceRate');
  const minRateDetailEl = document.getElementById('optimalMinMaintenanceDetail');
  if (minRateEl) {
    if (stressTestEnabled && best.minMaintenanceRate !== null) {
      minRateEl.textContent = `${best.minMaintenanceRate.toFixed(1)}%`;
      minRateDetailEl.textContent = best.minMaintenanceRate < 100 ? 'ロスカット圏' :
        best.minMaintenanceRate < 200 ? '警告圏' : '安全圏';
      minRateEl.closest('.result-item').style.display = '';
    } else {
      minRateEl.closest('.result-item').style.display = 'none';
    }
  }

  // チャートを描画（上位20件をソートして表示）
  const sortedResults = [...ratioResults].sort((a, b) => b.riskAdjustedScore - a.riskAdjustedScore);
  const topResults = sortedResults.slice(0, Math.min(20, sortedResults.length));
  renderRatioOptChart(topResults, best, stressTestEnabled);

  // 「適用して実行」ボタンのセットアップ
  const applyBtn = document.getElementById('applyOptimalRatioBtn');
  applyBtn.onclick = () => {
    currencies.forEach((c, i) => {
      const ratioInput = document.getElementById(`compound_${c.id}_ratio`);
      if (ratioInput) ratioInput.value = best.combo[i];
    });
    validateRatioSum();
    runCompoundSimulation();
  };

  resultSection.scrollIntoView({ behavior: 'smooth' });
}

function renderRatioOptChart(ratioResults, best, stressTestEnabled = false) {
  const ctx = document.getElementById('ratioOptChart');
  if (!ctx) return;

  if (ratioOptChart) {
    ratioOptChart.destroy();
  }

  const labels = ratioResults.map(r => r.label);
  const assetsData = ratioResults.map(r => Math.round(r.finalAssets));
  const swapData = ratioResults.map(r => Math.round(r.totalSwap));
  const bestIndex = ratioResults.findIndex(r => r.label === best.label);

  const barColors = ratioResults.map((r, i) =>
    i === bestIndex ? 'rgba(37, 99, 235, 0.9)' : 'rgba(37, 99, 235, 0.3)'
  );
  const barBorders = ratioResults.map((r, i) =>
    i === bestIndex ? 'rgba(37, 99, 235, 1)' : 'rgba(37, 99, 235, 0.5)'
  );

  const datasets = [
    {
      label: '最終資産（円）',
      data: assetsData,
      backgroundColor: barColors,
      borderColor: barBorders,
      borderWidth: 1,
      yAxisID: 'y',
      order: 3
    },
    {
      label: '総スワップ収益（円）',
      data: swapData,
      type: 'line',
      borderColor: '#10b981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      borderWidth: 2,
      pointRadius: 3,
      fill: true,
      yAxisID: 'y1',
      order: 2
    }
  ];

  const hasStressData = stressTestEnabled && ratioResults.some(r => r.minMaintenanceRate !== null);
  if (hasStressData) {
    const maintenanceData = ratioResults.map(r => r.minMaintenanceRate);
    const pointColors = maintenanceData.map(v =>
      v === null ? '#94a3b8' : v < 100 ? '#ef4444' : v < 200 ? '#f59e0b' : '#10b981'
    );
    datasets.push({
      label: '最低維持率（%）',
      data: maintenanceData,
      type: 'line',
      borderColor: '#ef4444',
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderDash: [6, 3],
      pointRadius: 5,
      pointBackgroundColor: pointColors,
      pointBorderColor: pointColors,
      yAxisID: 'y2',
      order: 1
    });
  }

  const scales = {
    y: {
      type: 'linear',
      position: 'left',
      title: { display: true, text: '最終資産（円）' },
      ticks: {
        callback: (v) => `¥${(v / 10000).toFixed(0)}万`
      }
    },
    y1: {
      type: 'linear',
      position: 'right',
      title: { display: true, text: '総スワップ収益（円）' },
      ticks: {
        callback: (v) => `¥${(v / 10000).toFixed(0)}万`
      },
      grid: { drawOnChartArea: false }
    }
  };

  if (hasStressData) {
    scales.y2 = {
      type: 'linear',
      position: 'right',
      title: { display: true, text: '最低維持率（%）' },
      ticks: { callback: (v) => `${v}%` },
      grid: { drawOnChartArea: false },
      afterFit: (axis) => { axis.paddingLeft = 10; }
    };
  }

  ratioOptChart = new Chart(ctx.getContext('2d'), {
    type: 'bar',
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { position: 'top' },
        tooltip: {
          callbacks: {
            title: (items) => items[0].label,
            label: (item) => {
              if (item.dataset.yAxisID === 'y2') {
                return `${item.dataset.label}: ${item.raw !== null ? item.raw.toFixed(1) + '%' : 'N/A'}`;
              }
              return `${item.dataset.label}: ¥${Math.round(item.raw).toLocaleString()}`;
            }
          }
        },
        annotation: bestIndex >= 0 ? {
          annotations: {
            bestLine: {
              type: 'line',
              xMin: bestIndex,
              xMax: bestIndex,
              borderColor: '#ef4444',
              borderWidth: 2,
              borderDash: [5, 5],
              label: {
                display: true,
                content: `最適: ${best.label}`,
                position: 'start',
                backgroundColor: '#ef4444',
                color: '#fff',
                font: { size: 11 }
              }
            }
          }
        } : {}
      },
      scales
    }
  });
}

// N通貨対応: 初期ポジション購入計算（上限到達時は他通貨に再配分）
function calculateInitialPurchaseN(capital, currencies, maxLeverage) {
  const maxNotional = capital * maxLeverage;
  const lots = {};
  currencies.forEach(c => { lots[c.id] = 0; });

  let unallocatedNotional = maxNotional;
  let activeRatios = currencies.map(c => ({ id: c.id, ratio: c.ratio, currency: c }));

  for (let round = 0; round < 3 && unallocatedNotional > 0; round++) {
    const totalRatio = activeRatios.reduce((s, r) => s + r.ratio, 0);
    if (totalRatio <= 0) break;

    const capped = [];
    let usedNotional = 0;

    activeRatios.forEach(r => {
      const c = r.currency;
      const notional = unallocatedNotional * (r.ratio / totalRatio);
      let lotCount = Math.floor(notional / (c.unit * c.rate));
      if (c.maxLots !== undefined && c.maxLots !== Infinity) {
        const cap = c.maxLots - lots[c.id];
        if (lotCount > cap) {
          lotCount = Math.max(0, cap);
          capped.push(c.id);
        }
      }
      lots[c.id] += lotCount;
      usedNotional += lotCount * c.unit * c.rate;
    });

    if (capped.length === 0) break;
    unallocatedNotional -= usedNotional;
    activeRatios = activeRatios.filter(r => !capped.includes(r.id));
  }

  let totalActualNotional = 0;
  currencies.forEach(c => { totalActualNotional += lots[c.id] * c.unit * c.rate; });

  return {
    lots: lots,
    totalMargin: totalActualNotional * 0.04
  };
}

// N通貨対応: 追加購入計算（currentLotsで現在保有数を考慮、上限到達時は他通貨に再配分）
function calculateAdditionalPurchaseN(availableCash, currencies, maxAdditionalNotional, currentLots) {
  const maxNotionalFromCash = availableCash / 0.04;
  const maxNotional = Math.min(maxNotionalFromCash, maxAdditionalNotional);
  const lots = {};
  currencies.forEach(c => { lots[c.id] = 0; });

  // 各通貨の残り枠を計算
  const remainingCapacity = {};
  currencies.forEach(c => {
    if (c.maxLots !== undefined && c.maxLots !== Infinity && currentLots) {
      remainingCapacity[c.id] = Math.max(0, c.maxLots - (currentLots[c.id] || 0));
    } else {
      remainingCapacity[c.id] = Infinity;
    }
  });

  // まず配分比率通りに計算し、上限で切った分を再配分
  let unallocatedNotional = maxNotional;
  let activeRatios = currencies.map(c => ({ id: c.id, ratio: c.ratio, currency: c }));

  for (let round = 0; round < 3 && unallocatedNotional > 0; round++) {
    const totalRatio = activeRatios.reduce((s, r) => s + r.ratio, 0);
    if (totalRatio <= 0) break;

    const capped = [];
    let usedNotional = 0;

    activeRatios.forEach(r => {
      const c = r.currency;
      const notional = unallocatedNotional * (r.ratio / totalRatio);
      let lotCount = Math.floor(notional / (c.unit * c.rate));

      // 残り枠で制限
      if (remainingCapacity[c.id] !== Infinity) {
        const cap = remainingCapacity[c.id] - lots[c.id];
        if (lotCount > cap) {
          lotCount = Math.max(0, cap);
          capped.push(c.id);
        }
      }

      lots[c.id] += lotCount;
      usedNotional += lotCount * c.unit * c.rate;
    });

    // 上限に達した通貨を除外して再配分
    if (capped.length === 0) break;
    unallocatedNotional -= usedNotional;
    activeRatios = activeRatios.filter(r => !capped.includes(r.id));
  }

  let totalActualNotional = 0;
  currencies.forEach(c => { totalActualNotional += lots[c.id] * c.unit * c.rate; });

  return {
    lots: lots,
    totalMargin: totalActualNotional * 0.04
  };
}

// 複利シミュレーション結果表示
function displayCompoundResults(results, initialCapital, reinvestCount, stressTestEnabled = false, crashSafeMode = false, maxSafeLeverage = Infinity, currencies = [], activeDefenseMode = null, compoundBroker = null, monthlyDeposit = 0, positionLimitHits = {}) {
  const broker = compoundBroker || currentBroker;
  const finalResult = results[results.length - 1];
  const totalMonths = results.length - 1;

  const totalSwap = results.reduce((sum, r) => sum + r.monthlySwap, 0);
  const monthlyAvgSwap = totalSwap / totalMonths;

  const totalDeposit = monthlyDeposit * totalMonths;
  const totalInvested = initialCapital + totalDeposit;
  const totalReturn = ((finalResult.totalAssets - totalInvested) / totalInvested) * 100;
  const years = totalMonths / 12;
  const annualizedReturn = (Math.pow(finalResult.totalAssets / totalInvested, 1 / years) - 1) * 100;

  document.getElementById('compoundFinalAssets').textContent = `¥${Math.round(finalResult.totalAssets).toLocaleString()}`;
  const growthText = totalDeposit > 0
    ? `投資総額¥${Math.round(totalInvested).toLocaleString()}比 +¥${Math.round(finalResult.totalAssets - totalInvested).toLocaleString()}`
    : `初期比 +¥${Math.round(finalResult.totalAssets - initialCapital).toLocaleString()}`;
  document.getElementById('compoundAssetGrowth').textContent = growthText;
  document.getElementById('compoundTotalSwap').textContent = `¥${Math.round(totalSwap).toLocaleString()}`;
  document.getElementById('compoundMonthlyAvgSwap').textContent = `月平均 ¥${Math.round(monthlyAvgSwap).toLocaleString()}`;
  document.getElementById('compoundTotalReturn').textContent = `${totalReturn >= 0 ? '+' : ''}${totalReturn.toFixed(1)}%`;
  document.getElementById('compoundAnnualizedReturn').textContent = `年率 ${annualizedReturn.toFixed(1)}%`;
  document.getElementById('compoundFinalLeverage').textContent = `${finalResult.leverage.toFixed(2)}倍`;

  // 追加入金サマリー表示
  const depositSummaryEl = document.getElementById('compoundDepositSummary');
  if (depositSummaryEl) {
    if (totalDeposit > 0) {
      depositSummaryEl.style.display = '';
      depositSummaryEl.querySelector('.value').textContent = `¥${Math.round(totalDeposit).toLocaleString()}`;
      depositSummaryEl.querySelector('.sub-value').textContent = `月¥${Math.round(monthlyDeposit).toLocaleString()} × ${totalMonths}ヶ月`;
    } else {
      depositSummaryEl.style.display = 'none';
    }
  }

  // 含み損益・スプレッド・純損益サマリー
  const finalUnrealizedPL = finalResult.unrealizedPL || 0;
  const finalCumulativeSwap = finalResult.cumulativeSwap || 0;
  const finalSpreadCost = finalResult.spreadCost || 0;
  const hasRateChangeResult = currencies.some(c => c.annualRateChange !== 0);
  const hasSpreadCost = finalSpreadCost > 0;
  const showBreakdown = hasRateChangeResult || hasSpreadCost;
  const netPL = finalCumulativeSwap + finalUnrealizedPL - finalSpreadCost;

  const plItem = document.getElementById('compoundUnrealizedPLItem');
  const spreadItem = document.getElementById('compoundSpreadCostItem');
  const netItem = document.getElementById('compoundNetPLItem');

  if (showBreakdown && plItem && netItem) {
    // 含み損益
    if (hasRateChangeResult) {
      plItem.style.display = '';
      const plEl = document.getElementById('compoundUnrealizedPL');
      plEl.textContent = `${finalUnrealizedPL >= 0 ? '+' : ''}¥${Math.round(finalUnrealizedPL).toLocaleString()}`;
      plEl.style.color = finalUnrealizedPL >= 0 ? 'var(--success)' : 'var(--danger)';
      document.getElementById('compoundUnrealizedPLDetail').textContent = `レート変動による評価損益`;
    } else {
      plItem.style.display = 'none';
    }

    // スプレッドコスト
    if (hasSpreadCost && spreadItem) {
      spreadItem.style.display = '';
      const spreadEl = document.getElementById('compoundSpreadCost');
      spreadEl.textContent = `-¥${Math.round(finalSpreadCost).toLocaleString()}`;
      spreadEl.style.color = 'var(--danger)';
      document.getElementById('compoundSpreadCostDetail').textContent = `全${reinvestCount}回の売買コスト`;
    } else if (spreadItem) {
      spreadItem.style.display = 'none';
    }

    // 純損益
    netItem.style.display = '';
    const netEl = document.getElementById('compoundNetPL');
    netEl.textContent = `${netPL >= 0 ? '+' : ''}¥${Math.round(netPL).toLocaleString()}`;
    netEl.style.color = netPL >= 0 ? 'var(--success)' : 'var(--danger)';

    let detail = `スワップ +¥${Math.round(finalCumulativeSwap).toLocaleString()}`;
    if (hasRateChangeResult) detail += ` / 含み損益 ${finalUnrealizedPL >= 0 ? '+' : ''}¥${Math.round(finalUnrealizedPL).toLocaleString()}`;
    if (hasSpreadCost) detail += ` / スプレッド -¥${Math.round(finalSpreadCost).toLocaleString()}`;
    document.getElementById('compoundNetPLDetail').textContent = detail;
  } else if (plItem && netItem) {
    plItem.style.display = 'none';
    netItem.style.display = 'none';
    if (spreadItem) spreadItem.style.display = 'none';
  }
  document.getElementById('compoundReinvestCount').textContent = `再投資 ${reinvestCount}回`;

  // ストレステスト サマリー
  const stressSummary = document.getElementById('stressTestSummary');
  if (stressTestEnabled && stressSummary) {
    stressSummary.style.display = 'grid';
    const stressResults = results.filter(r => r.stress !== null && r.stress !== undefined);
    if (stressResults.length > 0) {
      let minRate = Infinity;
      let minRateMonth = 0;
      let marginCallMonth = null;

      stressResults.forEach(r => {
        if (r.stress && r.stress.maintenanceRate < minRate) {
          minRate = r.stress.maintenanceRate;
          minRateMonth = r.month;
        }
        if (r.stress && r.stress.stressStatus === 'margin_call' && marginCallMonth === null) {
          marginCallMonth = r.month;
        }
      });

      document.getElementById('stressMostDangerousMonth').textContent = `${minRateMonth}ヶ月目`;
      document.getElementById('stressMostDangerousDetail').textContent =
        `維持率 ${minRate === Infinity ? '∞' : minRate.toFixed(1) + '%'}`;

      document.getElementById('stressMinMaintenanceRate').textContent =
        minRate === Infinity ? '∞' : `${minRate.toFixed(1)}%`;
      const compBroker = brokerInfo[broker];
      const compLosscutRate = compBroker?.losscutRate || 100;
      document.getElementById('stressMinMaintenanceDetail').textContent =
        minRate < compLosscutRate ? 'ロスカット圏' : minRate < 200 ? '警告圏' : '安全圏';

      const resultCard = document.getElementById('stressMarginCallResult').closest('.result-item');
      if (marginCallMonth !== null) {
        document.getElementById('stressMarginCallResult').textContent = 'ロスカット発生';
        document.getElementById('stressMarginCallDetail').textContent = `${marginCallMonth}ヶ月目（LC水準${compLosscutRate}%）`;
        resultCard.className = 'result-item stress-danger';
      } else {
        document.getElementById('stressMarginCallResult').textContent = '全期間耐久可能';
        document.getElementById('stressMarginCallDetail').textContent = `最低維持率 ${minRate.toFixed(1)}%（LC水準${compLosscutRate}%）`;
        resultCard.className = 'result-item stress-safe';
      }

      const existingNote = stressSummary.querySelector('.crash-safe-note');
      if (existingNote) existingNote.remove();
      const note = document.createElement('div');
      note.className = 'crash-safe-note';
      if (crashSafeMode && maxSafeLeverage < Infinity) {
        const isFullDefense = activeDefenseMode === 'fullDefense';
        if (isFullDefense) {
          note.style.cssText = 'grid-column: 1 / -1; background: linear-gradient(135deg, #fef3c7, #fde68a); border: 1px solid #f59e0b; border-radius: 8px; padding: 10px 14px; font-size: 0.85rem; color: #92400e;';
          note.innerHTML = `🛡️ <strong>暴落完全防御モード</strong>: レバレッジ上限を <strong>${maxSafeLeverage.toFixed(2)}倍</strong> に自動制限<br><small>歴史的最悪暴落率で維持率300%以上を確保</small>`;
        } else {
          note.style.cssText = 'grid-column: 1 / -1; background: linear-gradient(135deg, #eff6ff, #dbeafe); border: 1px solid #93c5fd; border-radius: 8px; padding: 10px 14px; font-size: 0.85rem; color: #1e40af;';
          note.innerHTML = `⚡ <strong>暴落耐性モード</strong>: レバレッジ上限を <strong>${maxSafeLeverage.toFixed(2)}倍</strong> に自動制限しています`;
        }
        stressSummary.appendChild(note);
      } else if (!crashSafeMode) {
        note.style.cssText = 'grid-column: 1 / -1; background: linear-gradient(135deg, #f0fdf4, #dcfce7); border: 1px solid #86efac; border-radius: 8px; padding: 10px 14px; font-size: 0.85rem; color: #166534;';
        note.innerHTML = `📊 <strong>レバレッジルールモード</strong>: 暴落発生時の維持率を参考表示（レバレッジ制限なし）`;
        stressSummary.appendChild(note);
      }
    }
  } else if (stressSummary) {
    stressSummary.style.display = 'none';
  }

  // 月次テーブル更新 — ヘッダーを動的に構築
  const tbody = document.getElementById('compoundMonthlyBody');
  tbody.innerHTML = '';

  const thead = document.querySelector('#compoundMonthlyTable thead tr');
  // 動的列をクリア
  thead.querySelectorAll('.stress-header, .currency-lot-header, .pl-header').forEach(th => th.remove());

  // 通貨ロット列ヘッダーを「総資産」の後に挿入
  const thAssets = thead.querySelectorAll('th')[1]; // 「総資産」
  const thLeverage = thAssets.nextElementSibling; // コメントの次の「レバレッジ」
  currencies.forEach(c => {
    const th = document.createElement('th');
    th.textContent = `${c.name}ロット`;
    th.classList.add('currency-lot-header');
    thead.insertBefore(th, thLeverage);
  });

  // 損益内訳列ヘッダー（レート変動またはスプレッドがある場合）
  const hasRateChange = currencies.some(c => c.annualRateChange !== 0);
  const hasSpread = results.some(r => (r.spreadCost || 0) > 0);
  const showPLColumns = hasRateChange || hasSpread;
  if (showPLColumns) {
    const headers = ['スワップ累計'];
    if (hasRateChange) headers.push('含み損益');
    if (hasSpread) headers.push('スプレッド累計');
    headers.push('純損益');
    headers.forEach(text => {
      const th = document.createElement('th');
      th.textContent = text;
      th.classList.add('pl-header');
      thead.appendChild(th);
    });
  }

  // ストレステスト列ヘッダー
  if (stressTestEnabled) {
    ['暴落後純資産', '維持率', '判定'].forEach(text => {
      const th = document.createElement('th');
      th.textContent = text;
      th.classList.add('stress-header');
      thead.appendChild(th);
    });
  }

  results.forEach(result => {
    const row = document.createElement('tr');
    if (result.milestone) row.classList.add('milestone-row');

    let actionClass = 'action-none';
    let actionText = '-';
    if (result.action === 'reinvest') { actionClass = 'action-reinvest'; actionText = '再投資'; }
    else if (result.action === 'accumulate') { actionClass = 'action-accumulate'; actionText = '貯蓄'; }
    else if (result.action === 'initial') { actionClass = 'action-reinvest'; actionText = '初期購入'; }

    // 基本列
    let html = `
      <td>${result.month}</td>
      <td>¥${Math.round(result.totalAssets).toLocaleString()}</td>
    `;

    // 各通貨のロット列（ブローカー単位で表示）
    currencies.forEach(c => {
      const lotCount = result.lots[c.id] || 0;
      const units = lotCount * c.unit;
      const brokerUnit = brokerSwapData[broker]?.[c.id]?.unit || c.unit;
      const brokerLots = lotCount * c.unit / brokerUnit;
      html += `<td>${brokerLots.toLocaleString()}lot<br><small>${units.toLocaleString()}通貨</small></td>`;
    });

    html += `
      <td>${result.leverage.toFixed(2)}倍</td>
      <td>¥${Math.round(result.monthlySwap).toLocaleString()}</td>
      <td class="${actionClass}">${actionText}</td>
    `;

    row.innerHTML = html;

    // 損益内訳列
    if (showPLColumns) {
      const tdSwapCum = document.createElement('td');
      tdSwapCum.textContent = `¥${Math.round(result.cumulativeSwap || 0).toLocaleString()}`;
      tdSwapCum.style.color = '#10b981';
      row.appendChild(tdSwapCum);

      if (hasRateChange) {
        const tdPL = document.createElement('td');
        const pl = result.unrealizedPL || 0;
        tdPL.textContent = `${pl >= 0 ? '+' : ''}¥${Math.round(pl).toLocaleString()}`;
        tdPL.style.color = pl >= 0 ? '#10b981' : '#ef4444';
        row.appendChild(tdPL);
      }

      if (hasSpread) {
        const tdSpread = document.createElement('td');
        const sc = result.spreadCost || 0;
        tdSpread.textContent = sc > 0 ? `-¥${Math.round(sc).toLocaleString()}` : '¥0';
        tdSpread.style.color = sc > 0 ? '#ef4444' : '';
        row.appendChild(tdSpread);
      }

      const tdNet = document.createElement('td');
      const net = (result.cumulativeSwap || 0) + (result.unrealizedPL || 0) - (result.spreadCost || 0);
      tdNet.textContent = `${net >= 0 ? '+' : ''}¥${Math.round(net).toLocaleString()}`;
      tdNet.style.color = net >= 0 ? '#10b981' : '#ef4444';
      tdNet.style.fontWeight = 'bold';
      row.appendChild(tdNet);
    }

    // ストレステスト列
    if (stressTestEnabled && result.stress) {
      const s = result.stress;

      const tdEquity = document.createElement('td');
      tdEquity.textContent = `¥${Math.round(s.postCrashEquity).toLocaleString()}`;
      if (s.postCrashEquity < 0) tdEquity.style.color = 'var(--danger)';
      row.appendChild(tdEquity);

      const tdRate = document.createElement('td');
      tdRate.textContent = s.maintenanceRate === Infinity ? '∞' : `${s.maintenanceRate.toFixed(1)}%`;
      row.appendChild(tdRate);

      const tdStatus = document.createElement('td');
      if (s.stressStatus === 'margin_call') {
        tdStatus.textContent = 'ロスカット'; tdStatus.className = 'stress-status-danger';
      } else if (s.stressStatus === 'warning') {
        tdStatus.textContent = '警告'; tdStatus.className = 'stress-status-warning';
      } else {
        tdStatus.textContent = '安全'; tdStatus.className = 'stress-status-safe';
      }
      row.appendChild(tdStatus);

      if (s.stressStatus === 'margin_call') row.classList.add('stress-row-danger');
      else if (s.stressStatus === 'warning') row.classList.add('stress-row-warning');
    }

    tbody.appendChild(row);
  });

  renderAssetGrowthChart(results);

  // 保有上限到達の警告表示
  const limitWarningEl = document.getElementById('compoundPositionLimitWarning');
  if (limitWarningEl) {
    const hitEntries = Object.values(positionLimitHits);
    if (hitEntries.length > 0) {
      const brokerName = brokerInfo[broker]?.name || broker;
      const warnings = hitEntries.map(h =>
        `${h.name}: ${h.month}ヶ月目に上限${h.maxLots.toLocaleString()}万通貨に到達`
      ).join('<br>');
      limitWarningEl.innerHTML = `<strong>${brokerName}の保有上限に到達:</strong><br>${warnings}<br><small>上限到達後はその通貨の追加購入が停止され、複利効果が制限されます。</small>`;
      limitWarningEl.style.display = '';
    } else {
      limitWarningEl.style.display = 'none';
    }
  }

  // 複利シミュ結果をグローバルに保存（軌道修正タブから参照）
  lastCompoundSimResults = results;
  lastCompoundSimCurrencies = currencies;

  document.getElementById('compoundResultSection').style.display = 'block';
  document.getElementById('compoundResultSection').scrollIntoView({ behavior: 'smooth' });
}

// 資産推移グラフ描画
function renderAssetGrowthChart(results) {
  const ctx = document.getElementById('assetGrowthChart');
  if (!ctx) return;

  if (assetGrowthChart) {
    assetGrowthChart.destroy();
  }

  const labels = results.map(r => `${r.month}ヶ月`);
  const assets = results.map(r => r.totalAssets);
  const leverage = results.map(r => r.leverage);

  const datasets = [
    {
      label: '総資産（円）',
      data: assets,
      borderColor: '#10b981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      fill: true,
      tension: 0.3,
      yAxisID: 'y'
    },
    {
      label: 'レバレッジ（倍）',
      data: leverage,
      borderColor: '#8b5cf6',
      backgroundColor: 'rgba(139, 92, 246, 0.1)',
      fill: false,
      tension: 0.3,
      yAxisID: 'y1',
      borderDash: [5, 5]
    }
  ];

  // ストレステストの暴落後純資産ラインを追加
  const hasStress = results.some(r => r.stress !== null && r.stress !== undefined);
  if (hasStress) {
    datasets.push({
      label: '暴落後純資産（円）',
      data: results.map(r => r.stress ? r.stress.postCrashEquity : null),
      borderColor: '#ef4444',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      fill: false,
      tension: 0.3,
      yAxisID: 'y',
      borderDash: [3, 3],
      pointRadius: 2
    });
  }

  assetGrowthChart = new Chart(ctx.getContext('2d'), {
    type: 'line',
    data: {
      labels: labels,
      datasets: datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      interaction: {
        mode: 'index',
        intersect: false
      },
      scales: {
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: {
            display: true,
            text: '総資産（円）'
          },
          ticks: {
            callback: function(value) {
              return '¥' + value.toLocaleString();
            }
          }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          title: {
            display: true,
            text: 'レバレッジ（倍）'
          },
          min: 0,
          max: 6,
          grid: {
            drawOnChartArea: false
          }
        }
      },
      plugins: {
        legend: {
          position: 'bottom'
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              if (context.datasetIndex === 0) {
                return `総資産: ¥${Math.round(context.raw).toLocaleString()}`;
              } else if (context.datasetIndex === 1) {
                return `レバレッジ: ${context.raw.toFixed(2)}倍`;
              } else if (context.datasetIndex === 2) {
                return `暴落後純資産: ¥${Math.round(context.raw).toLocaleString()}`;
              }
            }
          }
        }
      }
    }
  });
}

// タブ切り替え機能
function switchTab(tabId) {
  // タブボタンの状態更新
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelector(`.tab-btn[data-tab="${tabId}"]`).classList.add('active');

  // タブコンテンツの表示切替
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
    content.style.display = 'none';
  });
  const targetContent = document.getElementById(tabId + 'Section');
  if (targetContent) {
    targetContent.classList.add('active');
    targetContent.style.display = 'block';
  }

  // タブ固有の初期化
  if (tabId === 'rebalance') {
    initRebalance();
  }
}

// 複利シミュレーション用のイベントリスナー設定
function setupCompoundEventListeners() {
  // タブ切り替え
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tabId = e.currentTarget.dataset.tab;
      switchTab(tabId);
    });
  });

  // 通貨設定UIを動的生成
  renderCompoundCurrencyConfig();

  // 初期ブローカーのスワップ値を複利シミュに反映
  updateCompoundSwapsForBroker(currentBroker);
  updateCompoundBrokerInfo(currentBroker);

  // 複利シミュ: 証券会社選択ボタン
  document.querySelectorAll('.compound-broker-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.compound-broker-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const selectedBroker = btn.dataset.compoundBroker;
      updateCompoundSwapsForBroker(selectedBroker);
      updateCompoundBrokerInfo(selectedBroker);
    });
  });

  // 複利シミュ: ラジオボタンモード切替
  document.querySelectorAll('input[name="compoundMode"]').forEach(radio => {
    radio.addEventListener('change', () => {
      updateCrashRateVisibility();
    });
  });
  // 複利シミュ: 暴落想定期間トグル変更時にサマリー更新
  document.querySelectorAll('input[name="compoundCrashDuration"]').forEach(radio => {
    radio.addEventListener('change', updateCompoundCrashRateSummary);
  });

  // 最適化シミュ: 暴落完全防御と暴落耐性は排他的
  const optCrashSafe = document.getElementById('optimizerCrashSafe');
  const optCrashFullDefense = document.getElementById('optimizerCrashFullDefense');
  if (optCrashSafe && optCrashFullDefense) {
    optCrashFullDefense.addEventListener('change', () => {
      if (optCrashFullDefense.checked) optCrashSafe.checked = false;
      updateOptimizerCrashRateSummary();
    });
    optCrashSafe.addEventListener('change', () => {
      if (optCrashSafe.checked) optCrashFullDefense.checked = false;
      updateOptimizerCrashRateSummary();
    });
  }
  // 最適化シミュ: 暴落想定期間トグル変更時にサマリー更新
  document.querySelectorAll('input[name="optimizerCrashDuration"]').forEach(radio => {
    radio.addEventListener('change', updateOptimizerCrashRateSummary);
  });

  // シミュレーション実行ボタン
  const runBtn = document.getElementById('runCompoundSimBtn');
  if (runBtn) {
    runBtn.addEventListener('click', () => {
      document.body.classList.add('loading');
      setTimeout(() => {
        try {
          runCompoundSimulation();
        } catch (error) {
          console.error('複利シミュレーションエラー:', error);
          alert('シミュレーション中にエラーが発生しました: ' + error.message);
        }
        document.body.classList.remove('loading');
      }, 100);
    });
  }

  // 配分最適化ボタン
  const optimizeRatioBtn = document.getElementById('optimizeRatioBtn');
  if (optimizeRatioBtn) {
    optimizeRatioBtn.addEventListener('click', () => {
      document.body.classList.add('loading');
      setTimeout(() => {
        try {
          optimizeCompoundRatio();
        } catch (error) {
          console.error('配分最適化エラー:', error);
          alert('最適化中にエラーが発生しました: ' + error.message);
        }
        document.body.classList.remove('loading');
      }, 100);
    });
  }
}

// 複利シミュレーション結果を保持するグローバル変数
let lastCompoundSimResults = null;
let lastCompoundSimCurrencies = null;

// ============================================================
// 軌道修正シミュレーター（ポートフォリオ最適化ベース）
// ============================================================

let rebalanceBroker = 'gmo';
let rebalanceInitialized = false;

function initRebalance() {
  if (rebalanceInitialized) return;
  rebalanceInitialized = true;

  // 証券会社選択ボタン
  document.querySelectorAll('.rebalance-broker-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.rebalance-broker-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      rebalanceBroker = btn.dataset.rebalanceBroker;
    });
  });

  // ポジション行追加ボタン
  document.getElementById('addRebalancePositionBtn').addEventListener('click', () => {
    addRebalancePositionRow();
  });

  // ポートフォリオ読み込みボタン
  document.getElementById('loadPortfolioToRebalanceBtn').addEventListener('click', () => {
    loadPortfolioToRebalance();
  });

  // 最適化目標の変更時、入力欄の表示切替
  document.getElementById('rebalanceTarget').addEventListener('change', (e) => {
    const isCompound = e.target.value === 'compound';
    document.getElementById('rebalanceOptimizerGroup').style.display = isCompound ? 'none' : 'block';

    const hint = document.getElementById('rebalanceCompoundHint');
    if (isCompound) {
      const hasResults = lastCompoundSimResults && lastCompoundSimResults.length > 0;
      hint.style.display = hasResults ? 'none' : 'block';
    } else {
      hint.style.display = 'none';
    }
  });

  // 暴落モード排他制御
  const rbCrashSafe = document.getElementById('rebalanceCrashSafe');
  const rbCrashFull = document.getElementById('rebalanceCrashFullDefense');
  rbCrashFull.addEventListener('change', () => {
    if (rbCrashFull.checked) rbCrashSafe.checked = false;
    updateRebalanceCrashRateSummary();
  });
  rbCrashSafe.addEventListener('change', () => {
    if (rbCrashSafe.checked) rbCrashFull.checked = false;
    updateRebalanceCrashRateSummary();
  });
  // 軌道修正: 暴落想定期間トグル変更時にサマリー更新
  document.querySelectorAll('input[name="rebalanceCrashDuration"]').forEach(radio => {
    radio.addEventListener('change', updateRebalanceCrashRateSummary);
  });

  // 診断＆調整プラン作成ボタン
  document.getElementById('runRebalanceBtn').addEventListener('click', () => {
    runRebalanceSimulation();
  });

  // 初期行を1つ追加
  addRebalancePositionRow();
}

function getRebalanceCurrencyOptions(broker) {
  const swapData = brokerSwapData[broker];
  if (!swapData) return [];
  return baseCurrencyPairs.filter(p => {
    const data = swapData[p.id];
    return data !== null && data !== undefined;
  });
}

function addRebalancePositionRow(preset) {
  const tbody = document.getElementById('rebalancePositionBody');
  const row = document.createElement('tr');
  const availablePairs = getRebalanceCurrencyOptions(rebalanceBroker);

  const selectedPairId = preset ? preset.currencyPair : (availablePairs[0]?.id || '');
  const pairOptions = availablePairs.map(p =>
    `<option value="${p.id}" ${p.id === selectedPairId ? 'selected' : ''}>${p.name} (${p.fullName})</option>`
  ).join('');

  const direction = preset ? preset.direction : 'long';
  const lots = preset ? preset.lots : '';
  // 現在レート: presetにcurrentRateがあればそれを使う、なければbaseCurrencyPairsから取得
  const defaultRate = baseCurrencyPairs.find(p => p.id === selectedPairId)?.rate || '';
  const currentRate = preset?.currentRate || defaultRate;

  row.innerHTML = `
    <td><select class="rb-pair">${pairOptions}</select></td>
    <td><select class="rb-direction">
      <option value="long" ${direction === 'long' ? 'selected' : ''}>買い</option>
      <option value="short" ${direction === 'short' ? 'selected' : ''}>売り</option>
    </select></td>
    <td><input type="number" class="rb-lots" value="${lots}" min="0.1" step="0.1" placeholder="ロット"></td>
    <td><input type="number" class="rb-current-rate" value="${currentRate}" step="0.001" placeholder="レート"></td>
    <td><button class="rb-remove-btn" title="削除">&times;</button></td>
  `;

  // 通貨ペア変更時にデフォルトレートを更新
  row.querySelector('.rb-pair').addEventListener('change', (e) => {
    const pair = baseCurrencyPairs.find(p => p.id === e.target.value);
    if (pair) {
      row.querySelector('.rb-current-rate').value = pair.rate;
    }
  });

  row.querySelector('.rb-remove-btn').addEventListener('click', () => {
    row.remove();
    updateRebalanceHint();
  });

  tbody.appendChild(row);
  updateRebalanceHint();
}

function updateRebalanceHint() {
  const rows = document.querySelectorAll('#rebalancePositionBody tr');
  const hint = document.getElementById('rebalancePositionHint');
  hint.style.display = rows.length === 0 ? 'block' : 'none';
}

function loadPortfolioToRebalance() {
  const positions = DataStore.getPositions();
  if (!positions || positions.length === 0) {
    alert('ポートフォリオ管理にポジションが登録されていません。先にポートフォリオ管理タブでポジションを登録してください。');
    return;
  }

  // 既存の行をクリア
  document.getElementById('rebalancePositionBody').innerHTML = '';

  // ブローカーを最初のポジションから設定
  if (positions[0].broker) {
    rebalanceBroker = positions[0].broker;
    document.querySelectorAll('.rebalance-broker-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.rebalanceBroker === rebalanceBroker);
    });
  }

  // ポジションを行として追加（現在レートはbaseCurrencyPairsから自動取得）
  positions.forEach(pos => {
    addRebalancePositionRow({
      currencyPair: pos.currencyPair,
      direction: pos.direction,
      lots: pos.lots,
    });
  });

  alert(`${positions.length}件のポジションを読み込みました。`);
}

function getCurrentPositionsFromTable() {
  const rows = document.querySelectorAll('#rebalancePositionBody tr');
  const positions = [];

  rows.forEach(row => {
    const pairId = row.querySelector('.rb-pair')?.value;
    const direction = row.querySelector('.rb-direction')?.value;
    const lots = parseFloat(row.querySelector('.rb-lots')?.value) || 0;
    const currentRate = parseFloat(row.querySelector('.rb-current-rate')?.value) || 0;

    if (pairId && lots > 0) {
      positions.push({ pairId, direction, lots, currentRate });
    }
  });

  return positions;
}

// メイン実行関数: 診断→最適化→調整プラン生成→表示
function runRebalanceSimulation() {
  const positions = getCurrentPositionsFromTable();
  if (positions.length === 0) {
    alert('少なくとも1つのポジションを入力してください。');
    return;
  }

  const balance = parseFloat(document.getElementById('rebalanceCapital').value) || 0;
  const unrealizedPnL = parseFloat(document.getElementById('rebalanceUnrealizedPnL').value) || 0;
  const capital = balance + unrealizedPnL;
  if (capital <= 0) {
    alert('有効証拠金（口座残高＋評価損益）が0以下です。');
    return;
  }

  const targetType = document.getElementById('rebalanceTarget').value;

  // === 複利シミュレーションの理想に合わせるモード ===
  if (targetType === 'compound') {
    runRebalanceCompoundMode(positions, capital);
    return;
  }

  const targetLeverage = parseFloat(document.getElementById('rebalanceTargetLeverage').value) || 25;
  const allowShorts = document.getElementById('rebalanceAllowShorts').checked;
  const crashSafe = document.getElementById('rebalanceCrashSafe').checked;
  const crashFullDefense = document.getElementById('rebalanceCrashFullDefense').checked;

  // 選択中のブローカーで通貨ペアデータを構築
  const swapData = brokerSwapData[rebalanceBroker];
  const brokerMaxPos = brokerInfo[rebalanceBroker]?.maxPositions || {};

  const pairs = baseCurrencyPairs.map(pair => {
    const data = swapData ? swapData[pair.id] : null;
    if (!data) return null;
    const maxPos = brokerMaxPos[pair.id] !== undefined ? brokerMaxPos[pair.id] : pair.maxPosition;
    return {
      ...pair,
      swapBuy: data.swapBuy,
      swapSell: data.swapSell,
      unit: data.unit,
      enabled: true,
      maxPosition: maxPos
    };
  }).filter(p => p !== null);

  const OPTIMIZATION_UNIT = 1000;

  // === Step 1: 現在のポジションを1000通貨単位のロット配列に変換 ===
  // ユーザーが入力した現在レートで診断する（証券会社と同じレバレッジになる）
  const diagPairs = pairs.map(p => ({ ...p }));
  const currentLots = pairs.map(() => 0);
  positions.forEach(pos => {
    const idx = pairs.findIndex(p => p.id === pos.pairId);
    if (idx >= 0) {
      const pair = pairs[idx];
      const lotsIn1000 = pos.lots * (pair.unit / OPTIMIZATION_UNIT);
      currentLots[idx] += (pos.direction === 'long' ? lotsIn1000 : -lotsIn1000);
      if (pos.currentRate > 0) {
        diagPairs[idx].rate = pos.currentRate;
      }
    }
  });

  // === Step 2: 現在のポートフォリオ診断（ユーザー入力の現在レートベース） ===
  const lotValues = diagPairs.map(p => p.rate * OPTIMIZATION_UNIT);
  const lotVolatilities = diagPairs.map(p => (p.volatility / 100) * p.rate * OPTIMIZATION_UNIT);

  const currentResults = calculateResultsByLotsCorrect(diagPairs, currentLots, capital, lotValues, lotVolatilities);
  const diagnosis = diagnoseCurrent(diagPairs, currentLots, currentResults, capital, lotValues, lotVolatilities, crashFullDefense);

  displayDiagnosis(diagnosis, capital);

  // === Step 3: 理想ポートフォリオの計算 ===
  document.body.classList.add('loading');

  setTimeout(() => {
    try {
      // 最適化に渡すため、全通貨を有効にする
      const optPairs = pairs.map(p => ({ ...p, enabled: true }));

      const idealResults = optimizeMaxSharpeRatio(optPairs, capital, targetLeverage, allowShorts);

      if (!idealResults) {
        alert('最適化に失敗しました。');
        document.body.classList.remove('loading');
        return;
      }

      // 暴落防御モードの適用
      if (crashFullDefense || crashSafe) {
        applyRebalanceCrashDefense(idealResults, capital, crashFullDefense);
      }

      // === Step 4: 調整プラン生成 ===
      const idealLots = idealResults.weights || idealResults.allocations.map(a => a.lots);
      const adjustments = generateAdjustmentPlan(pairs, currentLots, idealLots, lotValues, lotVolatilities, capital);

      // === Step 5: 表示 ===
      displayAdjustmentPlan(diagnosis, idealResults, adjustments, pairs, capital);

      document.getElementById('rebalanceAdjustmentSection').style.display = 'block';
      document.getElementById('rebalanceAdjustmentSection').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      console.error('軌道修正シミュレーション中にエラー:', error);
      alert('エラーが発生しました: ' + error.message);
    }
    document.body.classList.remove('loading');
  }, 100);
}

// 複利シミュレーション結果に基づく軌道修正
function runRebalanceCompoundMode(positions, capital) {
  const crashFullDefense = document.getElementById('rebalanceCrashFullDefense')?.checked || false;
  const simResults = lastCompoundSimResults;
  const currencies = lastCompoundSimCurrencies;

  if (!simResults || simResults.length === 0 || !currencies) {
    alert('先に「複利シミュレーター」タブでシミュレーションを実行してください。');
    return;
  }

  // 口座残高に最も近い時点をシミュ結果から探す
  let bestMonth = 0;
  let bestDiff = Infinity;
  for (let m = 0; m < simResults.length; m++) {
    const diff = Math.abs(simResults[m].totalAssets - capital);
    if (diff < bestDiff) {
      bestDiff = diff;
      bestMonth = m;
    }
  }
  // 月0（初期状態）の場合は月1を使う（ロットが0のため）
  if (bestMonth === 0 && simResults.length > 1) bestMonth = 1;

  // 選択中のブローカーで通貨ペアデータを構築
  const swapData = brokerSwapData[rebalanceBroker];
  const brokerMaxPos = brokerInfo[rebalanceBroker]?.maxPositions || {};

  const pairs = baseCurrencyPairs.map(pair => {
    const data = swapData ? swapData[pair.id] : null;
    if (!data) return null;
    const maxPos = brokerMaxPos[pair.id] !== undefined ? brokerMaxPos[pair.id] : pair.maxPosition;
    return {
      ...pair,
      swapBuy: data.swapBuy,
      swapSell: data.swapSell,
      unit: data.unit,
      enabled: true,
      maxPosition: maxPos
    };
  }).filter(p => p !== null);

  const OPTIMIZATION_UNIT = 1000;

  // === Step 1: 現在のポジションを1000通貨単位のロット配列に変換 ===
  const diagPairs = pairs.map(p => ({ ...p }));
  const currentLots = pairs.map(() => 0);
  positions.forEach(pos => {
    const idx = pairs.findIndex(p => p.id === pos.pairId);
    if (idx >= 0) {
      const pair = pairs[idx];
      const lotsIn1000 = pos.lots * (pair.unit / OPTIMIZATION_UNIT);
      currentLots[idx] += (pos.direction === 'long' ? lotsIn1000 : -lotsIn1000);
      if (pos.currentRate > 0) {
        diagPairs[idx].rate = pos.currentRate;
      }
    }
  });

  // === Step 2: 現在のポートフォリオ診断（ユーザー入力の現在レートベース） ===
  const lotValues = diagPairs.map(p => p.rate * OPTIMIZATION_UNIT);
  const lotVolatilities = diagPairs.map(p => (p.volatility / 100) * p.rate * OPTIMIZATION_UNIT);

  const currentResults = calculateResultsByLotsCorrect(diagPairs, currentLots, capital, lotValues, lotVolatilities);
  const diagnosis = diagnoseCurrent(diagPairs, currentLots, currentResults, capital, lotValues, lotVolatilities, crashFullDefense);
  displayDiagnosis(diagnosis, capital);

  // === Step 3: 複利シミュの理想ロットを取得（口座残高に最も近い時点） ===
  const idealState = simResults[bestMonth];
  const idealLotsFromSim = idealState.lots; // { HUF: 5, TRY: 3, ... } ブローカー単位

  // 複利シミュのロット（ブローカー単位）を1000通貨単位に変換し、pairsの配列に合わせる
  const idealLots = pairs.map(pair => {
    const compCurrency = currencies.find(c => c.id === pair.id);
    if (!compCurrency) return 0;
    const brokerLots = idealLotsFromSim[pair.id] || 0;
    // ブローカー単位のロット × (通貨の単位 / 1000) = 1000通貨単位
    return brokerLots * (compCurrency.unit / OPTIMIZATION_UNIT);
  });

  // === Step 4: 理想ポートフォリオの結果計算 ===
  const idealResults = calculateResultsByLotsCorrect(pairs, idealLots, capital, lotValues, lotVolatilities);

  // idealResults に allocations がない場合の互換対応
  if (!idealResults.allocations) {
    idealResults.allocations = pairs.map((pair, i) => ({
      pair,
      lots: idealLots[i],
      units: idealLots[i] * OPTIMIZATION_UNIT,
      position: idealLots[i] >= 0 ? 'long' : 'short',
      displayLots: idealLots[i] * OPTIMIZATION_UNIT / pair.unit,
      annualSwap: 0,
      margin: Math.abs(idealLots[i]) * lotValues[i] * pair.marginRate,
      actualAmount: Math.abs(idealLots[i]) * lotValues[i],
    }));
  }

  // === Step 5: 調整プラン生成＆表示 ===
  const adjustments = generateAdjustmentPlan(pairs, currentLots, idealLots, lotValues, lotVolatilities, capital);

  displayAdjustmentPlan(diagnosis, idealResults, adjustments, pairs, capital);

  document.getElementById('rebalanceAdjustmentSection').style.display = 'block';
  document.getElementById('rebalanceAdjustmentSection').scrollIntoView({ behavior: 'smooth' });
}

function applyRebalanceCrashDefense(results, capital, isFullDefense) {
  const targetMaintenanceRate = isFullDefense ? 3.0 : 2.0;
  let totalUnrealizedLoss = 0;
  let postCrashNotional = 0;

  const useDailyRebalance = document.querySelector('input[name="rebalanceCrashDuration"]:checked')?.value === 'daily';
  results.allocations.forEach(alloc => {
    if (alloc.lots === 0) return;
    const crashRate = isFullDefense
      ? ((useDailyRebalance ? alloc.pair.historicalWorstDailyDrop : alloc.pair.historicalWorstCrashDrop) || alloc.pair.maxCrashDrop || 10) / 100
      : ((useDailyRebalance ? alloc.pair.maxDailyDrop : alloc.pair.maxCrashDrop) || 10) / 100;
    const absUnits = Math.abs(alloc.units);
    const currentNotional = absUnits * alloc.pair.rate;
    const unrealizedLoss = alloc.position === 'long'
      ? currentNotional * crashRate
      : -(currentNotional * crashRate);
    totalUnrealizedLoss += unrealizedLoss;
    postCrashNotional += currentNotional * (1 - crashRate);
  });

  const denom = totalUnrealizedLoss + postCrashNotional * 0.04 * targetMaintenanceRate;
  if (denom > 0) {
    const scale = (capital / denom) * 0.99;
    results.allocations.forEach(alloc => {
      alloc.units = Math.round(alloc.units * scale);
      alloc.lots = alloc.lots * scale;
      alloc.displayLots = alloc.displayLots * scale;
      alloc.margin = alloc.margin * scale;
      alloc.annualSwap = alloc.annualSwap * scale;
      alloc.actualAmount = alloc.actualAmount * scale;
    });
    results.totalAnnualSwap *= scale;
    results.totalMargin *= scale;
    if (results.riskYen) results.riskYen *= scale;
    if (results.depreciationLoss) results.depreciationLoss *= scale;
    if (results.netAnnualReturn) results.netAnnualReturn *= scale;
    if (results.weights) results.weights = results.weights.map(w => w * scale);
  }
}

function diagnoseCurrent(pairs, lots, results, capital, lotValues, lotVolatilities, isFullDefense = false) {
  const annualToDailyFactor = Math.sqrt(252);
  const dailyRisk = results.riskYen ? results.riskYen / annualToDailyFactor : 0;
  const totalInvestment = results.allocations.reduce((sum, a) => sum + a.actualAmount, 0);
  const leverage = capital > 0 ? totalInvestment / capital : 0;
  const dailySwap = results.totalAnnualSwap / 365;

  // 暴落シミュレーション
  const useDailyDiag = document.querySelector('input[name="rebalanceCrashDuration"]:checked')?.value === 'daily';
  let totalCrashLoss = 0;
  let postCrashMargin = 0;

  results.allocations.forEach(alloc => {
    if (alloc.lots === 0) return;
    const crashRate = isFullDefense
      ? ((useDailyDiag ? alloc.pair.historicalWorstDailyDrop : alloc.pair.historicalWorstCrashDrop) || alloc.pair.maxCrashDrop || 10) / 100
      : ((useDailyDiag ? alloc.pair.maxDailyDrop : alloc.pair.maxCrashDrop) || 10) / 100;
    const absUnits = Math.abs(alloc.units);
    const notional = absUnits * alloc.pair.rate;

    if (alloc.position === 'long') {
      totalCrashLoss += notional * crashRate;
    } else {
      totalCrashLoss -= notional * crashRate;
    }
    postCrashMargin += notional * (1 - crashRate) * alloc.pair.marginRate;
  });

  const postCrashEquity = capital - totalCrashLoss;
  const maintenanceRate = postCrashMargin > 0 ? (postCrashEquity / postCrashMargin) * 100 : Infinity;
  const losscutRate = brokerInfo[rebalanceBroker]?.losscutRate || 100;

  return {
    annualSwap: results.totalAnnualSwap,
    dailySwap,
    annualRisk: results.riskYen || 0,
    dailyRisk,
    leverage,
    sharpe: results.sharpe || 0,
    totalMargin: results.totalMargin,
    totalInvestment,
    // ストレステスト
    postCrashEquity,
    totalCrashLoss,
    maintenanceRate,
    losscutRate,
    isLosscutRisk: maintenanceRate < losscutRate
  };
}

function displayDiagnosis(d, capital) {
  const section = document.getElementById('rebalanceDiagnosisSection');
  section.style.display = 'block';

  document.getElementById('rbCurrentSwap').textContent = `¥${Math.round(d.annualSwap).toLocaleString()} / 年`;
  document.getElementById('rbCurrentDailySwap').textContent = `¥${Math.round(d.dailySwap).toLocaleString()}`;

  document.getElementById('rbCurrentRisk').textContent = `¥${Math.round(d.annualRisk).toLocaleString()} / 年`;
  document.getElementById('rbCurrentDailyRisk').textContent = `¥${Math.round(d.dailyRisk).toLocaleString()}`;

  document.getElementById('rbCurrentLeverage').textContent = `${d.leverage.toFixed(2)}倍`;
  document.getElementById('rbCurrentMargin').textContent = `必要証拠金: ¥${Math.round(d.totalMargin).toLocaleString()}`;

  document.getElementById('rbCurrentSharpe').textContent = d.sharpe.toFixed(3);
  const sharpeLevel = d.sharpe >= 2.0 ? '優秀' : d.sharpe >= 1.0 ? '良い' : d.sharpe >= 0.5 ? '普通' : '低い';
  document.getElementById('rbCurrentSharpeDetail').textContent = `評価: ${sharpeLevel}`;

  // ストレステスト
  document.getElementById('rbStressEquity').textContent = `¥${Math.round(d.postCrashEquity).toLocaleString()}`;
  document.getElementById('rbStressLoss').textContent = `含み損: ¥${Math.round(d.totalCrashLoss).toLocaleString()}`;

  const maintenanceEl = document.getElementById('rbStressMaintenanceRate');
  maintenanceEl.textContent = d.maintenanceRate === Infinity ? '∞' : `${d.maintenanceRate.toFixed(1)}%`;

  document.getElementById('rbStressMaintenanceDetail').textContent =
    `ロスカット水準: ${d.losscutRate}%`;

  const verdictEl = document.getElementById('rbStressVerdict');
  const verdictDetailEl = document.getElementById('rbStressVerdictDetail');
  if (d.isLosscutRisk) {
    verdictEl.textContent = 'ロスカットリスクあり';
    verdictEl.style.color = '#dc2626';
    verdictDetailEl.textContent = '暴落時にロスカットされる可能性があります';
  } else if (d.maintenanceRate < 200) {
    verdictEl.textContent = '要注意';
    verdictEl.style.color = '#f59e0b';
    verdictDetailEl.textContent = '維持率200%未満。暴落耐性が不十分です';
  } else {
    verdictEl.textContent = '安全';
    verdictEl.style.color = '#16a34a';
    verdictDetailEl.textContent = '十分な余裕があります';
  }
}

function generateAdjustmentPlan(pairs, currentLots, idealLots, lotValues, lotVolatilities, capital) {
  const OPTIMIZATION_UNIT = 1000;
  const adjustments = [];

  for (let i = 0; i < pairs.length; i++) {
    const pair = pairs[i];
    const cur = currentLots[i];
    const ideal = idealLots[i];
    const diff = ideal - cur;

    // 現在と理想のスワップ
    const swapPer1000Buy = pair.swapBuy / (pair.unit / OPTIMIZATION_UNIT);
    const swapPer1000Sell = pair.swapSell / (pair.unit / OPTIMIZATION_UNIT);

    const curDailySwap = cur > 0 ? cur * swapPer1000Buy : (cur < 0 ? Math.abs(cur) * swapPer1000Sell : 0);
    const idealDailySwap = ideal > 0 ? ideal * swapPer1000Buy : (ideal < 0 ? Math.abs(ideal) * swapPer1000Sell : 0);
    const swapChange = (idealDailySwap - curDailySwap) * 365;

    // アクション判定
    let action, actionClass;
    if (cur === 0 && ideal !== 0) {
      action = '新規建て'; actionClass = 'add-new';
    } else if (cur !== 0 && ideal === 0) {
      action = '全決済'; actionClass = 'close-all';
    } else if (cur > 0 && ideal < 0 || cur < 0 && ideal > 0) {
      action = '反転'; actionClass = 'reverse';
    } else if (Math.abs(diff) < 1) {
      action = '維持'; actionClass = 'keep';
    } else if (diff > 0 && cur >= 0 || diff < 0 && cur < 0) {
      action = '増ロット'; actionClass = 'increase';
    } else {
      action = '減ロット'; actionClass = 'decrease';
    }

    // ロット数を証券会社の単位で表示
    const curDisplay = cur * OPTIMIZATION_UNIT / pair.unit;
    const idealDisplay = ideal * OPTIMIZATION_UNIT / pair.unit;
    const diffDisplay = diff * OPTIMIZATION_UNIT / pair.unit;

    // インパクト（スワップ変化の絶対値で優先度を計算）
    const impact = Math.abs(swapChange);

    adjustments.push({
      pair,
      action,
      actionClass,
      currentLots: cur,
      idealLots: ideal,
      diffLots: diff,
      currentDisplay: curDisplay,
      idealDisplay: idealDisplay,
      diffDisplay: diffDisplay,
      swapChange,
      impact,
      currentDirection: cur > 0 ? '買い' : (cur < 0 ? '売り' : '-'),
      idealDirection: ideal > 0 ? '買い' : (ideal < 0 ? '売り' : '-')
    });
  }

  // インパクト順にソート（大きい順）
  adjustments.sort((a, b) => b.impact - a.impact);
  return adjustments;
}

function displayAdjustmentPlan(diagnosis, idealResults, adjustments, pairs, capital) {
  // サマリー: 変化量
  const idealAnnualSwap = idealResults.totalAnnualSwap;
  const idealRisk = idealResults.riskYen || 0;
  const idealTotalInvestment = idealResults.allocations.reduce((sum, a) => sum + a.actualAmount, 0);
  const idealLeverage = capital > 0 ? idealTotalInvestment / capital : 0;
  const idealSharpe = idealResults.sharpe || 0;

  const swapDiff = idealAnnualSwap - diagnosis.annualSwap;
  const riskDiff = idealRisk - diagnosis.annualRisk;
  const leverageDiff = idealLeverage - diagnosis.leverage;
  const sharpeDiff = idealSharpe - diagnosis.sharpe;

  const formatDiff = (v, prefix = '¥') => {
    const sign = v >= 0 ? '+' : '-';
    return `${sign}${prefix}${Math.round(Math.abs(v)).toLocaleString()}`;
  };

  document.getElementById('rbSwapChange').textContent = formatDiff(swapDiff) + ' / 年';
  document.getElementById('rbSwapChange').style.color = swapDiff >= 0 ? '#16a34a' : '#dc2626';
  document.getElementById('rbSwapChangeDetail').textContent =
    `現在: ¥${Math.round(diagnosis.annualSwap).toLocaleString()} → 理想: ¥${Math.round(idealAnnualSwap).toLocaleString()}`;

  document.getElementById('rbRiskChange').textContent = formatDiff(riskDiff) + ' / 年';
  document.getElementById('rbRiskChange').style.color = riskDiff <= 0 ? '#16a34a' : '#dc2626';
  document.getElementById('rbRiskChangeDetail').textContent =
    `現在: ¥${Math.round(diagnosis.annualRisk).toLocaleString()} → 理想: ¥${Math.round(idealRisk).toLocaleString()}`;

  const leverageSign = leverageDiff >= 0 ? '+' : '';
  document.getElementById('rbLeverageChange').textContent = `${leverageSign}${leverageDiff.toFixed(2)}倍`;
  document.getElementById('rbLeverageChange').style.color = '#1e293b';
  document.getElementById('rbLeverageChangeDetail').textContent =
    `現在: ${diagnosis.leverage.toFixed(2)}倍 → 理想: ${idealLeverage.toFixed(2)}倍`;

  const sharpeSign = sharpeDiff >= 0 ? '+' : '';
  document.getElementById('rbSharpeChange').textContent = `${sharpeSign}${sharpeDiff.toFixed(3)}`;
  document.getElementById('rbSharpeChange').style.color = sharpeDiff >= 0 ? '#16a34a' : '#dc2626';
  document.getElementById('rbSharpeChangeDetail').textContent =
    `現在: ${diagnosis.sharpe.toFixed(3)} → 理想: ${idealSharpe.toFixed(3)}`;

  // 差分テーブル
  const tbody = document.getElementById('rebalanceAdjustmentBody');
  tbody.innerHTML = '';

  const maxImpact = Math.max(...adjustments.map(a => a.impact), 1);

  adjustments.forEach(adj => {
    const row = document.createElement('tr');
    const diffSign = adj.diffDisplay >= 0 ? '+' : '';
    const swapSign = adj.swapChange >= 0 ? '+' : '';
    const swapClass = adj.swapChange >= 0 ? 'swap-positive' : 'swap-negative';
    const priorityPct = (adj.impact / maxImpact) * 100;

    // 現在のロット表示
    const curText = adj.currentLots === 0 ? '-' : `${adj.currentDirection} ${Math.abs(adj.currentDisplay).toFixed(1)}ロット`;
    // 理想のロット表示
    const idealText = adj.idealLots === 0 ? '-' : `${adj.idealDirection} ${Math.abs(adj.idealDisplay).toFixed(1)}ロット`;

    row.innerHTML = `
      <td><strong>${adj.pair.name}</strong><br><small>${adj.pair.fullName}</small></td>
      <td><span class="action-badge ${adj.actionClass}">${adj.action}</span></td>
      <td>${curText}</td>
      <td>${idealText}</td>
      <td>${adj.action === '維持' ? '-' : `${diffSign}${adj.diffDisplay.toFixed(1)}ロット`}</td>
      <td class="${swapClass}">${adj.action === '維持' ? '-' : `${swapSign}¥${Math.round(Math.abs(adj.swapChange)).toLocaleString()}`}</td>
      <td><div class="priority-bar"><div class="priority-bar-fill" style="width: ${priorityPct}%"></div></div></td>
    `;
    tbody.appendChild(row);
  });
}


// 既存のDOMContentLoadedにフック
const originalDOMContentLoaded = document.addEventListener;
document.addEventListener('DOMContentLoaded', () => {
  // 複利シミュレーションのイベントリスナーを設定
  setupCompoundEventListeners();
})
