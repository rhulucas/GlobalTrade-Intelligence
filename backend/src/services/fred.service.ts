/**
 * FRED (Federal Reserve Economic Data) Service
 * Fetches Natural Gas prices (Henry Hub) and BDI (Baltic Dry Index)
 * API Docs: https://fred.stlouisfed.org/docs/api/fred/
 * Free API key: https://fred.stlouisfed.org/docs/api/api_key.html
 */
import axios from 'axios';
import logger from '../config/logger';
import { priceCache } from '../config/cache';
import { CommodityPrice, HistoricalDataPoint } from '../models/commodity.model';

const FRED_BASE_URL = 'https://api.stlouisfed.org/fred';

// FRED Series IDs
const NATGAS_SERIES = 'DHHNGSP';  // Henry Hub Natural Gas Spot Price (Daily)
const BDI_SERIES = 'BDIY';        // Baltic Dry Index (Daily)

// ─── Mock Data Generators ────────────────────────────────────────────────────

function getMockNatGasPrice(): CommodityPrice {
  const base = 2.65;
  const v = (Math.random() - 0.5) * 0.15;
  const price = parseFloat((base + v).toFixed(3));
  return {
    symbol: 'NATGAS',
    name: 'Natural Gas (Henry Hub)',
    price,
    currency: 'USD',
    unit: 'MMBtu',
    change1d: parseFloat(v.toFixed(3)),
    changePct1d: parseFloat(((v / base) * 100).toFixed(2)),
    source: 'FRED (Mock)',
    fetchedAt: new Date().toISOString(),
    priceDate: new Date().toISOString().split('T')[0],
  };
}

function getMockBDIPrice(): CommodityPrice {
  const base = 1850;
  const v = Math.round((Math.random() - 0.5) * 80);
  const price = base + v;
  return {
    symbol: 'BDI',
    name: 'Baltic Dry Index',
    price,
    currency: 'USD',
    unit: 'index points',
    change1d: v,
    changePct1d: parseFloat(((v / base) * 100).toFixed(2)),
    source: 'FRED (Mock)',
    fetchedAt: new Date().toISOString(),
    priceDate: new Date().toISOString().split('T')[0],
  };
}

function generateMockHistory(base: number, volatility: number, days: number): HistoricalDataPoint[] {
  const history: HistoricalDataPoint[] = [];
  let price = base;
  const today = new Date();
  for (let i = days; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    price = Math.max(base * 0.4, Math.min(base * 2.2, price + (Math.random() - 0.48) * volatility));
    history.push({ date: date.toISOString().split('T')[0], price: parseFloat(price.toFixed(3)) });
  }
  return history;
}

// ─── FRED API Helpers ────────────────────────────────────────────────────────

async function fetchFredSeries(
  seriesId: string,
  limit = 2
): Promise<Array<{ date: string; value: string }>> {
  const apiKey = process.env.FRED_API_KEY;
  if (!apiKey || apiKey === 'your_fred_api_key_here') return [];

  const response = await axios.get(`${FRED_BASE_URL}/series/observations`, {
    params: {
      series_id: seriesId,
      api_key: apiKey,
      file_type: 'json',
      sort_order: 'desc',
      limit,
      observation_start: new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0],
    },
    timeout: 10000,
  });

  const obs: Array<{ date: string; value: string }> = response.data?.observations || [];
  // FRED sometimes returns '.' for missing values
  return obs.filter((o) => o.value !== '.');
}

async function fetchFredHistory(seriesId: string, days: number): Promise<HistoricalDataPoint[]> {
  const apiKey = process.env.FRED_API_KEY;
  if (!apiKey || apiKey === 'your_fred_api_key_here') return [];

  const startDate = new Date(Date.now() - days * 86400000).toISOString().split('T')[0];
  const response = await axios.get(`${FRED_BASE_URL}/series/observations`, {
    params: {
      series_id: seriesId,
      api_key: apiKey,
      file_type: 'json',
      sort_order: 'asc',
      observation_start: startDate,
    },
    timeout: 15000,
  });

  const obs: Array<{ date: string; value: string }> = response.data?.observations || [];
  return obs
    .filter((o) => o.value !== '.')
    .map((o) => ({ date: o.date, price: parseFloat(o.value) }));
}

// ─── Natural Gas ─────────────────────────────────────────────────────────────

export async function fetchNatGasPrice(): Promise<CommodityPrice> {
  const cacheKey = 'natgas_price';
  const cached = priceCache.get<CommodityPrice>(cacheKey);
  if (cached) return cached;

  try {
    const obs = await fetchFredSeries(NATGAS_SERIES, 2);
    if (!obs.length) throw new Error('No FRED data');

    const price = parseFloat(obs[0].value);
    const prevPrice = obs[1] ? parseFloat(obs[1].value) : price;
    const change = parseFloat((price - prevPrice).toFixed(3));

    const result: CommodityPrice = {
      symbol: 'NATGAS',
      name: 'Natural Gas (Henry Hub)',
      price,
      currency: 'USD',
      unit: 'MMBtu',
      change1d: change,
      changePct1d: parseFloat(((change / prevPrice) * 100).toFixed(2)),
      source: 'FRED',
      fetchedAt: new Date().toISOString(),
      priceDate: obs[0].date,
    };

    priceCache.set(cacheKey, result);
    return result;
  } catch (err) {
    logger.error('FRED NatGas error, using mock:', err);
    return getMockNatGasPrice();
  }
}

export async function fetchNatGasHistory(days = 365): Promise<HistoricalDataPoint[]> {
  const cacheKey = `natgas_history_${days}`;
  const cached = priceCache.get<HistoricalDataPoint[]>(cacheKey);
  if (cached) return cached;

  try {
    const history = await fetchFredHistory(NATGAS_SERIES, days);
    if (!history.length) throw new Error('No history data');
    priceCache.set(cacheKey, history, 600);
    return history;
  } catch {
    const mock = generateMockHistory(2.65, 0.12, days);
    priceCache.set(cacheKey, mock, 600);
    return mock;
  }
}

// ─── Baltic Dry Index ────────────────────────────────────────────────────────

export async function fetchBDIPrice(): Promise<CommodityPrice> {
  const cacheKey = 'bdi_price';
  const cached = priceCache.get<CommodityPrice>(cacheKey);
  if (cached) return cached;

  try {
    const obs = await fetchFredSeries(BDI_SERIES, 2);
    if (!obs.length) throw new Error('No FRED data');

    const price = parseFloat(obs[0].value);
    const prevPrice = obs[1] ? parseFloat(obs[1].value) : price;
    const change = parseFloat((price - prevPrice).toFixed(2));

    const result: CommodityPrice = {
      symbol: 'BDI',
      name: 'Baltic Dry Index',
      price,
      currency: 'USD',
      unit: 'index points',
      change1d: change,
      changePct1d: parseFloat(((change / prevPrice) * 100).toFixed(2)),
      source: 'FRED',
      fetchedAt: new Date().toISOString(),
      priceDate: obs[0].date,
    };

    priceCache.set(cacheKey, result);
    return result;
  } catch (err) {
    logger.error('FRED BDI error, using mock:', err);
    return getMockBDIPrice();
  }
}

export async function fetchBDIHistory(days = 365): Promise<HistoricalDataPoint[]> {
  const cacheKey = `bdi_history_${days}`;
  const cached = priceCache.get<HistoricalDataPoint[]>(cacheKey);
  if (cached) return cached;

  try {
    const history = await fetchFredHistory(BDI_SERIES, days);
    if (!history.length) throw new Error('No history data');
    priceCache.set(cacheKey, history, 600);
    return history;
  } catch {
    const mock = generateMockHistory(1850, 60, days);
    priceCache.set(cacheKey, mock, 600);
    return mock;
  }
}
