import { useState, useEffect } from 'react';
import { fetchHistory } from '../services/api';
import type { HistoricalDataPoint, TimeRange } from '../types';

const RANGE_TO_DAYS: Record<TimeRange, number> = {
  '1W': 7,
  '1M': 30,
  '3M': 90,
  '6M': 180,
  '1Y': 365,
};

export function useHistory(symbol: string, range: TimeRange = '1Y') {
  const [data, setData] = useState<HistoricalDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const days = RANGE_TO_DAYS[range];
    fetchHistory(symbol, days)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [symbol, range]);

  return { data, loading, error };
}
