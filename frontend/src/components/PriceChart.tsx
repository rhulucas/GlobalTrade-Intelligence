import { useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { useHistory } from '../hooks/useHistory';
import type { CommodityPrice, TimeRange } from '../types';
import { getCommodityColor, formatUnit } from '../utils/format';

interface Props {
  commodity: CommodityPrice;
}

const TIME_RANGES: TimeRange[] = ['1W', '1M', '3M', '6M', '1Y'];

// Custom tooltip
function CustomTooltip({ active, payload, label, unit }: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
  unit: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-xl">
      <p className="text-slate-400 text-xs mb-1">{label}</p>
      <p className="text-white font-mono font-bold text-lg">
        {payload[0].value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 3 })}
        <span className="text-slate-400 font-normal text-xs ml-1">{unit}</span>
      </p>
    </div>
  );
}

function formatXAxis(dateStr: string, range: TimeRange): string {
  const d = new Date(dateStr);
  if (range === '1W') return d.toLocaleDateString('en-US', { weekday: 'short' });
  if (range === '1M') return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  if (range === '3M' || range === '6M') return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
}

export default function PriceChart({ commodity }: Props) {
  const [range, setRange] = useState<TimeRange>('3M');
  const { data, loading, error } = useHistory(commodity.symbol, range);
  const color = getCommodityColor(commodity.symbol);
  const unit = formatUnit(commodity.symbol);

  // Thin out data for performance
  const chartData = (() => {
    if (!data.length) return [];
    const maxPoints = 120;
    if (data.length <= maxPoints) return data;
    const step = Math.ceil(data.length / maxPoints);
    return data.filter((_, i) => i % step === 0 || i === data.length - 1);
  })();

  const prices = chartData.map((d) => d.price);
  const minPrice = prices.length ? Math.min(...prices) * 0.98 : 0;
  const maxPrice = prices.length ? Math.max(...prices) * 1.02 : 100;
  const avgPrice = prices.length ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;

  const firstPrice = chartData[0]?.price;
  const lastPrice = chartData[chartData.length - 1]?.price;
  const totalChange = firstPrice && lastPrice ? ((lastPrice - firstPrice) / firstPrice) * 100 : 0;

  return (
    <div className="bg-slate-800/60 rounded-xl border border-slate-700 p-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h3 className="text-slate-100 font-semibold">
            {commodity.name} — Price History
          </h3>
          <p className="text-slate-500 text-xs mt-0.5">
            {range} change:&nbsp;
            <span className={totalChange >= 0 ? 'text-emerald-400' : 'text-red-400'}>
              {totalChange >= 0 ? '+' : ''}{totalChange.toFixed(2)}%
            </span>
          </p>
        </div>

        {/* Range Selector */}
        <div className="flex gap-1 bg-slate-900 rounded-lg p-1">
          {TIME_RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                range === r
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="flex items-center gap-2 text-slate-400">
            <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Loading chart data...</span>
          </div>
        </div>
      ) : error ? (
        <div className="h-64 flex items-center justify-center text-red-400 text-sm">
          Failed to load chart: {error}
        </div>
      ) : chartData.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-slate-500 text-sm">
          No data available
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`gradient-${commodity.symbol}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={(v) => formatXAxis(v, range)}
              tick={{ fill: '#64748b', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[minPrice, maxPrice]}
              tickFormatter={(v) =>
                v >= 1000
                  ? `${(v / 1000).toFixed(1)}k`
                  : v.toFixed(commodity.symbol === 'NATGAS' ? 2 : 1)
              }
              tick={{ fill: '#64748b', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={52}
            />
            <Tooltip content={<CustomTooltip unit={unit} />} />
            {/* Average reference line */}
            <ReferenceLine
              y={avgPrice}
              stroke="#475569"
              strokeDasharray="4 4"
              label={{ value: `Avg ${avgPrice.toFixed(1)}`, fill: '#64748b', fontSize: 10, position: 'right' }}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke={color}
              strokeWidth={2}
              fill={`url(#gradient-${commodity.symbol})`}
              dot={false}
              activeDot={{ r: 5, fill: color, stroke: '#1e293b', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}

      {/* Stats row */}
      {!loading && chartData.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-700">
          {[
            { label: 'Period High', value: Math.max(...prices).toFixed(commodity.symbol === 'BDI' ? 0 : 2), suffix: unit },
            { label: 'Period Low', value: Math.min(...prices).toFixed(commodity.symbol === 'BDI' ? 0 : 2), suffix: unit },
            { label: 'Average', value: avgPrice.toFixed(commodity.symbol === 'BDI' ? 0 : 2), suffix: unit },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-slate-500 text-xs">{stat.label}</div>
              <div className="text-slate-200 font-mono text-sm font-medium mt-0.5">
                {stat.value} <span className="text-slate-500 text-xs">{stat.suffix}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
