/**
 * World Bank Commodity Price Data Service
 * Fetches Wheat prices from World Bank Pink Sheet API
 * API Docs: https://datatopics.worldbank.org/world-development-indicators/
 * No API key required!
 */
import axios from 'axios';
import logger from '../config/logger';
import { priceCache } from '../config/cache';
import { CommodityPrice, HistoricalDataPoint } from '../models/commodity.model';

// World Bank Pink Sheet indicator for wheat (US HRW)
const WB_WHEAT_INDICATOR = 'PWHEATUSDM';
const WB_BASE_URL = 'https://api.worldbank.org/v2/en/indicator';

function getMockWheatPrice(): CommodityPrice {
  const base = 215;
  const v = (Math.random() - 0.5) * 8;
  const price = parseFloat((base + v).toFixed(2));
  return {
    symbol: 'WHEAT',
    name: 'Wheat (US HRW)',
    price,
    currency: 'USD',
    unit: 'metric ton',
    change1d: parseFloat(v.toFixed(2)),
    changePct1d: parseFloat(((v / base) * 100).toFixed(2)),
    source: 'World Bank (Mock)',
    fetchedAt: new Date().toISOString(),
    priceDate: new Date().toISOString().split('T')[0],
  };
}

function getMockWheatHistory(months = 24): HistoricalDataPoint[] {
  const history: HistoricalDataPoint[] = [];
  let price = 220;
  const today = new Date();
  for (let i = months; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    price = Math.max(150, Math.min(400, price + (Math.random() - 0.48) * 12));
    history.push({
      date: date.toISOString().split('T')[0],
      price: parseFloat(price.toFixed(2)),
    });
  }
  return history;
}

export async function fetchWheatPrice(): Promise<CommodityPrice> {
  const cacheKey = 'wheat_price';
  const cached = priceCache.get<CommodityPrice>(cacheKey);
  if (cached) return cached;

  try {
    // World Bank Pink Sheet - monthly data, no API key needed
    const currentYear = new Date().getFullYear();
    const response = await axios.get(
      `${WB_BASE_URL}/${WB_WHEAT_INDICATOR}`,
      {
        params: {
          format: 'json',
          mrv: 3,         // Most recent 3 values
          frequency: 'M',
          downloadformat: 'json',
        },
        timeout: 15000,
      }
    );

    // World Bank response: [metadata, data[]]
    const dataArr = response.data?.[1];
    if (!dataArr || dataArr.length === 0) throw new Error('No World Bank data');

    // Filter out null values and sort by date desc
    const valid = dataArr
      .filter((d: { value: null | number }) => d.value !== null)
      .sort((a: { date: string }, b: { date: string }) => b.date.localeCompare(a.date));

    if (!valid.length) throw new Error('No valid wheat data');

    const latest = valid[0];
    const previous = valid[1];
    const price = parseFloat(latest.value);
    const prevPrice = previous ? parseFloat(previous.value) : price;
    const change = parseFloat((price - prevPrice).toFixed(2));

    const result: CommodityPrice = {
      symbol: 'WHEAT',
      name: 'Wheat (US HRW)',
      price,
      currency: 'USD',
      unit: 'metric ton',
      change1d: change,
      changePct1d: parseFloat(((change / prevPrice) * 100).toFixed(2)),
      source: 'World Bank',
      fetchedAt: new Date().toISOString(),
      priceDate: latest.date,
    };

    priceCache.set(cacheKey, result, 3600); // World Bank data is monthly, cache 1hr
    return result;
  } catch (err) {
    logger.error('World Bank Wheat error, using mock:', err);
    return getMockWheatPrice();
  }
}

export async function fetchWheatHistory(months = 24): Promise<HistoricalDataPoint[]> {
  const cacheKey = `wheat_history_${months}`;
  const cached = priceCache.get<HistoricalDataPoint[]>(cacheKey);
  if (cached) return cached;

  try {
    const response = await axios.get(
      `${WB_BASE_URL}/${WB_WHEAT_INDICATOR}`,
      {
        params: {
          format: 'json',
          mrv: months,
          frequency: 'M',
        },
        timeout: 15000,
      }
    );

    const dataArr = response.data?.[1];
    if (!dataArr) throw new Error('No data');

    const result: HistoricalDataPoint[] = dataArr
      .filter((d: { value: null | number; date: string }) => d.value !== null)
      .map((d: { date: string; value: number }) => ({
        date: `${d.date}-01`,
        price: parseFloat(String(d.value)),
      }))
      .sort((a: HistoricalDataPoint, b: HistoricalDataPoint) => a.date.localeCompare(b.date));

    priceCache.set(cacheKey, result, 3600);
    return result;
  } catch (err) {
    logger.error('World Bank history error:', err);
    const mock = getMockWheatHistory(months);
    priceCache.set(cacheKey, mock, 3600);
    return mock;
  }
}
