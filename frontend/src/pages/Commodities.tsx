import { useState } from 'react';
import { BarChart2, LineChart, TrendingDown, TrendingUp } from 'lucide-react';
import CommodityCard from '../components/CommodityCard';
import PriceChart from '../components/PriceChart';
import SignalBadge from '../components/SignalBadge';
import SignalDetail from '../components/SignalDetail';
import type { DashboardSummary } from '../types';
import { formatPct, formatPrice, formatUnit } from '../utils/format';

interface Props {
  data: DashboardSummary | null;
}

export default function Commodities({ data }: Props) {
  const [selectedSymbol, setSelectedSymbol] = useState('BRENT');
  const selectedPrice = data?.prices.find((p) => p.symbol === selectedSymbol) ?? data?.prices[0];
  const selectedSignal = data?.signals.find((s) => s.symbol === selectedPrice?.symbol);

  return (
    <div className="space-y-6">
      <PageTitle
        eyebrow="Commodity intelligence"
        title="Live commodity signal desk"
        description="Track market prices, signal strength, source freshness, and AI-ready reasoning for the core trade inputs in this demo."
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {data?.prices.map((price) => (
          <CommodityCard
            key={price.symbol}
            price={price}
            signal={data.signals.find((s) => s.symbol === price.symbol)}
            selected={selectedPrice?.symbol === price.symbol}
            onClick={() => setSelectedSymbol(price.symbol)}
          />
        ))}
      </div>

      {selectedPrice && (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <PriceChart commodity={selectedPrice} />
          </div>
          <div>{selectedSignal && <SignalDetail signal={selectedSignal} commodityName={selectedPrice.name} />}</div>
        </div>
      )}

      <div className="rounded-xl border border-slate-700 bg-slate-800/60">
        <div className="border-b border-slate-700 p-4">
          <h3 className="flex items-center gap-2 font-semibold text-slate-100">
            <BarChart2 size={18} className="text-indigo-400" />
            Commodity Monitor Table
          </h3>
          <p className="mt-1 text-xs text-slate-500">Snapshot view for sales, finance, and analyst workflows.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-slate-900/70 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">Commodity</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">1D Change</th>
                <th className="px-4 py-3">Signal</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Price Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/70">
              {data?.prices.map((price) => {
                const signal = data.signals.find((s) => s.symbol === price.symbol);
                const positive = price.changePct1d >= 0;
                return (
                  <tr key={price.symbol} className="hover:bg-slate-700/25">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-100">{price.name}</div>
                      <div className="font-mono text-xs text-slate-500">{price.symbol}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-200">
                      {formatPrice(price.price, price.symbol)} <span className="text-xs text-slate-500">{formatUnit(price.symbol)}</span>
                    </td>
                    <td className={`px-4 py-3 font-mono ${positive ? 'text-emerald-400' : 'text-red-400'}`}>
                      <span className="inline-flex items-center gap-1">
                        {positive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        {formatPct(price.changePct1d)}
                      </span>
                    </td>
                    <td className="px-4 py-3">{signal && <SignalBadge signal={signal.signal} score={signal.score} />}</td>
                    <td className="px-4 py-3 text-slate-400">{price.source}</td>
                    <td className="px-4 py-3 text-slate-500">{price.priceDate}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function PageTitle({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.35em] text-indigo-300">
        <LineChart size={16} />
        {eyebrow}
      </div>
      <h1 className="text-3xl font-bold text-white">{title}</h1>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">{description}</p>
    </div>
  );
}
