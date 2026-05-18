import { useState } from 'react';
import { RefreshCw, Globe, Activity, TrendingUp, BarChart2, AlertTriangle } from 'lucide-react';
import { useDashboard } from '../hooks/useDashboard';
import CommodityCard from '../components/CommodityCard';
import PriceChart from '../components/PriceChart';
import ShippingMap from '../components/ShippingMap';
import NewsPanel from '../components/NewsPanel';
import BeneficiaryRankingPanel from '../components/BeneficiaryRanking';
import SignalDetail from '../components/SignalDetail';
import { formatTime } from '../utils/format';

export default function Dashboard() {
  const { data, loading, error, refetch, lastUpdated } = useDashboard(120000);
  const [selectedSymbol, setSelectedSymbol] = useState<string>('BRENT');

  const selectedPrice = data?.prices.find((p) => p.symbol === selectedSymbol);
  const selectedSignal = data?.signals.find((s) => s.symbol === selectedSymbol);
  const highRiskCount = data?.shippingRoutes.filter((r) => r.riskLevel === 'HIGH' || r.riskLevel === 'CRITICAL').length ?? 0;
  const bullishCount = data?.signals.filter((s) => s.signal === 'BULLISH').length ?? 0;

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="w-16 h-16 border-4 border-indigo-500/30 rounded-full" />
            <div className="absolute inset-0 w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <div className="text-slate-300 font-semibold">Loading GlobalTrade Dashboard</div>
          <div className="text-slate-500 text-sm mt-1">Fetching live commodity data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* ─── Top Navigation ────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700/50">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Globe size={18} className="text-white" />
            </div>
            <div className="hidden sm:block">
              <div className="text-slate-100 font-bold text-lg leading-tight">GlobalTrade</div>
              <div className="text-indigo-400 text-xs font-medium leading-tight">Dashboard</div>
            </div>
          </div>

          {/* Status pills */}
          <div className="hidden md:flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs px-3 py-1.5 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <Activity size={12} />
              <span>Live Data</span>
            </div>
            {bullishCount > 0 && (
              <div className="flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs px-3 py-1.5 rounded-full">
                <TrendingUp size={12} />
                <span>{bullishCount} Bullish</span>
              </div>
            )}
            {highRiskCount > 0 && (
              <div className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-3 py-1.5 rounded-full">
                <AlertTriangle size={12} />
                <span>{highRiskCount} High-Risk Routes</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {lastUpdated && (
              <span className="hidden lg:block text-slate-600 text-xs">
                Updated {formatTime(lastUpdated.toISOString())}
              </span>
            )}
            <button
              onClick={refetch}
              disabled={loading}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg px-3 py-1.5 transition-all disabled:opacity-50"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </header>

      {/* ─── Error Banner ─────────────────────────────────────────────── */}
      {error && (
        <div className="bg-red-900/30 border-b border-red-500/30 px-4 py-3 text-center text-red-400 text-sm">
          ⚠️ {error} — showing cached data
        </div>
      )}

      {/* ─── Main Content ──────────────────────────────────────────────── */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* ── Section: Commodity Price Cards ── */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <BarChart2 size={16} className="text-indigo-400" />
            <h2 className="text-slate-300 text-sm font-medium uppercase tracking-wider">
              Commodity Prices
            </h2>
            <span className="text-slate-600 text-xs">— click to analyze</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {data?.prices.map((price) => (
              <CommodityCard
                key={price.symbol}
                price={price}
                signal={data.signals.find((s) => s.symbol === price.symbol)}
                selected={selectedSymbol === price.symbol}
                onClick={() => setSelectedSymbol(price.symbol)}
              />
            ))}
            {!data && (
              // Skeleton loading
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-40 bg-slate-800 rounded-xl border border-slate-700 animate-pulse" />
              ))
            )}
          </div>
        </section>

        {/* ── Section: Chart + Signal Detail ── */}
        {selectedPrice && (
          <section className="grid grid-cols-1 xl:grid-cols-3 gap-4 animate-fade-in">
            <div className="xl:col-span-2">
              <PriceChart commodity={selectedPrice} />
            </div>
            <div>
              {selectedSignal ? (
                <SignalDetail signal={selectedSignal} commodityName={selectedPrice.name} />
              ) : (
                <div className="h-full bg-slate-800/60 rounded-xl border border-slate-700 flex items-center justify-center text-slate-500 text-sm p-6">
                  Signal analysis loading...
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── Section: Shipping Map ── */}
        <section>
          {data?.shippingRoutes && data.shippingRoutes.length > 0 ? (
            <ShippingMap routes={data.shippingRoutes} />
          ) : (
            <div className="h-64 bg-slate-800/60 rounded-xl border border-slate-700 animate-pulse" />
          )}
        </section>

        {/* ── Section: Rankings + News ── */}
        <section className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Rankings – narrower column */}
          <div className="lg:col-span-2">
            <BeneficiaryRankingPanel
              rankings={data?.beneficiaries ?? []}
              onSelect={setSelectedSymbol}
            />
          </div>

          {/* News feed – wider column */}
          <div className="lg:col-span-3">
            <NewsPanel news={data?.news ?? []} maxItems={8} />
          </div>
        </section>

      </main>

      {/* ─── Footer ───────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-800 mt-8 py-6 px-8 text-center text-slate-600 text-xs">
        <div className="max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-2">
          <span>GlobalTrade Dashboard — Professional Investment Analysis Platform</span>
          <span>
            Data: EIA · FRED · World Bank · Alpha Vantage · NewsAPI
          </span>
          <span>© {new Date().getFullYear()} — For informational purposes only. Not financial advice.</span>
        </div>
      </footer>
    </div>
  );
}
