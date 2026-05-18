import { useMemo, useState } from 'react';
import { Database, Download, Search } from 'lucide-react';
import SignalBadge from '../components/SignalBadge';
import type { DashboardSummary } from '../types';
import { formatPct, formatPrice, formatUnit } from '../utils/format';

interface Props {
  data: DashboardSummary | null;
}

type TableKey = 'prices' | 'signals' | 'routes' | 'news' | 'beneficiaries';

const TABLES: Array<{ key: TableKey; label: string }> = [
  { key: 'prices', label: 'Prices' },
  { key: 'signals', label: 'Signals' },
  { key: 'routes', label: 'Shipping Routes' },
  { key: 'news', label: 'News' },
  { key: 'beneficiaries', label: 'Beneficiaries' },
];

export default function DataCenter({ data }: Props) {
  const [active, setActive] = useState<TableKey>('prices');
  const [query, setQuery] = useState('');

  const counts = {
    prices: data?.prices.length ?? 0,
    signals: data?.signals.length ?? 0,
    routes: data?.shippingRoutes.length ?? 0,
    news: data?.news.length ?? 0,
    beneficiaries: data?.beneficiaries.length ?? 0,
  };

  const rows = useMemo(() => getRows(active, data), [active, data]);
  const filtered = rows.filter((row) => Object.values(row).join(' ').toLowerCase().includes(query.toLowerCase()));

  function exportCsv() {
    const header = Object.keys(filtered[0] ?? {}).join(',');
    const body = filtered.map((row) => Object.values(row).map(csvValue).join(',')).join('\n');
    const blob = new Blob([[header, body].filter(Boolean).join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `globaltrade-${active}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.35em] text-indigo-300">
          <Database size={16} />
          Data center
        </div>
        <h1 className="text-3xl font-bold text-white">Shared market data tables</h1>
        <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-400">
          Transparent demo data layer for reviewing live API records, generated signals, route risks, news, and beneficiary rankings.
        </p>
      </section>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {TABLES.map((table) => (
          <button
            key={table.key}
            type="button"
            onClick={() => setActive(table.key)}
            className={`rounded-xl border p-4 text-left transition ${
              active === table.key
                ? 'border-indigo-500/50 bg-indigo-500/15'
                : 'border-slate-700 bg-slate-800/60 hover:border-slate-600'
            }`}
          >
            <div className="text-3xl font-bold text-white">{counts[table.key]}</div>
            <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">{table.label}</div>
          </button>
        ))}
      </section>

      <section className="rounded-xl border border-slate-700 bg-slate-800/60">
        <div className="flex flex-col gap-3 border-b border-slate-700 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-100">{TABLES.find((t) => t.key === active)?.label}</h3>
            <p className="text-xs text-slate-500">{filtered.length} visible rows</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search table..."
                className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2 pl-9 pr-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-indigo-500 sm:w-80"
              />
            </label>
            <button
              type="button"
              onClick={exportCsv}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400"
            >
              <Download size={16} />
              Export CSV
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">{renderTable(active, filtered, data)}</div>
      </section>
    </div>
  );
}

function getRows(active: TableKey, data: DashboardSummary | null): Array<Record<string, string | number>> {
  if (!data) return [];
  if (active === 'prices') {
    return data.prices.map((p) => ({
      symbol: p.symbol,
      name: p.name,
      price: `${formatPrice(p.price, p.symbol)} ${formatUnit(p.symbol)}`,
      changePct1d: formatPct(p.changePct1d),
      source: p.source,
      priceDate: p.priceDate,
    }));
  }
  if (active === 'signals') {
    return data.signals.map((s) => ({
      symbol: s.symbol,
      signal: s.signal,
      score: s.score,
      reasoning: s.reasoning,
    }));
  }
  if (active === 'routes') {
    return data.shippingRoutes.map((r) => ({
      routeId: r.routeId,
      name: r.name,
      origin: r.origin,
      destination: r.destination,
      riskLevel: r.riskLevel,
      status: r.status,
    }));
  }
  if (active === 'news') {
    return data.news.map((n) => ({
      title: n.title,
      source: n.source,
      category: n.category,
      sentiment: n.sentiment,
      publishedAt: n.publishedAt,
    }));
  }
  return data.beneficiaries.map((b) => ({
    rank: b.rank,
    symbol: b.symbol,
    name: b.name,
    signal: b.signal,
    score: b.score,
    changePct1d: formatPct(b.changePct1d),
  }));
}

function renderTable(active: TableKey, rows: Array<Record<string, string | number>>, data: DashboardSummary | null) {
  if (rows.length === 0) {
    return <div className="p-8 text-center text-sm text-slate-500">No rows to display.</div>;
  }

  const columns = Object.keys(rows[0]);
  return (
    <table className="w-full min-w-[900px] text-left text-sm">
      <thead className="bg-slate-900/70 text-xs uppercase tracking-wider text-slate-500">
        <tr>
          {columns.map((column) => (
            <th key={column} className="px-4 py-3">{column}</th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-700/70">
        {rows.map((row, idx) => (
          <tr key={idx} className="hover:bg-slate-700/25">
            {columns.map((column) => {
              const value = row[column];
              if ((active === 'signals' || active === 'beneficiaries') && column === 'signal') {
                const signal = data?.signals.find((s) => s.symbol === row.symbol);
                return (
                  <td key={column} className="px-4 py-3">
                    {signal ? <SignalBadge signal={signal.signal} score={signal.score} /> : value}
                  </td>
                );
              }
              return (
                <td key={column} className="max-w-[420px] px-4 py-3 text-slate-300">
                  <span className="line-clamp-2">{value}</span>
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function csvValue(value: string | number) {
  return `"${String(value).replace(/"/g, '""')}"`;
}
