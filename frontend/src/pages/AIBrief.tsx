import { Brain, CheckCircle2, Sparkles, TrendingDown, TrendingUp } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type React from 'react';
import SignalBadge from '../components/SignalBadge';
import type { DashboardSummary, InvestmentSignal } from '../types';
import { formatPct, formatPrice, formatUnit } from '../utils/format';

interface Props {
  data: DashboardSummary | null;
}

export default function AIBrief({ data }: Props) {
  const strongest = [...(data?.signals ?? [])].sort((a, b) => b.score - a.score).slice(0, 3);
  const weakest = [...(data?.signals ?? [])].sort((a, b) => a.score - b.score).slice(0, 2);
  const riskRoutes = data?.shippingRoutes.filter((r) => r.riskLevel === 'HIGH' || r.riskLevel === 'CRITICAL') ?? [];
  const bearishNews = data?.news.filter((n) => n.sentiment === 'bearish').slice(0, 3) ?? [];

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-indigo-500/20 bg-indigo-500/10 p-5">
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.35em] text-indigo-200">
          <Sparkles size={16} />
          AI brief
        </div>
        <h1 className="text-3xl font-bold text-white">Decision brief for trade planning</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-indigo-100/80">
          This demo turns live market data into a structured brief for sales, finance, procurement, and operations.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <BriefCard title="What changed" icon={TrendingUp}>
          <ul className="space-y-3 text-sm leading-6 text-slate-300">
            {strongest.map((signal) => (
              <SignalLine key={signal.symbol} signal={signal} data={data} />
            ))}
          </ul>
        </BriefCard>

        <BriefCard title="Risk drivers" icon={TrendingDown}>
          <ul className="space-y-3 text-sm leading-6 text-slate-300">
            {weakest.map((signal) => (
              <SignalLine key={signal.symbol} signal={signal} data={data} />
            ))}
            {riskRoutes.slice(0, 2).map((route) => (
              <li key={route.routeId} className="rounded-lg border border-red-500/20 bg-red-500/10 p-3">
                <div className="font-semibold text-red-200">{route.name}</div>
                <div className="text-xs text-red-200/70">{route.riskLevel} route risk - {route.status}</div>
              </li>
            ))}
          </ul>
        </BriefCard>

        <BriefCard title="Recommended actions" icon={CheckCircle2}>
          <div className="space-y-3 text-sm leading-6 text-slate-300">
            <p>Review customer quotes exposed to energy, freight, or metals input cost changes.</p>
            <p>Flag routes with high risk for procurement and logistics planning.</p>
            <p>Use bearish news themes as watchlist items, not automatic trade decisions.</p>
          </div>
        </BriefCard>
      </section>

      <section className="rounded-xl border border-slate-700 bg-slate-800/60 p-4">
        <h3 className="mb-3 flex items-center gap-2 font-semibold text-slate-100">
          <Brain size={18} className="text-indigo-300" />
          News Context Included In Brief
        </h3>
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          {(bearishNews.length ? bearishNews : data?.news.slice(0, 3) ?? []).map((item) => (
            <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-slate-700 bg-slate-900/60 p-3 transition hover:border-indigo-500/50">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-indigo-300">{item.category}</div>
              <div className="line-clamp-2 text-sm font-semibold text-slate-100">{item.title}</div>
              <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">{item.description}</p>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}

function BriefCard({ title, icon: Icon, children }: { title: string; icon: LucideIcon; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-4">
      <h3 className="mb-4 flex items-center gap-2 font-semibold text-slate-100">
        <Icon size={18} className="text-indigo-300" />
        {title}
      </h3>
      {children}
    </div>
  );
}

function SignalLine({ signal, data }: { signal: InvestmentSignal; data: DashboardSummary | null }) {
  const price = data?.prices.find((p) => p.symbol === signal.symbol);
  return (
    <li className="rounded-lg border border-slate-700 bg-slate-900/60 p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="font-semibold text-slate-100">{price?.name ?? signal.symbol}</div>
          {price && (
            <div className="text-xs text-slate-500">
              {formatPrice(price.price, price.symbol)} {formatUnit(price.symbol)} / {formatPct(price.changePct1d)}
            </div>
          )}
        </div>
        <SignalBadge signal={signal.signal} score={signal.score} />
      </div>
      <p className="mt-2 text-xs leading-5 text-slate-500">{signal.reasoning}</p>
    </li>
  );
}
