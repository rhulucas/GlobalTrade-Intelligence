import NodeCache from 'node-cache';

const CACHE_TTL = parseInt(process.env.CACHE_TTL || '300');
const PRICE_CACHE_TTL = parseInt(process.env.PRICE_CACHE_TTL || '60');

export const cache = new NodeCache({ stdTTL: CACHE_TTL, checkperiod: 60 });
export const priceCache = new NodeCache({ stdTTL: PRICE_CACHE_TTL, checkperiod: 30 });

export function getCached<T>(key: string): T | undefined {
  return cache.get<T>(key);
}

export function setCached<T>(key: string, value: T, ttl?: number): void {
  if (ttl !== undefined) {
    cache.set(key, value, ttl);
  } else {
    cache.set(key, value);
  }
}

export function invalidate(key: string): void {
  cache.del(key);
}
