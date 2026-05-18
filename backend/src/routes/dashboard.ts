import { Router, Request, Response } from 'express';
import { fetchBrentPrice, fetchBrentHistory } from '../services/eia.service';
import { fetchNatGasPrice, fetchNatGasHistory, fetchBDIPrice, fetchBDIHistory } from '../services/fred.service';
import { fetchWheatPrice, fetchWheatHistory } from '../services/worldbank.service';
import { fetchAluminumPrice, fetchAluminumHistory } from '../services/alphavantage.service';
import { fetchGeopoliticalNews } from '../services/news.service';
import { generateSignal, applyFundamentalContext } from '../services/signals.service';
import { query } from '../config/database';
import { cache } from '../config/cache';
import logger from '../config/logger';
import { DashboardSummary, ShippingRoute } from '../models/commodity.model';

const router = Router();

const STATIC_ROUTES: ShippingRoute[] = [
  {
    routeId: 'SUEZ', name: 'Suez Canal', origin: 'Red Sea', destination: 'Mediterranean',
    riskLevel: 'HIGH', status: 'Disrupted - Houthi Attacks',
    description: 'Houthi attacks forcing re-routing via Cape of Good Hope (+14 days)',
    coordinates: { origin: [12.5, 43.5], destination: [31.5, 32.3] },
    updatedAt: new Date().toISOString(),
  },
  {
    routeId: 'HORMUZ', name: 'Strait of Hormuz', origin: 'Persian Gulf', destination: 'Arabian Sea',
    riskLevel: 'MEDIUM', status: 'Monitored - Iran Tensions',
    description: 'Critical chokepoint for Gulf oil exports; Iran-US tensions elevate risk',
    coordinates: { origin: [26.6, 56.2], destination: [24.5, 58.7] },
    updatedAt: new Date().toISOString(),
  },
  {
    routeId: 'MALACCA', name: 'Strait of Malacca', origin: 'Indian Ocean', destination: 'South China Sea',
    riskLevel: 'LOW', status: 'Normal Operations',
    description: 'Busiest shipping lane; piracy risk remains low',
    coordinates: { origin: [5.3, 100.3], destination: [1.3, 103.8] },
    updatedAt: new Date().toISOString(),
  },
  {
    routeId: 'PANAMA', name: 'Panama Canal', origin: 'Atlantic Ocean', destination: 'Pacific Ocean',
    riskLevel: 'MEDIUM', status: 'Restricted - Low Water',
    description: 'Drought reducing daily transits from 36 to 22 vessels',
    coordinates: { origin: [9.0, -79.7], destination: [8.9, -79.5] },
    updatedAt: new Date().toISOString(),
  },
  {
    routeId: 'TAIWAN', name: 'Taiwan Strait', origin: 'East China Sea', destination: 'South China Sea',
    riskLevel: 'HIGH', status: 'Elevated Military Activity',
    description: 'PLA military exercises increasing navigation complexity',
    coordinates: { origin: [24.5, 119.5], destination: [25.0, 122.0] },
    updatedAt: new Date().toISOString(),
  },
  {
    routeId: 'BOSPHORUS', name: 'Bosphorus Strait', origin: 'Black Sea', destination: 'Mediterranean',
    riskLevel: 'MEDIUM', status: 'Russia Sanctions Impact',
    description: 'Russian oil tanker movements restricted',
    coordinates: { origin: [41.1, 29.0], destination: [41.0, 28.9] },
    updatedAt: new Date().toISOString(),
  },
];

// GET /api/dashboard — full summary in one call
router.get('/', async (_req: Request, res: Response) => {
  const cacheKey = 'dashboard_summary';
  const cached = cache.get<DashboardSummary>(cacheKey);
  if (cached) return res.json({ success: true, data: cached, cached: true });

  try {
    const symbols = ['BRENT', 'NATGAS', 'WHEAT', 'ALUMINUM', 'BDI'];
    const priceFetchers = [fetchBrentPrice, fetchNatGasPrice, fetchWheatPrice, fetchAluminumPrice, fetchBDIPrice];
    const histFetchers = [
      () => fetchBrentHistory(365),
      () => fetchNatGasHistory(365),
      () => fetchWheatHistory(24),
      () => fetchAluminumHistory(24),
      () => fetchBDIHistory(365),
    ];

    // Parallel fetch everything
    const [priceResults, histResults, newsResult, routesResult] = await Promise.allSettled([
      Promise.allSettled(priceFetchers.map((f) => f())),
      Promise.allSettled(histFetchers.map((f) => f())),
      fetchGeopoliticalNews(),
      query('SELECT * FROM shipping_routes ORDER BY CASE risk_level WHEN \'CRITICAL\' THEN 1 WHEN \'HIGH\' THEN 2 WHEN \'MEDIUM\' THEN 3 ELSE 4 END').catch(() => ({ rows: [] })),
    ]);

    const prices = priceResults.status === 'fulfilled'
      ? priceResults.value.map((r) => r.status === 'fulfilled' ? r.value : null).filter(Boolean)
      : [];

    const histories = histResults.status === 'fulfilled'
      ? histResults.value.map((r) => r.status === 'fulfilled' ? r.value : [])
      : symbols.map(() => []);

    const news = newsResult.status === 'fulfilled' ? newsResult.value : [];

    const dbRoutes = routesResult.status === 'fulfilled' && 'rows' in routesResult.value
      ? routesResult.value.rows
      : [];

    const shippingRoutes: ShippingRoute[] = dbRoutes.length > 0
      ? dbRoutes.map((r: Record<string, unknown>) => ({
          routeId: r.route_id as string,
          name: r.name as string,
          origin: r.origin as string,
          destination: r.destination as string,
          riskLevel: r.risk_level as ShippingRoute['riskLevel'],
          status: r.status as string,
          description: r.description as string,
          coordinates: {
            origin: [parseFloat(r.lat_origin as string), parseFloat(r.lng_origin as string)] as [number, number],
            destination: [parseFloat(r.lat_dest as string), parseFloat(r.lng_dest as string)] as [number, number],
          },
          updatedAt: (r.updated_at as Date).toISOString(),
        }))
      : STATIC_ROUTES;

    // Generate signals
    const signals = prices.map((price, i) => {
      if (!price) return null;
      const history = histories[i] || [];
      const raw = generateSignal({ symbol: price.symbol, name: price.name, currentPrice: price.price, history });
      return applyFundamentalContext(raw, price.symbol);
    }).filter(Boolean);

    // Beneficiary rankings
    const beneficiaries = signals
      .map((sig, i) => {
        if (!sig || !prices[i]) return null;
        const price = prices[i]!;
        return {
          rank: 0,
          symbol: sig.symbol,
          name: price.name,
          signal: sig.signal,
          score: sig.score,
          currentPrice: price.price,
          changePct1d: price.changePct1d,
          drivers: getDrivers(sig.symbol),
        };
      })
      .filter(Boolean)
      .sort((a, b) => b!.score - a!.score)
      .map((r, i) => ({ ...r!, rank: i + 1 }));

    const summary: DashboardSummary = {
      prices: prices as DashboardSummary['prices'],
      signals: signals as DashboardSummary['signals'],
      shippingRoutes,
      news,
      beneficiaries,
      lastUpdated: new Date().toISOString(),
    };

    cache.set(cacheKey, summary, 120);
    return res.json({ success: true, data: summary, cached: false });
  } catch (err) {
    logger.error('Dashboard error:', err);
    return res.status(500).json({ success: false, error: 'Dashboard data fetch failed' });
  }
});

function getDrivers(symbol: string): string[] {
  const map: Record<string, string[]> = {
    BRENT: ['OPEC+ supply cuts', 'Geopolitical risk premium', 'Suez Canal disruption'],
    NATGAS: ['Winter demand spike', 'LNG export growth', 'European storage deficit'],
    WHEAT: ['Ukraine conflict risk', 'Black Sea export disruption', 'El Niño crop impact'],
    ALUMINUM: ['China smelter cuts', 'Energy cost inflation', 'EV demand tailwind'],
    BDI: ['Red Sea rerouting', 'Panama Canal drought', 'Global trade volume growth'],
  };
  return map[symbol] || [];
}

export default router;
