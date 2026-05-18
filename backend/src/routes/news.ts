import { Router, Request, Response } from 'express';
import { fetchGeopoliticalNews } from '../services/news.service';
import logger from '../config/logger';

const router = Router();

// GET /api/news
router.get('/', async (req: Request, res: Response) => {
  try {
    const news = await fetchGeopoliticalNews();

    // Optional filter by commodity symbol
    const { commodity } = req.query;
    if (commodity && typeof commodity === 'string') {
      const sym = commodity.toUpperCase();
      const filtered = news.filter((n) => n.relatedCommodities.includes(sym));
      return res.json({ success: true, data: filtered, total: filtered.length });
    }

    return res.json({ success: true, data: news, total: news.length });
  } catch (err) {
    logger.error('News route error:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch news' });
  }
});

export default router;
