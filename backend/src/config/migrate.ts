import { pool } from './database';
import logger from './logger';
import dotenv from 'dotenv';

dotenv.config();

const migrations = `
  CREATE TABLE IF NOT EXISTS commodity_prices (
    id            SERIAL PRIMARY KEY,
    symbol        VARCHAR(20) NOT NULL,
    name          VARCHAR(100) NOT NULL,
    price         DECIMAL(15, 4) NOT NULL,
    currency      VARCHAR(10) DEFAULT 'USD',
    unit          VARCHAR(50),
    change_1d     DECIMAL(10, 4),
    change_pct_1d DECIMAL(8, 4),
    source        VARCHAR(50),
    fetched_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    price_date    DATE
  );

  CREATE INDEX IF NOT EXISTS idx_commodity_prices_symbol ON commodity_prices(symbol);
  CREATE INDEX IF NOT EXISTS idx_commodity_prices_fetched_at ON commodity_prices(fetched_at DESC);
  CREATE INDEX IF NOT EXISTS idx_commodity_prices_symbol_date ON commodity_prices(symbol, price_date DESC);

  CREATE TABLE IF NOT EXISTS price_history (
    id         SERIAL PRIMARY KEY,
    symbol     VARCHAR(20) NOT NULL,
    price      DECIMAL(15, 4) NOT NULL,
    price_date DATE NOT NULL,
    source     VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(symbol, price_date)
  );

  CREATE INDEX IF NOT EXISTS idx_price_history_symbol_date ON price_history(symbol, price_date DESC);

  CREATE TABLE IF NOT EXISTS investment_signals (
    id           SERIAL PRIMARY KEY,
    symbol       VARCHAR(20) NOT NULL,
    signal       VARCHAR(20) NOT NULL CHECK (signal IN ('BULLISH','NEUTRAL','BEARISH')),
    score        INTEGER CHECK (score BETWEEN 0 AND 100),
    reasoning    TEXT,
    factors      JSONB,
    generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  CREATE INDEX IF NOT EXISTS idx_signals_symbol ON investment_signals(symbol);

  CREATE TABLE IF NOT EXISTS shipping_routes (
    id           SERIAL PRIMARY KEY,
    route_id     VARCHAR(50) UNIQUE NOT NULL,
    name         VARCHAR(200) NOT NULL,
    origin       VARCHAR(100),
    destination  VARCHAR(100),
    risk_level   VARCHAR(20) CHECK (risk_level IN ('LOW','MEDIUM','HIGH','CRITICAL')),
    status       VARCHAR(50),
    description  TEXT,
    lat_origin   DECIMAL(9, 6),
    lng_origin   DECIMAL(9, 6),
    lat_dest     DECIMAL(9, 6),
    lng_dest     DECIMAL(9, 6),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  INSERT INTO shipping_routes (route_id, name, origin, destination, risk_level, status, description,
    lat_origin, lng_origin, lat_dest, lng_dest)
  VALUES
    ('SUEZ', 'Suez Canal', 'Red Sea', 'Mediterranean', 'HIGH', 'Disrupted - Houthi Attacks',
     'Houthi missile attacks forcing re-routing via Cape of Good Hope (+14 days)',
     12.5, 43.5, 31.5, 32.3),
    ('HORMUZ', 'Strait of Hormuz', 'Persian Gulf', 'Arabian Sea', 'MEDIUM', 'Monitored - Iran Tensions',
     'Critical chokepoint for Gulf oil exports; Iran-US tensions elevate risk',
     26.6, 56.2, 24.5, 58.7),
    ('MALACCA', 'Strait of Malacca', 'Indian Ocean', 'South China Sea', 'LOW', 'Normal Operations',
     'Busiest shipping lane for Asia-Pacific trade; piracy risk remains low',
     5.3, 100.3, 1.3, 103.8),
    ('PANAMA', 'Panama Canal', 'Atlantic Ocean', 'Pacific Ocean', 'MEDIUM', 'Restricted - Low Water',
     'Drought conditions reducing daily transits from 36 to 22 vessels',
     9.0, -79.7, 8.9, -79.5),
    ('TAIWAN', 'Taiwan Strait', 'East China Sea', 'South China Sea', 'HIGH', 'Elevated Military Activity',
     'PLA military exercises increasing navigation complexity',
     24.5, 119.5, 25.0, 122.0),
    ('BOSPHORUS', 'Bosphorus Strait', 'Black Sea', 'Mediterranean', 'MEDIUM', 'Russia Sanctions Impact',
     'Russian oil tanker movements restricted; Turkey enforcing insurance requirements',
     41.1, 29.0, 41.0, 28.9)
  ON CONFLICT (route_id) DO UPDATE SET
    risk_level  = EXCLUDED.risk_level,
    status      = EXCLUDED.status,
    description = EXCLUDED.description,
    updated_at  = NOW();
`;

async function migrate() {
  try {
    logger.info('Running database migrations...');
    await pool.query(migrations);
    logger.info('Migrations completed successfully');
    process.exit(0);
  } catch (err) {
    logger.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
