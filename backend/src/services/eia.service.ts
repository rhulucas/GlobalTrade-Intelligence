/**
 * EIA (U.S. Energy Information Administration) Service
 * Fetches Brent Crude Oil prices
 * API Docs: https://api.eia.gov/v2/
 * Free API key: https://www.eia.gov/opendata/
 */
import axios from 'axios';
import logger from '../config/logger';
import { priceCache } from '../config/cache';
import { CommodityPrice, HistoricalDataPoint } from '../models/commodity.model';

const EIA_BASE_URL = 'https://api.eia.gov/v2';
const BRENT_SERIES_ID = 'PET.RBRTE.D'; // Brent Crude Oil Daily Price

// Fallback mock data when API key is not available
function getMockBrentPrice(): CommodityPrice {
  const basePrice = 82.45;
  const variation = (Math.random() - 0.5) * 2;
  const price = parseFloat((basePrice + variation).toFixed(2));
  const change = parseFloat(variation.toFixed(2));
  return {
    symbol: 'BRENT',
    name: 'Brent Crude Oil',
    price,
    currency: 'USD',
    unit: 'barrel',
    change1d: change,
    changePct1d: parseFloat(((change / basePrice) * 100).toFixed(2)),
    source: 'EIA (Mock)',
    fetchedAt: new Date().toISOString(),
    priceDate: new Date().toISOString().split('T')[0],
  };
}

function getMockBrentHistory(): HistoricalDataPoint[] {
  const history: HistoricalDataPoint[] = [];
  let price = 80;
  const today = new Date();
  for (let i = 364; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    price = Math.max(60, Math.min(110, price + (Math.random() - 0.48) * 1.5));
    history.push({
      date: date.toISOString().split('T')[0],
      price: parseFloat(price.toFixed(2)),
    });
  }
  return history;
}

export async function fetchBrentPrice(): Promise<CommodityPrice> {
  const cacheKey = 'brent_price';
  const cached = priceCache.get<CommodityPrice>(cacheKey);
  if (cached) return cached;

  const apiKey = process.env.EIA_API_KEY;
  if (!apiKey || apiKey === 'your_eia_api_key_here') {
    logger.warn('EIA_API_KEY not configured, using mock data');
    const mock = getMockBrentPrice();
    priceCache.set(cacheKey, mock);
    return mock;
  }

  try {
    const response = await axios.get(`${EIA_BASE_URL}/petroleum/pri/spt/data/`, {
      params: {
        api_key: apiKey,
        frequency: 'daily',
        data: ['value'],
        facets: { series: ['RBRTE'] },
        sort: [{ column: 'period', direction: 'desc' }],
        length: 2,
      },
      timeout: 10000,
    });

    const data = response.data?.response?.data;
    if (!data || data.length === 0) throw new Error('No EIA data returned');

    const latest = data[0];
    const previous = data[1];
    const price = parseFloat(latest.value);
    const prevPrice = previous ? parseFloat(previous.value) : price;
    const change = parseFloat((price - prevPrice).toFixed(2));

    const result: CommodityPrice = {
      symbol: 'BRENT',
      name: 'Brent Crude Oil',
      price,
      currency: 'USD',
      unit: 'barrel',
      change1d: change,
      changePct1d: parseFloat(((change / prevPrice) * 100).toFixed(2)),
      source: 'EIA',
      fetchedAt: new Date().toISOString(),
      priceDate: latest.period,
    };

    priceCache.set(cacheKey, result);
    return result;
  } catch (err) {
    logger.error('EIA API error, falling back to mock:', err);
    return getMockBrentPrice();
  }
}

export async function fetchBrentHistory(days = 365): Promise<HistoricalDataPoint[]> {
  const cacheKey = `brent_history_${days}`;
  const cached = priceCache.get<HistoricalDataPoint[]>(cacheKey);
  if (cached) return cached;

  const apiKey = process.env.EIA_API_KEY;
  if (!apiKey || apiKey === 'your_eia_api_key_here') {
    const mock = getMockBrentHistory();
    priceCache.set(cacheKey, mock, 600);
    return mock;
  }

  try {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - days * 86400000).toISOString().split('T')[0];

    const response = await axios.get(`${EIA_BASE_URL}/petroleum/pri/spt/data/`, {
      params: {
        api_key: apiKey,
        frequency: 'daily',
        data: ['value'],
        facets: { series: ['RBRTE'] },
        start: startDate,
        end: endDate,
        sort: [{ column: 'period', direction: 'asc' }],
        length: days,
      },
      timeout: 15000,
    });

    const data = response.data?.response?.data || [];
    const result: HistoricalDataPoint[] = data.map((d: { period: string; value: string }) => ({
      date: d.period,
      price: parseFloat(d.value),
    }));

    priceCache.set(cacheKey, result, 600);
    return result;
  } catch (err) {
    logger.error('EIA history fetch error:', err);
    return getMockBrentHistory();
  }
}
