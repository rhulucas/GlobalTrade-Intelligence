import { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { AlertTriangle, BarChart2, Brain, Database, Globe2, Newspaper, Ship, TrendingUp } from 'lucide-react';
import CommodityCard from '../components/CommodityCard';
import PriceChart from '../components/PriceChart';
import ShippingMap from '../components/ShippingMap';
import NewsPanel from '../components/NewsPanel';
import BeneficiaryRankingPanel from '../components/BeneficiaryRanking';
import SignalDetail from '../components/SignalDetail';
import type { DashboardSummary, PageKey } from '../types';

interface Props {
  data: DashboardSummary | null;
  onNavigate: (page: PageKey) => void;
}

export default function Dashboard({ data, onNavigate }: Props) {
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
              Global trade intelligence platform
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Turn commodity, shipping, macro, and news data into business decisions.
            </h1>
            <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-400">
              This demo helps trade, procurement, finance, and operations teams monitor market changes,
              understand the business impact, and prepare AI-assisted decisions from public data sources.
            </p>
            <div className="mt-4 grid max-w-4xl grid-cols-1 gap-3 md:grid-cols-3">
              <IntroCard
                icon={TrendingUp}
                title="Monitor live inputs"
                text="Track Brent, natural gas, wheat, aluminum, freight, and market-moving news."
              />
              <IntroCard
                icon={AlertTriangle}
                title="Explain risk impact"
                text="Connect price movement and route risk to sourcing, quotes, margin, and delivery plans."
              />
              <IntroCard
                icon={Brain}
                title="Generate AI brief"
                text="Summarize the current situation into actions that business teams can review."
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Metric label="Commodities" value={data?.prices.length ?? 0} icon={BarChart2} />
            <Metric label="News Items" value={data?.news.length ?? 0} icon={Newspaper} />
            <Metric label="Routes" value={data?.shippingRoutes.length ?? 0} icon={Ship} />
            <Metric label="Risk Alerts" value={highRiskCount + bearishCount} icon={AlertTriangle} tone="red" />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-3 lg:grid-cols-4">
        <StartButton
          icon={BarChart2}
          label="Review commodity signals"
          description="See prices, charts, and signal reasoning."
          onClick={() => onNavigate('commodities')}
        />
        <StartButton
          icon={Ship}
          label="Check shipping risk"
          description="Open route risk and chokepoint status."
          onClick={() => onNavigate('shipping')}
        />
        <StartButton
          icon={Brain}
          label="Read AI brief"
          description="Get a structured market decision summary."
          onClick={() => onNavigate('ai-brief')}
        />
        <StartButton
          icon={Database}
          label="Open data center"
          description="Inspect the data tables behind the demo."
          onClick={() => onNavigate('data-center')}
        />
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

function IntroCard({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text: string }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
      <div className="mb-2 inline-flex rounded-lg bg-indigo-500/10 p-2 text-indigo-300">
        <Icon size={16} />
      </div>
      <div className="text-sm font-semibold text-slate-100">{title}</div>
      <p className="mt-1 text-xs leading-5 text-slate-500">{text}</p>
    </div>
  );
}

function StartButton({
  icon: Icon,
  label,
  description,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-xl border border-slate-800 bg-slate-900 p-4 text-left transition hover:border-indigo-500/50 hover:bg-slate-800"
    >
      <div className="mb-3 inline-flex rounded-lg bg-indigo-500/10 p-2 text-indigo-300">
        <Icon size={18} />
      </div>
      <div className="font-semibold text-slate-100">{label}</div>
      <p className="mt-1 text-sm leading-5 text-slate-500">{description}</p>
    </button>
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
