/**
 * Alpha Vantage Service
 * Fetches Aluminum prices via Commodities API
 * API Docs: https://www.alphavantage.co/documentation/#commodities
 * Free API key: https://www.alphavantage.co/support/#api-key
 */
import axios from 'axios';
import logger from '../config/logger';
import { priceCache } from '../config/cache';
import { CommodityPrice, HistoricalDataPoint } from '../models/commodity.model';

const AV_BASE_URL = 'https://www.alphavantage.co/query';

function getMockAluminumPrice(): CommodityPrice {
  const base = 2280;
  const v = (Math.random() - 0.5) * 40;
  const price = parseFloat((base + v).toFixed(2));
  return {
    symbol: 'ALUMINUM',
    name: 'Aluminum (LME)',
    price,
    currency: 'USD',
    unit: 'metric ton',
    change1d: parseFloat(v.toFixed(2)),
    changePct1d: parseFloat(((v / base) * 100).toFixed(2)),
    source: 'Alpha Vantage (Mock)',
    fetchedAt: new Date().toISOString(),
    priceDate: new Date().toISOString().split('T')[0],
  };
}

function getMockAluminumHistory(days = 365): HistoricalDataPoint[] {
  const history: HistoricalDataPoint[] = [];
  let price = 2200;
  const today = new Date();
  for (let i = days; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    price = Math.max(1600, Math.min(3200, price + (Math.random() - 0.48) * 25));
    history.push({ date: date.toISOString().split('T')[0], price: parseFloat(price.toFixed(2)) });
  }
  return history;
}

export async function fetchAluminumPrice(): Promise<CommodityPrice> {
  const cacheKey = 'aluminum_price';
  const cached = priceCache.get<CommodityPrice>(cacheKey);
  if (cached) return cached;

  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
  if (!apiKey || apiKey === 'your_alpha_vantage_key_here') {
    logger.warn('ALPHA_VANTAGE_API_KEY not configured, using mock data');
    const mock = getMockAluminumPrice();
    priceCache.set(cacheKey, mock);
    return mock;
  }

  try {
    const response = await axios.get(AV_BASE_URL, {
      params: {
        function: 'ALUMINUM',
        interval: 'monthly',
        apikey: apiKey,
      },
      timeout: 15000,
    });

    const rawData = response.data?.data;
    if (!rawData || rawData.length === 0) throw new Error('No Alpha Vantage data');

    // Sort desc by date
    const sorted = [...rawData].sort(
      (a: { date: string }, b: { date: string }) => b.date.localeCompare(a.date)
    );

    const latest = sorted[0];
    const previous = sorted[1];
    const price = parseFloat(latest.value);
    const prevPrice = previous ? parseFloat(previous.value) : price;
    const change = parseFloat((price - prevPrice).toFixed(2));

    const result: CommodityPrice = {
      symbol: 'ALUMINUM',
      name: 'Aluminum (LME)',
      price,
      currency: 'USD',
      unit: 'metric ton',
      change1d: change,
      changePct1d: parseFloat(((change / prevPrice) * 100).toFixed(2)),
      source: 'Alpha Vantage',
      fetchedAt: new Date().toISOString(),
      priceDate: latest.date,
    };

    priceCache.set(cacheKey, result, 3600);
    return result;
  } catch (err) {
    logger.error('Alpha Vantage Aluminum error, using mock:', err);
    return getMockAluminumPrice();
  }
}

export async function fetchAluminumHistory(months = 24): Promise<HistoricalDataPoint[]> {
  const cacheKey = `aluminum_history_${months}`;
  const cached = priceCache.get<HistoricalDataPoint[]>(cacheKey);
  if (cached) return cached;

  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
  if (!apiKey || apiKey === 'your_alpha_vantage_key_here') {
    const mock = getMockAluminumHistory(months * 30);
    priceCache.set(cacheKey, mock, 3600);
    return mock;
  }

  try {
    const response = await axios.get(AV_BASE_URL, {
      params: {
        function: 'ALUMINUM',
        interval: 'monthly',
        apikey: apiKey,
      },
      timeout: 15000,
    });

    const rawData: Array<{ date: string; value: string }> = response.data?.data || [];
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - months);

    const result: HistoricalDataPoint[] = rawData
      .filter((d) => new Date(d.date) >= cutoff && d.value !== '.')
      .map((d) => ({ date: d.date, price: parseFloat(d.value) }))
      .sort((a, b) => a.date.localeCompare(b.date));

    priceCache.set(cacheKey, result, 3600);
    return result;
  } catch (err) {
    logger.error('Alpha Vantage history error:', err);
    const mock = getMockAluminumHistory(months * 30);
    priceCache.set(cacheKey, mock, 3600);
    return mock;
  }
}
