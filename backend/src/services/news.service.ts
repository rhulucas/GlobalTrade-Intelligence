/**
 * News Service
 * Fetches geopolitical and trade news from NewsAPI
 * API Docs: https://newsapi.org/docs
 * Free API key: https://newsapi.org/register
 */
import axios from 'axios';
import logger from '../config/logger';
import { cache } from '../config/cache';
import { NewsItem } from '../models/commodity.model';

const NEWS_BASE_URL = 'https://newsapi.org/v2';

const SEARCH_QUERIES = [
  'oil supply geopolitics sanctions',
  'natural gas LNG Europe energy',
  'wheat grain food supply Ukraine Russia',
  'aluminum China trade tariff',
  'shipping Red Sea Suez Canal freight',
  'global trade commodity market',
];

const MOCK_NEWS: NewsItem[] = [
  {
    id: '1',
    title: 'Houthi Attacks Force More Shipping Companies to Reroute via Cape of Good Hope',
    description:
      'Major container shipping lines extend Red Sea avoidance, adding 14 days and $1M+ fuel costs per voyage as insurance premiums spike to 0.7% of cargo value.',
    url: '#',
    source: 'Reuters',
    publishedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    category: 'shipping',
    sentiment: 'bearish',
    relatedCommodities: ['BDI', 'BRENT'],
    imageUrl: 'https://images.unsplash.com/photo-1605745341112-85968b19335b?w=400',
  },
  {
    id: '2',
    title: 'OPEC+ Confirms Extended Production Cuts Through Q2 2026',
    description:
      'Saudi Arabia and Russia lead coalition maintaining 2.2M bbl/day voluntary cuts, citing market stability concerns amid rising US shale output and demand uncertainty.',
    url: '#',
    source: 'Bloomberg',
    publishedAt: new Date(Date.now() - 5 * 3600000).toISOString(),
    category: 'energy',
    sentiment: 'bullish',
    relatedCommodities: ['BRENT'],
    imageUrl: 'https://images.unsplash.com/photo-1535778756617-8e2e1e38af4e?w=400',
  },
  {
    id: '3',
    title: 'Ukraine Grain Corridor: Black Sea Exports Decline 18% Year-on-Year',
    description:
      'Winter crop damage and persistent drone warfare disrupt Ukrainian wheat exports, tightening global supply as Argentina and Australia harvests come in below expectations.',
    url: '#',
    source: 'Financial Times',
    publishedAt: new Date(Date.now() - 8 * 3600000).toISOString(),
    category: 'agriculture',
    sentiment: 'bullish',
    relatedCommodities: ['WHEAT'],
    imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400',
  },
  {
    id: '4',
    title: 'China Imposes 25% Tariffs on US Agricultural Products in Trade Retaliation',
    description:
      'Beijing announces counter-tariffs targeting US soybeans, corn, and wheat in response to technology export restrictions, raising food inflation fears across Asia.',
    url: '#',
    source: 'Wall Street Journal',
    publishedAt: new Date(Date.now() - 12 * 3600000).toISOString(),
    category: 'trade',
    sentiment: 'bearish',
    relatedCommodities: ['WHEAT', 'ALUMINUM'],
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400',
  },
  {
    id: '5',
    title: 'European Gas Storage at 65% Capacity Ahead of Winter — Above 5-Year Average',
    description:
      'Strong LNG imports from US and Qatar, combined with mild autumn weather, have built European storage cushion reducing supply risk for winter 2025-26 season.',
    url: '#',
    source: 'S&P Global',
    publishedAt: new Date(Date.now() - 18 * 3600000).toISOString(),
    category: 'energy',
    sentiment: 'bearish',
    relatedCommodities: ['NATGAS'],
    imageUrl: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=400',
  },
  {
    id: '6',
    title: 'Global Aluminum Deficit Widens as China Curtails Smelter Output',
    description:
      'Power shortages in Yunnan province force 15% production cuts at Chinese aluminum smelters, pushing LME inventories to 18-month lows and supporting prices above $2,300/t.',
    url: '#',
    source: 'Metal Bulletin',
    publishedAt: new Date(Date.now() - 24 * 3600000).toISOString(),
    category: 'metals',
    sentiment: 'bullish',
    relatedCommodities: ['ALUMINUM'],
    imageUrl: 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=400',
  },
  {
    id: '7',
    title: 'Panama Canal Restricts Daily Transits to 22 Vessels Due to Historic Drought',
    description:
      'Gatun Lake water levels fall to record low, forcing Panama Canal Authority to cap crossings at 22/day (vs 36 normal). Asia-US East Coast rates surge 40% in response.',
    url: '#',
    source: 'Lloyd\'s List',
    publishedAt: new Date(Date.now() - 30 * 3600000).toISOString(),
    category: 'shipping',
    sentiment: 'bullish',
    relatedCommodities: ['BDI', 'BRENT'],
    imageUrl: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=400',
  },
  {
    id: '8',
    title: 'Iran Nuclear Talks Collapse; Strait of Hormuz Insurance Premiums Triple',
    description:
      'Renewed US-Iran tensions following failed Vienna negotiations push war-risk insurance costs to 0.5% of vessel value per voyage, up from 0.15% three months ago.',
    url: '#',
    source: 'Reuters',
    publishedAt: new Date(Date.now() - 36 * 3600000).toISOString(),
    category: 'geopolitics',
    sentiment: 'bullish',
    relatedCommodities: ['BRENT', 'BDI'],
    imageUrl: 'https://images.unsplash.com/photo-1518544801976-3e159e50e5bb?w=400',
  },
];

export async function fetchGeopoliticalNews(): Promise<NewsItem[]> {
  const cacheKey = 'geopolitical_news';
  const cached = cache.get<NewsItem[]>(cacheKey);
  if (cached) return cached;

  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey || apiKey === 'your_newsapi_key_here') {
    logger.warn('NEWS_API_KEY not configured, using mock news');
    cache.set(cacheKey, MOCK_NEWS, 900);
    return MOCK_NEWS;
  }

  try {
    const allArticles: NewsItem[] = [];

    // Fetch top headlines about commodities and trade
    const response = await axios.get(`${NEWS_BASE_URL}/everything`, {
      params: {
        q: 'oil OR "natural gas" OR wheat OR aluminum OR "shipping" OR "freight" OR "trade war" OR "geopolitics"',
        language: 'en',
        sortBy: 'publishedAt',
        pageSize: 20,
        apiKey,
      },
      timeout: 10000,
    });

    const articles = response.data?.articles || [];

    for (const article of articles) {
      if (!article.title || article.title === '[Removed]') continue;

      const text = `${article.title} ${article.description || ''}`.toLowerCase();

      const relatedCommodities: string[] = [];
      if (text.includes('oil') || text.includes('crude') || text.includes('opec') || text.includes('brent')) {
        relatedCommodities.push('BRENT');
      }
      if (text.includes('gas') || text.includes('lng') || text.includes('pipeline')) {
        relatedCommodities.push('NATGAS');
      }
      if (text.includes('wheat') || text.includes('grain') || text.includes('food')) {
        relatedCommodities.push('WHEAT');
      }
      if (text.includes('aluminum') || text.includes('aluminium') || text.includes('metal')) {
        relatedCommodities.push('ALUMINUM');
      }
      if (text.includes('shipping') || text.includes('freight') || text.includes('suez') || text.includes('canal')) {
        relatedCommodities.push('BDI');
      }

      // Simple sentiment analysis
      const bullishWords = ['surge', 'rise', 'increase', 'disruption', 'shortage', 'cut', 'sanctions', 'attack'];
      const bearishWords = ['fall', 'decline', 'oversupply', 'glut', 'weak', 'drop', 'slump'];

      const bullScore = bullishWords.filter((w) => text.includes(w)).length;
      const bearScore = bearishWords.filter((w) => text.includes(w)).length;
      const sentiment: 'bullish' | 'bearish' | 'neutral' =
        bullScore > bearScore ? 'bullish' : bearScore > bullScore ? 'bearish' : 'neutral';

      allArticles.push({
        id: Buffer.from(article.url).toString('base64').substring(0, 16),
        title: article.title,
        description: article.description || '',
        url: article.url,
        source: article.source?.name || 'Unknown',
        publishedAt: article.publishedAt,
        category: relatedCommodities.length === 1 ? getCategoryFromCommodity(relatedCommodities[0]) : 'trade',
        sentiment,
        relatedCommodities,
        imageUrl: article.urlToImage || undefined,
      });
    }

    const result = allArticles.slice(0, 15);
    cache.set(cacheKey, result, 900); // Cache 15 minutes
    return result;
  } catch (err) {
    logger.error('NewsAPI error, using mock:', err);
    cache.set(cacheKey, MOCK_NEWS, 900);
    return MOCK_NEWS;
  }
}

function getCategoryFromCommodity(symbol: string): string {
  const map: Record<string, string> = {
    BRENT: 'energy',
    NATGAS: 'energy',
    WHEAT: 'agriculture',
    ALUMINUM: 'metals',
    BDI: 'shipping',
  };
  return map[symbol] || 'trade';
}
