import { Router, Request, Response } from 'express';
import { query } from '../config/database';
import { cache } from '../config/cache';
import logger from '../config/logger';
import { ShippingRoute } from '../models/commodity.model';

const router = Router();

function mapRowToRoute(row: Record<string, unknown>): ShippingRoute {
  return {
    routeId: row.route_id as string,
    name: row.name as string,
    origin: row.origin as string,
    destination: row.destination as string,
    riskLevel: row.risk_level as ShippingRoute['riskLevel'],
    status: row.status as string,
    description: row.description as string,
    coordinates: {
      origin: [parseFloat(row.lat_origin as string), parseFloat(row.lng_origin as string)],
      destination: [parseFloat(row.lat_dest as string), parseFloat(row.lng_dest as string)],
    },
    updatedAt: (row.updated_at as Date).toISOString(),
  };
}

// GET /api/shipping — all routes
router.get('/', async (_req: Request, res: Response) => {
  const cacheKey = 'shipping_routes';
  const cached = cache.get<ShippingRoute[]>(cacheKey);
  if (cached) return res.json({ success: true, data: cached });

  try {
    const result = await query(
      'SELECT * FROM shipping_routes ORDER BY CASE risk_level WHEN \'CRITICAL\' THEN 1 WHEN \'HIGH\' THEN 2 WHEN \'MEDIUM\' THEN 3 ELSE 4 END'
    );

    const routes = result.rows.map(mapRowToRoute);
    cache.set(cacheKey, routes, 600);
    return res.json({ success: true, data: routes });
  } catch (err) {
    logger.error('Shipping routes DB error:', err);
    // Return static fallback
    return res.json({
      success: true,
      data: STATIC_ROUTES,
      fallback: true,
    });
  }
});

// GET /api/shipping/:routeId
router.get('/:routeId', async (req: Request, res: Response) => {
  const { routeId } = req.params;

  try {
    const result = await query(
      'SELECT * FROM shipping_routes WHERE route_id = $1',
      [routeId.toUpperCase()]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Route not found' });
    }

    return res.json({ success: true, data: mapRowToRoute(result.rows[0]) });
  } catch (err) {
    logger.error('Single route error:', err);
    return res.status(500).json({ success: false, error: 'Database error' });
  }
});

export default router;

// Static fallback when DB is not available
const STATIC_ROUTES: ShippingRoute[] = [
  {
    routeId: 'SUEZ',
    name: 'Suez Canal',
    origin: 'Red Sea',
    destination: 'Mediterranean',
    riskLevel: 'HIGH',
    status: 'Disrupted - Houthi Attacks',
    description: 'Houthi missile attacks forcing re-routing via Cape of Good Hope (+14 days)',
    coordinates: { origin: [12.5, 43.5], destination: [31.5, 32.3] },
    updatedAt: new Date().toISOString(),
  },
  {
    routeId: 'HORMUZ',
    name: 'Strait of Hormuz',
    origin: 'Persian Gulf',
    destination: 'Arabian Sea',
    riskLevel: 'MEDIUM',
    status: 'Monitored - Iran Tensions',
    description: 'Critical chokepoint for Gulf oil exports; Iran-US tensions elevate risk',
    coordinates: { origin: [26.6, 56.2], destination: [24.5, 58.7] },
    updatedAt: new Date().toISOString(),
  },
  {
    routeId: 'MALACCA',
    name: 'Strait of Malacca',
    origin: 'Indian Ocean',
    destination: 'South China Sea',
    riskLevel: 'LOW',
    status: 'Normal Operations',
    description: 'Busiest shipping lane for Asia-Pacific trade; piracy risk remains low',
    coordinates: { origin: [5.3, 100.3], destination: [1.3, 103.8] },
    updatedAt: new Date().toISOString(),
  },
  {
    routeId: 'PANAMA',
    name: 'Panama Canal',
    origin: 'Atlantic Ocean',
    destination: 'Pacific Ocean',
    riskLevel: 'MEDIUM',
    status: 'Restricted - Low Water',
    description: 'Drought conditions reducing daily transits from 36 to 22 vessels',
    coordinates: { origin: [9.0, -79.7], destination: [8.9, -79.5] },
    updatedAt: new Date().toISOString(),
  },
  {
    routeId: 'TAIWAN',
    name: 'Taiwan Strait',
    origin: 'East China Sea',
    destination: 'South China Sea',
    riskLevel: 'HIGH',
    status: 'Elevated Military Activity',
    description: 'PLA military exercises increasing navigation complexity',
    coordinates: { origin: [24.5, 119.5], destination: [25.0, 122.0] },
    updatedAt: new Date().toISOString(),
  },
  {
    routeId: 'BOSPHORUS',
    name: 'Bosphorus Strait',
    origin: 'Black Sea',
    destination: 'Mediterranean',
    riskLevel: 'MEDIUM',
    status: 'Russia Sanctions Impact',
    description: 'Russian oil tanker movements restricted; Turkey enforcing insurance requirements',
    coordinates: { origin: [41.1, 29.0], destination: [41.0, 28.9] },
    updatedAt: new Date().toISOString(),
  },
];
