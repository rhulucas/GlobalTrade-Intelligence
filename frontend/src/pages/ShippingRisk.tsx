import { AlertTriangle, CheckCircle2, Ship, ShieldAlert } from 'lucide-react';
import ShippingMap from '../components/ShippingMap';
import type { DashboardSummary, ShippingRoute } from '../types';

interface Props {
  data: DashboardSummary | null;
}

export default function ShippingRisk({ data }: Props) {
  const routes = data?.shippingRoutes ?? [];
  const critical = routes.filter((r) => r.riskLevel === 'CRITICAL').length;
  const high = routes.filter((r) => r.riskLevel === 'HIGH').length;
  const watchlist = routes.filter((r) => r.riskLevel === 'HIGH' || r.riskLevel === 'CRITICAL');

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300">
              <Ship size={16} />
              Shipping risk
            </div>
            <h1 className="text-3xl font-bold text-white">Chokepoint and route monitor</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
              Monitor trade lanes and risk levels that can affect energy, agricultural, and metals flows.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Metric label="Routes" value={routes.length} tone="slate" />
            <Metric label="High" value={high} tone="amber" />
            <Metric label="Critical" value={critical} tone="red" />
          </div>
        </div>
      </section>

      {routes.length > 0 && <ShippingMap routes={routes} />}

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-4 lg:col-span-2">
          <h3 className="mb-3 flex items-center gap-2 font-semibold text-slate-100">
            <ShieldAlert size={18} className="text-red-300" />
            Route Watchlist
          </h3>
          <div className="space-y-3">
            {(watchlist.length ? watchlist : routes).map((route) => (
              <RouteCard key={route.routeId} route={route} />
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-4">
          <h3 className="mb-3 flex items-center gap-2 font-semibold text-slate-100">
            <AlertTriangle size={18} className="text-indigo-300" />
            AI Risk Notes
          </h3>
          <div className="space-y-3 text-sm leading-6 text-slate-300">
            <p>Prioritize alternate sourcing or inventory buffers when route risk is high or critical.</p>
            <p>Energy-sensitive products should track Brent and natural gas signals alongside route disruptions.</p>
            <p>Use this page as the operational bridge between market analytics and logistics planning.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

function RouteCard({ route }: { route: ShippingRoute }) {
  const tone =
    route.riskLevel === 'CRITICAL'
      ? 'bg-red-500/10 border-red-500/20 text-red-300'
      : route.riskLevel === 'HIGH'
        ? 'bg-orange-500/10 border-orange-500/20 text-orange-300'
        : route.riskLevel === 'MEDIUM'
          ? 'bg-amber-500/10 border-amber-500/20 text-amber-300'
          : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300';

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="font-semibold text-slate-100">{route.name}</div>
          <div className="mt-1 text-xs text-slate-500">
            {route.origin} to {route.destination}
          </div>
        </div>
        <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${tone}`}>{route.riskLevel}</span>
      </div>
      <div className="mt-3 flex items-start gap-2 text-sm text-slate-400">
        <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-slate-500" />
        <span>{route.status}</span>
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-500">{route.description}</p>
    </div>
  );
}

function Metric({ label, value, tone }: { label: string; value: number; tone: 'slate' | 'amber' | 'red' }) {
  const className =
    tone === 'red'
      ? 'border-red-500/20 bg-red-500/10 text-red-300'
      : tone === 'amber'
        ? 'border-amber-500/20 bg-amber-500/10 text-amber-300'
        : 'border-slate-700 bg-slate-800 text-slate-300';
  return (
    <div className={`rounded-xl border p-3 ${className}`}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs font-semibold uppercase tracking-wide opacity-80">{label}</div>
    </div>
  );
}
