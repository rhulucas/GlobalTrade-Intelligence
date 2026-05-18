import { useState } from 'react';
import AppShell from './components/AppShell';
import { useDashboard } from './hooks/useDashboard';
import AIBrief from './pages/AIBrief';
import Commodities from './pages/Commodities';
import Dashboard from './pages/Dashboard';
import DataCenter from './pages/DataCenter';
import Macro from './pages/Macro';
import NewsIntelligence from './pages/NewsIntelligence';
import Scenario from './pages/Scenario';
import ShippingRisk from './pages/ShippingRisk';
import type { PageKey } from './types';

export default function App() {
  const [activePage, setActivePage] = useState<PageKey>('dashboard');
  const { data, loading, error, refetch, lastUpdated } = useDashboard(120000);

  if (loading && !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        <div className="text-center">
          <div className="relative mx-auto mb-4 h-16 w-16">
            <div className="h-16 w-16 rounded-full border-4 border-indigo-500/30" />
            <div className="absolute inset-0 h-16 w-16 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
          </div>
          <div className="font-semibold text-slate-300">Loading GlobalTrade Intelligence</div>
          <div className="mt-1 text-sm text-slate-500">Fetching live market data...</div>
        </div>
      </div>
    );
  }

  return (
    <AppShell
      activePage={activePage}
      data={data}
      loading={loading}
      error={error}
      lastUpdated={lastUpdated}
      onPageChange={setActivePage}
      onRefresh={refetch}
    >
      {activePage === 'dashboard' && <Dashboard data={data} />}
      {activePage === 'commodities' && <Commodities data={data} />}
      {activePage === 'shipping' && <ShippingRisk data={data} />}
      {activePage === 'macro' && <Macro data={data} />}
      {activePage === 'news' && <NewsIntelligence data={data} />}
      {activePage === 'ai-brief' && <AIBrief data={data} />}
      {activePage === 'scenario' && <Scenario data={data} />}
      {activePage === 'data-center' && <DataCenter data={data} />}
    </AppShell>
  );
}
