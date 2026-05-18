import { AlertTriangle, ArrowRight, Route, Sparkles } from 'lucide-react';
import type { DashboardSummary } from '../types';

interface Props {
  data: DashboardSummary | null;
}

const SCENARIOS = [
  {
    name: 'Suez / Red Sea disruption',
    shock: 'Longer routes and higher insurance costs',
    impact: ['Shipping risk rises', 'Energy transit sensitivity increases', 'Delivery timing widens'],
  },
  {
    name: 'Oil price +10%',
    shock: 'Fuel and chemical feedstock pressure',
    impact: ['Freight costs rise', 'Margins tighten', 'Energy-heavy customers need quote review'],
  },
  {
    name: 'Wheat export restriction',
    shock: 'Food commodity volatility',
    impact: ['Agriculture pricing risk rises', 'Trade partners seek alternatives', 'Emerging market import pressure'],
  },
];

export default function Scenario({ data }: Props) {
  const highRiskRoutes = data?.shippingRoutes.filter((r) => r.riskLevel === 'HIGH' || r.riskLevel === 'CRITICAL') ?? [];
  const volatileSignals = data?.signals.filter((s) => s.signal !== 'NEUTRAL') ?? [];

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.35em] text-indigo-300">
          <Route size={16} />
          Scenario lab
        </div>
        <h1 className="text-3xl font-bold text-white">Trade scenario planning</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
          Compare plausible supply-chain shocks against current market and shipping conditions.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {SCENARIOS.map((scenario) => (
          <div key={scenario.name} className="rounded-xl border border-slate-700 bg-slate-800/60 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-indigo-300">
              <Sparkles size={16} />
              Scenario
            </div>
            <h3 className="text-xl font-bold text-white">{scenario.name}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">{scenario.shock}</p>
            <div className="mt-4 space-y-2">
              {scenario.impact.map((impact) => (
                <div key={impact} className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/50 px-3 py-2 text-sm text-slate-300">
                  <ArrowRight size={14} className="text-indigo-300" />
                  {impact}
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-4">
          <h3 className="mb-3 flex items-center gap-2 font-semibold text-slate-100">
            <AlertTriangle size={18} className="text-red-300" />
            Current Route Inputs
          </h3>
          <div className="space-y-2">
            {(highRiskRoutes.length ? highRiskRoutes : data?.shippingRoutes ?? []).slice(0, 5).map((route) => (
              <div key={route.routeId} className="rounded-lg border border-slate-700 bg-slate-900/50 p-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-slate-100">{route.name}</span>
                  <span className="rounded-full bg-red-500/10 px-2 py-1 text-xs font-semibold text-red-300">{route.riskLevel}</span>
                </div>
                <p className="mt-1 text-xs text-slate-500">{route.status}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-4">
          <h3 className="mb-3 font-semibold text-slate-100">Current Commodity Inputs</h3>
          <div className="space-y-2">
            {volatileSignals.slice(0, 5).map((signal) => {
              const price = data?.prices.find((p) => p.symbol === signal.symbol);
              return (
                <div key={signal.symbol} className="rounded-lg border border-slate-700 bg-slate-900/50 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold text-slate-100">{price?.name ?? signal.symbol}</span>
                    <span className="rounded-full bg-indigo-500/10 px-2 py-1 text-xs font-semibold text-indigo-300">
                      {signal.signal} / {signal.score}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{signal.reasoning}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
