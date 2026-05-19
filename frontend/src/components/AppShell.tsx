import { Activity, AlertTriangle, BarChart3, Brain, Database, Globe2, Newspaper, RefreshCw, Route, Ship, TrendingUp } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type React from 'react';
import type { DashboardSummary, PageKey } from '../types';
import { formatTime } from '../utils/format';

interface Props {
  activePage: PageKey;
  data: DashboardSummary | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  onPageChange: (page: PageKey) => void;
  onRefresh: () => void;
  children: React.ReactNode;
}

const NAV_ITEMS: Array<{ key: PageKey; label: string; icon: LucideIcon }> = [
  { key: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { key: 'commodities', label: 'Commodities', icon: TrendingUp },
  { key: 'shipping', label: 'Shipping Risk', icon: Ship },
  { key: 'macro', label: 'Macro', icon: Globe2 },
  { key: 'news', label: 'News', icon: Newspaper },
  { key: 'ai-brief', label: 'AI Brief', icon: Brain },
  { key: 'scenario', label: 'Scenario', icon: Route },
  { key: 'data-center', label: 'Data Center', icon: Database },
];

export default function AppShell({
  activePage,
  data,
  loading,
  error,
  lastUpdated,
  onPageChange,
  onRefresh,
  children,
}: Props) {
  const bullishCount = data?.signals.filter((s) => s.signal === 'BULLISH').length ?? 0;
  const highRiskCount = data?.shippingRoutes.filter((r) => r.riskLevel === 'HIGH' || r.riskLevel === 'CRITICAL').length ?? 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
        <div className="mx-auto max-w-[1680px] px-4 py-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => onPageChange('dashboard')}
                className="flex items-center gap-3 text-left"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600">
                  <Globe2 size={20} />
                </div>
                <div>
                  <div className="text-lg font-bold tracking-tight">GlobalTrade Intelligence</div>
                  <div className="text-xs font-medium uppercase tracking-[0.3em] text-indigo-300">Trade risk and AI decision support</div>
                </div>
              </button>

              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  <Activity size={13} />
                  Live Data
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1.5 text-xs font-semibold text-indigo-300">
                  <Brain size={13} />
                  AI Ready
                </div>
                {bullishCount > 0 && (
                  <div className="hidden items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-300 sm:inline-flex">
                    <TrendingUp size={13} />
                    {bullishCount} Bullish
                  </div>
                )}
                {highRiskCount > 0 && (
                  <div className="hidden items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-300 sm:inline-flex">
                    <AlertTriangle size={13} />
                    {highRiskCount} Route Alerts
                  </div>
                )}
                {lastUpdated && (
                  <span className="hidden text-xs text-slate-500 lg:inline">
                    Updated {formatTime(lastUpdated.toISOString())}
                  </span>
                )}
                <button
                  type="button"
                  onClick={onRefresh}
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-slate-600 hover:bg-slate-800 disabled:opacity-50"
                >
                  <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                  Refresh
                </button>
              </div>
            </div>

            <nav className="flex gap-2 overflow-x-auto pb-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = activePage === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => onPageChange(item.key)}
                    className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                      active
                        ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                        : 'border border-slate-800 bg-slate-900/70 text-slate-400 hover:border-slate-700 hover:text-slate-100'
                    }`}
                  >
                    <Icon size={16} />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {error && (
        <div className="border-b border-red-500/30 bg-red-950/40 px-4 py-3 text-center text-sm text-red-300">
          {error} - showing cached or fallback data where available.
        </div>
      )}

      <main className="mx-auto max-w-[1680px] px-4 py-6 sm:px-6 lg:px-8">{children}</main>

      <footer className="border-t border-slate-900 px-6 py-5 text-xs text-slate-600">
        <div className="mx-auto flex max-w-[1680px] flex-wrap items-center justify-between gap-2">
          <span>GlobalTrade Intelligence - commodity, macro, shipping, and trade news monitoring.</span>
          <span>EIA / FRED / World Bank / Alpha Vantage / NewsAPI</span>
          <span>Demo analytics only. Not financial advice.</span>
        </div>
      </footer>
    </div>
  );
}
