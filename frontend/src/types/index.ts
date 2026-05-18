export interface CommodityPrice {
  symbol: string;
  name: string;
  price: number;
  currency: string;
  unit: string;
  change1d: number;
  changePct1d: number;
  source: string;
  fetchedAt: string;
  priceDate: string;
}

export interface HistoricalDataPoint {
  date: string;
  price: number;
  volume?: number;
}

export type SignalType = 'BULLISH' | 'NEUTRAL' | 'BEARISH';

export interface InvestmentSignal {
  symbol: string;
  signal: SignalType;
  score: number;
  reasoning: string;
  factors: Record<string, string | number>;
}

export interface ShippingRoute {
  routeId: string;
  name: string;
  origin: string;
  destination: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: string;
  description: string;
  coordinates: {
    origin: [number, number];
    destination: [number, number];
  };
  updatedAt: string;
}

export interface NewsItem {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  category: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  relatedCommodities: string[];
  imageUrl?: string;
}

export interface BeneficiaryRanking {
  rank: number;
  symbol: string;
  name: string;
  signal: SignalType;
  score: number;
  currentPrice: number;
  changePct1d: number;
  drivers: string[];
}

export interface DashboardSummary {
  prices: CommodityPrice[];
  signals: InvestmentSignal[];
  shippingRoutes: ShippingRoute[];
  news: NewsItem[];
  beneficiaries: BeneficiaryRanking[];
  lastUpdated: string;
}

export type TimeRange = '1W' | '1M' | '3M' | '6M' | '1Y';

export type PageKey =
  | 'dashboard'
  | 'commodities'
  | 'shipping'
  | 'macro'
  | 'news'
  | 'ai-brief'
  | 'scenario'
  | 'data-center';
