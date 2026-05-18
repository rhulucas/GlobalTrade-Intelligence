import { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { AlertTriangle, BarChart2, Globe2, Newspaper, Ship } from 'lucide-react';
import CommodityCard from '../components/CommodityCard';
import PriceChart from '../components/PriceChart';
import ShippingMap from '../components/ShippingMap';
import NewsPanel from '../components/NewsPanel';
import BeneficiaryRankingPanel from '../components/BeneficiaryRanking';
import SignalDetail from '../components/SignalDetail';
import type { DashboardSummary } from '../types';

interface Props {
  data: DashboardSummary | null;
}

export default function Dashboard({ data }: Props) {
  const [selectedSymbol, setSelectedSymbol] = useState<string>('BRENT');

  const selectedPrice = data?.prices.find((p) => p.symbol === selectedSymbol);
  const selectedSignal = data?.signals.find((s) => s.symbol === selectedSymbol);
  const highRiskCount = data?.shippingRoutes.filter((r) => r.riskLevel === 'HIGH' || r.riskLevel === 'CRITICAL').length ?? 0;
  const bearishCount = data?.signals.filter((s) => s.signal === 'BEARISH').length ?? 0;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-5 shadow-2xl shadow-slate-950/40">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.35em] text-indigo-300">
              <Globe2 size={16} />
              Executive Monitor
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Global trade risk dashboard</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
              Live commodity prices, shipping chokepoints, macro signals, and news context in one operating view.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Metric label="Commodities" value={data?.prices.length ?? 0} icon={BarChart2} />
            <Metric label="News Items" value={data?.news.length ?? 0} icon={Newspaper} />
            <Metric label="Routes" value={data?.shippingRoutes.length ?? 0} icon={Ship} />
            <Metric label="Risk Alerts" value={highRiskCount + bearishCount} icon={AlertTriangle} tone="red" />
          </div>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center gap-2">
          <BarChart2 size={16} className="text-indigo-400" />
          <h2 className="text-sm font-medium uppercase tracking-wider text-slate-300">Commodity Prices</h2>
          <span className="text-xs text-slate-600">click to analyze</span>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {data?.prices.map((price) => (
            <CommodityCard
              key={price.symbol}
              price={price}
              signal={data.signals.find((s) => s.symbol === price.symbol)}
              selected={selectedSymbol === price.symbol}
              onClick={() => setSelectedSymbol(price.symbol)}
            />
          ))}
        </div>
      </section>

      {selectedPrice && (
        <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <PriceChart commodity={selectedPrice} />
          </div>
          <div>{selectedSignal && <SignalDetail signal={selectedSignal} commodityName={selectedPrice.name} />}</div>
        </section>
      )}

      {data?.shippingRoutes && <ShippingMap routes={data.shippingRoutes} />}

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <BeneficiaryRankingPanel rankings={data?.beneficiaries ?? []} onSelect={setSelectedSymbol} />
        </div>
        <div className="lg:col-span-3">
          <NewsPanel news={data?.news ?? []} maxItems={8} />
        </div>
      </section>
    </div>
  );
}

function Metric({
  label,
  value,
  icon: Icon,
  tone = 'indigo',
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  tone?: 'indigo' | 'red';
}) {
  return (
    <div className={`rounded-xl border p-3 ${tone === 'red' ? 'border-red-500/20 bg-red-500/10' : 'border-indigo-500/20 bg-indigo-500/10'}`}>
      <div className={`mb-2 inline-flex rounded-lg p-2 ${tone === 'red' ? 'bg-red-500/10 text-red-300' : 'bg-indigo-500/10 text-indigo-300'}`}>
        <Icon size={16} />
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div>
    </div>
  );
}
