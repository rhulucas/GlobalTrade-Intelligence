import axios from 'axios';
import type {
  CommodityPrice,
  DashboardSummary,
  HistoricalDataPoint,
  InvestmentSignal,
  NewsItem,
  ShippingRoute,
  BeneficiaryRanking,
} from '../types';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error('API Error:', err.response?.data || err.message);
    return Promise.reject(err);
  }
);

// ─── Dashboard ────────────────────────────────────────────────────────────────
export async function fetchDashboard(): Promise<DashboardSummary> {
  const { data } = await api.get<{ success: boolean; data: DashboardSummary }>('/dashboard');
  return data.data;
}

// ─── Commodities ──────────────────────────────────────────────────────────────
export async function fetchAllPrices(): Promise<CommodityPrice[]> {
  const { data } = await api.get<{ success: boolean; data: CommodityPrice[] }>('/commodities');
  return data.data;
}

export async function fetchPrice(symbol: string): Promise<CommodityPrice> {
  const { data } = await api.get<{ success: boolean; data: CommodityPrice }>(`/commodities/${symbol}`);
  return data.data;
}

export async function fetchHistory(symbol: string, days = 365): Promise<HistoricalDataPoint[]> {
  const { data } = await api.get<{ success: boolean; data: HistoricalDataPoint[] }>(
    `/commodities/${symbol}/history`,
    { params: { days } }
  );
  return data.data;
}

export async function fetchSignal(symbol: string): Promise<InvestmentSignal> {
  const { data } = await api.get<{ success: boolean; data: InvestmentSignal }>(
    `/commodities/${symbol}/signal`
  );
  return data.data;
}

export async function fetchAllSignals(): Promise<InvestmentSignal[]> {
  const { data } = await api.get<{ success: boolean; data: InvestmentSignal[] }>(
    '/commodities/signals/all'
  );
  return data.data;
}

export async function fetchBeneficiaries(): Promise<BeneficiaryRanking[]> {
  const { data } = await api.get<{ success: boolean; data: BeneficiaryRanking[] }>(
    '/commodities/rankings/beneficiaries'
  );
  return data.data;
}

// ─── Shipping ─────────────────────────────────────────────────────────────────
export async function fetchShippingRoutes(): Promise<ShippingRoute[]> {
  const { data } = await api.get<{ success: boolean; data: ShippingRoute[] }>('/shipping');
  return data.data;
}

// ─── News ─────────────────────────────────────────────────────────────────────
export async function fetchNews(commodity?: string): Promise<NewsItem[]> {
  const { data } = await api.get<{ success: boolean; data: NewsItem[] }>('/news', {
    params: commodity ? { commodity } : {},
  });
  return data.data;
}
