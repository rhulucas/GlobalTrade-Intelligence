/**
 * Investment Signals Service
 * Generates BULLISH / NEUTRAL / BEARISH ratings based on:
 * - Price momentum (20-day vs 50-day MA)
 * - RSI (Relative Strength Index)
 * - Price vs 52-week range
 * - Supply/demand context
 */
import { HistoricalDataPoint, InvestmentSignal } from '../models/commodity.model';

interface SignalContext {
  symbol: string;
  name: string;
  currentPrice: number;
  history: HistoricalDataPoint[];
}

function calcSMA(prices: number[], period: number): number {
  if (prices.length < period) return prices.reduce((a, b) => a + b, 0) / prices.length;
  const slice = prices.slice(-period);
  return slice.reduce((a, b) => a + b, 0) / period;
}

function calcRSI(prices: number[], period = 14): number {
  if (prices.length < period + 1) return 50;

  const changes = prices.slice(-period - 1).map((p, i, arr) =>
    i === 0 ? 0 : p - arr[i - 1]
  ).slice(1);

  const gains = changes.filter((c) => c > 0);
  const losses = changes.filter((c) => c < 0).map((c) => Math.abs(c));

  const avgGain = gains.reduce((a, b) => a + b, 0) / period;
  const avgLoss = losses.reduce((a, b) => a + b, 0) / period;

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

function calcVolatility(prices: number[]): number {
  if (prices.length < 2) return 0;
  const returns = prices.slice(1).map((p, i) => Math.log(p / prices[i]));
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length;
  return Math.sqrt(variance * 252) * 100; // Annualized volatility %
}

export function generateSignal(ctx: SignalContext): InvestmentSignal {
  const prices = ctx.history.map((h) => h.price).filter((p) => p > 0);

  if (prices.length < 20) {
    return {
      symbol: ctx.symbol,
      signal: 'NEUTRAL',
      score: 50,
      reasoning: 'Insufficient price history for technical analysis',
      factors: {
        momentum: 'N/A',
        rsi: 50,
        priceVs52w: 'N/A',
        volatility: 'N/A',
        trend: 'N/A',
      },
    };
  }

  const currentPrice = ctx.currentPrice || prices[prices.length - 1];
  const sma20 = calcSMA(prices, 20);
  const sma50 = calcSMA(prices, 50);
  const rsi = calcRSI(prices);
  const volatility = calcVolatility(prices.slice(-30));

  const yearPrices = prices.slice(-252);
  const high52w = Math.max(...yearPrices);
  const low52w = Math.min(...yearPrices);
  const priceRange52w = high52w - low52w;
  const priceVs52wPct = priceRange52w > 0
    ? ((currentPrice - low52w) / priceRange52w) * 100
    : 50;

  // Scoring system (0-100, higher = more bullish)
  let score = 50;
  const factors: Record<string, string | number> = {};

  // 1. Trend: price vs SMA20
  const trendSignal = currentPrice > sma20 ? 1 : -1;
  score += trendSignal * 8;
  factors.priceVsSMA20 = parseFloat(((currentPrice / sma20 - 1) * 100).toFixed(2));

  // 2. Momentum: SMA20 vs SMA50 (golden/death cross)
  const momentumSignal = sma20 > sma50 ? 1 : -1;
  score += momentumSignal * 10;
  factors.sma20VsSMA50 = parseFloat(((sma20 / sma50 - 1) * 100).toFixed(2));

  // 3. RSI
  if (rsi > 70) {
    score -= 12; // Overbought
    factors.rsiSignal = 'Overbought';
  } else if (rsi < 30) {
    score += 12; // Oversold — contrarian signal
    factors.rsiSignal = 'Oversold (Contrarian Bullish)';
  } else if (rsi > 55) {
    score += 5;
    factors.rsiSignal = 'Bullish momentum';
  } else if (rsi < 45) {
    score -= 5;
    factors.rsiSignal = 'Bearish momentum';
  } else {
    factors.rsiSignal = 'Neutral';
  }
  factors.rsi = parseFloat(rsi.toFixed(1));

  // 4. 52-week position
  if (priceVs52wPct > 80) {
    score += 8; // Near 52w high — strong trend
    factors.pricePosition = 'Near 52W High';
  } else if (priceVs52wPct < 20) {
    score -= 8; // Near 52w low — weak
    factors.pricePosition = 'Near 52W Low';
  } else {
    factors.pricePosition = `${priceVs52wPct.toFixed(0)}% of 52W Range`;
  }

  // 5. Volatility (high vol = uncertainty, slight bearish bias)
  if (volatility > 40) {
    score -= 5;
    factors.volatility = `High (${volatility.toFixed(1)}% ann.)`;
  } else if (volatility < 15) {
    score += 3;
    factors.volatility = `Low (${volatility.toFixed(1)}% ann.)`;
  } else {
    factors.volatility = `Normal (${volatility.toFixed(1)}% ann.)`;
  }

  // Clamp score 0-100
  score = Math.max(0, Math.min(100, Math.round(score)));

  const signal: 'BULLISH' | 'NEUTRAL' | 'BEARISH' =
    score >= 58 ? 'BULLISH' : score <= 42 ? 'BEARISH' : 'NEUTRAL';

  const reasoning = buildReasoning(ctx.name, signal, {
    rsi,
    priceVs52wPct,
    momentumSignal,
    trendSignal,
    volatility,
    sma20,
    sma50,
    currentPrice,
  });

  return {
    symbol: ctx.symbol,
    signal,
    score,
    reasoning,
    factors,
  };
}

function buildReasoning(
  name: string,
  signal: string,
  metrics: {
    rsi: number;
    priceVs52wPct: number;
    momentumSignal: number;
    trendSignal: number;
    volatility: number;
    sma20: number;
    sma50: number;
    currentPrice: number;
  }
): string {
  const parts: string[] = [];

  if (metrics.trendSignal > 0) {
    parts.push(`Price trading above 20-day MA ($${metrics.sma20.toFixed(2)})`);
  } else {
    parts.push(`Price below 20-day MA ($${metrics.sma20.toFixed(2)})`);
  }

  if (metrics.momentumSignal > 0) {
    parts.push('bullish golden-cross formation (20MA > 50MA)');
  } else {
    parts.push('bearish death-cross formation (20MA < 50MA)');
  }

  if (metrics.rsi > 70) {
    parts.push(`RSI at ${metrics.rsi.toFixed(0)} signals overbought conditions`);
  } else if (metrics.rsi < 30) {
    parts.push(`RSI at ${metrics.rsi.toFixed(0)} signals oversold — potential reversal`);
  } else {
    parts.push(`RSI at ${metrics.rsi.toFixed(0)} (neutral zone)`);
  }

  parts.push(`positioned at ${metrics.priceVs52wPct.toFixed(0)}% of 52-week range`);

  return `${name}: ${parts.join(', ')}. Overall signal: ${signal}.`;
}

// Commodity-specific context adjustments
export function applyFundamentalContext(
  signal: InvestmentSignal,
  symbol: string
): InvestmentSignal {
  const contextMap: Record<string, { adjustment: number; note: string }> = {
    BRENT: { adjustment: 5, note: 'OPEC+ supply discipline supports floor' },
    NATGAS: { adjustment: -3, note: 'Elevated LNG supply from US suppresses upside' },
    WHEAT: { adjustment: 4, note: 'Black Sea conflict risk adds geopolitical premium' },
    ALUMINUM: { adjustment: 3, note: 'China smelter curtailments support price' },
    BDI: { adjustment: 6, note: 'Suez Canal disruption structurally elevating rates' },
  };

  const ctx = contextMap[symbol];
  if (!ctx) return signal;

  const newScore = Math.max(0, Math.min(100, signal.score + ctx.adjustment));
  const newSignal: 'BULLISH' | 'NEUTRAL' | 'BEARISH' =
    newScore >= 58 ? 'BULLISH' : newScore <= 42 ? 'BEARISH' : 'NEUTRAL';

  return {
    ...signal,
    score: newScore,
    signal: newSignal,
    reasoning: `${signal.reasoning} Fundamental: ${ctx.note}.`,
    factors: { ...signal.factors, fundamentalNote: ctx.note },
  };
}
