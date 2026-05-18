import { Router, Request, Response } from 'express';
import { fetchBrentPrice, fetchBrentHistory } from '../services/eia.service';
import { fetchNatGasPrice, fetchNatGasHistory, fetchBDIPrice, fetchBDIHistory } from '../services/fred.service';
import { fetchWheatPrice, fetchWheatHistory } from '../services/worldbank.service';
import { fetchAluminumPrice, fetchAluminumHistory } from '../services/alphavantage.service';
import { generateSignal, applyFundamentalContext } from '../services/signals.service';
import { cache } from '../config/cache';
import logger from '../config/logger';
import { BeneficiaryRanking, CommodityPrice, HistoricalDataPoint } from '../models/commodity.model';

const router = Router();

const COMMODITY_DRIVERS: Record<string, string[]> = {
  BRENT: ['OPEC+ supply cuts', 'Geopolitical risk premium', 'Suez Canal disruption'],
  NATGAS: ['Winter demand spike', 'LNG export growth', 'European storage deficit'],
  WHEAT: ['Ukraine conflict risk', 'Black Sea export disruption', 'El Niño crop impact'],
  ALUMINUM: ['China smelter cuts', 'Energy cost inflation', 'EV demand tailwind'],
  BDI: ['Red Sea rerouting', 'Panama Canal drought', 'Global trade volume growth'],
};

// GET /api/commodities — all current prices
router.get('/', async (_req: Request, res: Response) => {
  try {
    const cacheKey = 'all_prices';
    const cached = cache.get<CommodityPrice[]>(cacheKey);
    if (cached) return res.json({ success: true, data: cached, cached: true });

    const [brent, natgas, wheat, aluminum, bdi] = await Promise.allSettled([
      fetchBrentPrice(),
      fetchNatGasPrice(),
      fetchWheatPrice(),
      fetchAluminumPrice(),
      fetchBDIPrice(),
    ]);

    const prices: CommodityPrice[] = [brent, natgas, wheat, aluminum, bdi]
      .map((r) => (r.status === 'fulfilled' ? r.value : null))
      .filter((p): p is CommodityPrice => p !== null);

    cache.set(cacheKey, prices, 60);
    return res.json({ success: true, data: prices, cached: false });
  } catch (err) {
    logger.error('Commodities route error:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch commodity prices' });
  }
});

// GET /api/commodities/:symbol — single commodity price
router.get('/:symbol', async (req: Request, res: Response) => {
  const symbol = req.params.symbol.toUpperCase();
  const fetchMap: Record<string, () => Promise<CommodityPrice>> = {
    BRENT: fetchBrentPrice,
    NATGAS: fetchNatGasPrice,
    WHEAT: fetchWheatPrice,
    ALUMINUM: fetchAluminumPrice,
    BDI: fetchBDIPrice,
  };

  const fetcher = fetchMap[symbol];
  if (!fetcher) {
    return res.status(404).json({ success: false, error: `Symbol ${symbol} not found` });
  }

  try {
    const data = await fetcher();
    return res.json({ success: true, data });
  } catch (err) {
    logger.error(`${symbol} price error:`, err);
    return res.status(500).json({ success: false, error: 'Failed to fetch price' });
  }
});

// GET /api/commodities/:symbol/history?days=365
router.get('/:symbol/history', async (req: Request, res: Response) => {
  const symbol = req.params.symbol.toUpperCase();
  const days = parseInt(req.query.days as string) || 365;

  const historyMap: Record<string, (n: number) => Promise<HistoricalDataPoint[]>> = {
    BRENT: fetchBrentHistory,
    NATGAS: fetchNatGasHistory,
    WHEAT: (d) => fetchWheatHistory(Math.ceil(d / 30)),
    ALUMINUM: (d) => fetchAluminumHistory(Math.ceil(d / 30)),
    BDI: fetchBDIHistory,
  };

  const fetcher = historyMap[symbol];
  if (!fetcher) {
    return res.status(404).json({ success: false, error: `Symbol ${symbol} not found` });
  }

  try {
    const data = await fetcher(days);
    return res.json({ success: true, data, symbol, days });
  } catch (err) {
    logger.error(`${symbol} history error:`, err);
    return res.status(500).json({ success: false, error: 'Failed to fetch history' });
  }
});

// GET /api/commodities/:symbol/signal
router.get('/:symbol/signal', async (req: Request, res: Response) => {
  const symbol = req.params.symbol.toUpperCase();

  const priceMap: Record<string, () => Promise<CommodityPrice>> = {
    BRENT: fetchBrentPrice,
    NATGAS: fetchNatGasPrice,
    WHEAT: fetchWheatPrice,
    ALUMINUM: fetchAluminumPrice,
    BDI: fetchBDIPrice,
  };

  const historyMap: Record<string, (n: number) => Promise<HistoricalDataPoint[]>> = {
    BRENT: fetchBrentHistory,
    NATGAS: fetchNatGasHistory,
    WHEAT: (d) => fetchWheatHistory(Math.ceil(d / 30)),
    ALUMINUM: (d) => fetchAluminumHistory(Math.ceil(d / 30)),
    BDI: fetchBDIHistory,
  };

  if (!priceMap[symbol]) {
    return res.status(404).json({ success: false, error: `Symbol ${symbol} not found` });
  }

  try {
    const [price, history] = await Promise.all([priceMap[symbol](), historyMap[symbol](365)]);
    const rawSignal = generateSignal({
      symbol,
      name: price.name,
      currentPrice: price.price,
      history,
    });
    const signal = applyFundamentalContext(rawSignal, symbol);
    return res.json({ success: true, data: signal });
  } catch (err) {
    logger.error(`${symbol} signal error:`, err);
    return res.status(500).json({ success: false, error: 'Failed to generate signal' });
  }
});

// GET /api/commodities/signals/all — all signals at once
router.get('/signals/all', async (_req: Request, res: Response) => {
  const cacheKey = 'all_signals';
  const cached = cache.get(cacheKey);
  if (cached) return res.json({ success: true, data: cached, cached: true });

  try {
    const symbols = ['BRENT', 'NATGAS', 'WHEAT', 'ALUMINUM', 'BDI'];
    const priceFetchers = [fetchBrentPrice, fetchNatGasPrice, fetchWheatPrice, fetchAluminumPrice, fetchBDIPrice];
    const historyFetchers = [
      (d: number) => fetchBrentHistory(d),
      (d: number) => fetchNatGasHistory(d),
      (d: number) => fetchWheatHistory(Math.ceil(d / 30)),
      (d: number) => fetchAluminumHistory(Math.ceil(d / 30)),
      (d: number) => fetchBDIHistory(d),
    ];

    const results = await Promise.allSettled(
      symbols.map(async (sym, i) => {
        const [price, history] = await Promise.all([priceFetchers[i](), historyFetchers[i](365)]);
        const raw = generateSignal({ symbol: sym, name: price.name, currentPrice: price.price, history });
        return applyFundamentalContext(raw, sym);
      })
    );

    const signals = results
      .map((r) => (r.status === 'fulfilled' ? r.value : null))
      .filter(Boolean);

    cache.set(cacheKey, signals, 300);
    return res.json({ success: true, data: signals, cached: false });
  } catch (err) {
    logger.error('All signals error:', err);
    return res.status(500).json({ success: false, error: 'Failed to generate signals' });
  }
});

// GET /api/commodities/rankings/beneficiaries
router.get('/rankings/beneficiaries', async (_req: Request, res: Response) => {
  const cacheKey = 'beneficiary_rankings';
  const cached = cache.get<BeneficiaryRanking[]>(cacheKey);
  if (cached) return res.json({ success: true, data: cached, cached: true });

  try {
    const symbols = ['BRENT', 'NATGAS', 'WHEAT', 'ALUMINUM', 'BDI'];
    const priceFetchers = [fetchBrentPrice, fetchNatGasPrice, fetchWheatPrice, fetchAluminumPrice, fetchBDIPrice];
    const historyFetchers = [
      (d: number) => fetchBrentHistory(d),
      (d: number) => fetchNatGasHistory(d),
      (d: number) => fetchWheatHistory(Math.ceil(d / 30)),
      (d: number) => fetchAluminumHistory(Math.ceil(d / 30)),
      (d: number) => fetchBDIHistory(d),
    ];

    const results = await Promise.allSettled(
      symbols.map(async (sym, i) => {
        const [price, history] = await Promise.all([priceFetchers[i](), historyFetchers[i](365)]);
        const raw = generateSignal({ symbol: sym, name: price.name, currentPrice: price.price, history });
        const signal = applyFundamentalContext(raw, sym);
        return { price, signal };
      })
    );

    const rankings: BeneficiaryRanking[] = results
      .map((r, i) => {
        if (r.status !== 'fulfilled') return null;
        const { price, signal } = r.value;
        return {
          rank: 0,
          symbol: symbols[i],
          name: price.name,
          signal: signal.signal,
          score: signal.score,
          currentPrice: price.price,
          changePct1d: price.changePct1d,
          drivers: COMMODITY_DRIVERS[symbols[i]] || [],
        };
      })
      .filter((r): r is BeneficiaryRanking => r !== null)
      .sort((a, b) => b.score - a.score)
      .map((r, i) => ({ ...r, rank: i + 1 }));

    cache.set(cacheKey, rankings, 300);
    return res.json({ success: true, data: rankings, cached: false });
  } catch (err) {
    logger.error('Rankings error:', err);
    return res.status(500).json({ success: false, error: 'Failed to generate rankings' });
  }
});

export default router;
