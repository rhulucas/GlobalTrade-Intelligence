import { BadgeDollarSign, Banknote, BarChart3, Globe2, Landmark, Waves } from 'lucide-react';
import type { DashboardSummary } from '../types';

interface Props {
  data: DashboardSummary | null;
}

export default function Macro({ data }: Props) {
  const brent = data?.prices.find((p) => p.symbol === 'BRENT');
  const bdi = data?.prices.find((p) => p.symbol === 'BDI');
  const wheat = data?.prices.find((p) => p.symbol === 'WHEAT');

  const indicators = [
    {
      label: 'Energy Inflation Proxy',
      value: brent ? `$${brent.price.toFixed(2)}` : '--',
      note: 'Brent crude benchmark from EIA',
      icon: BadgeDollarSign,
      tone: 'orange',
    },
    {
      label: 'Freight Cycle Proxy',
      value: bdi ? Math.round(bdi.price).toLocaleString('en-US') : '--',
      note: 'Baltic Dry Index via FRED',
      icon: Waves,
      tone: 'cyan',
    },
    {
      label: 'Food Input Proxy',
      value: wheat ? `$${wheat.price.toFixed(0)}` : '--',
      note: 'Wheat reference from World Bank data',
      icon: BarChart3,
      tone: 'yellow',
    },
    {
      label: 'Policy Watch',
      value: 'FRED',
      note: 'Ready for rates, CPI, PMI, and FX series expansion',
      icon: Landmark,
      tone: 'indigo',
    },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.35em] text-indigo-300">
          <Globe2 size={16} />
          Macro monitor
        </div>
        <h1 className="text-3xl font-bold text-white">Macro and trade pressure signals</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
          A planning layer for connecting commodity moves to inflation, freight, sourcing, and policy risks.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {indicators.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="rounded-xl border border-slate-700 bg-slate-800/60 p-4">
              <div className={`mb-4 inline-flex rounded-xl p-3 ${toneClass(item.tone)}`}>
                <Icon size={20} />
              </div>
              <div className="text-3xl font-bold text-white">{item.value}</div>
              <div className="mt-2 font-semibold text-slate-200">{item.label}</div>
              <p className="mt-1 text-sm leading-6 text-slate-500">{item.note}</p>
            </div>
          );
        })}
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-4">
          <h3 className="mb-3 flex items-center gap-2 font-semibold text-slate-100">
            <Banknote size={18} className="text-emerald-300" />
            Business Interpretation
          </h3>
          <div className="space-y-3 text-sm leading-6 text-slate-400">
            <p>Sales can use commodity and freight shifts to explain quote changes and delivery timing.</p>
            <p>Finance can monitor margin exposure when input prices or shipping costs move quickly.</p>
            <p>Operations can use the same signals to prepare inventory and supplier alternatives.</p>
          </div>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-4">
          <h3 className="mb-3 font-semibold text-slate-100">Next Data Expansion</h3>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {['US CPI', 'Fed Funds Rate', 'Dollar Index', 'PMI', 'Container Rates', 'Import Volumes'].map((item) => (
              <div key={item} className="rounded-lg border border-slate-700 bg-slate-900/50 px-3 py-2 text-sm text-slate-300">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function toneClass(tone: string) {
  const map: Record<string, string> = {
    orange: 'bg-orange-500/10 text-orange-300',
    cyan: 'bg-cyan-500/10 text-cyan-300',
    yellow: 'bg-yellow-500/10 text-yellow-300',
    indigo: 'bg-indigo-500/10 text-indigo-300',
  };
  return map[tone] ?? 'bg-slate-700 text-slate-300';
}
