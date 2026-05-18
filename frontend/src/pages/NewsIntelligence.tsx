import { Newspaper, Radio, TrendingDown, TrendingUp } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import NewsPanel from '../components/NewsPanel';
import type { DashboardSummary } from '../types';

interface Props {
  data: DashboardSummary | null;
}

export default function NewsIntelligence({ data }: Props) {
  const news = data?.news ?? [];
  const bullish = news.filter((n) => n.sentiment === 'bullish').length;
  const bearish = news.filter((n) => n.sentiment === 'bearish').length;
  const neutral = news.filter((n) => n.sentiment === 'neutral').length;
  const categories = Array.from(new Set(news.map((n) => n.category))).slice(0, 8);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.35em] text-indigo-300">
          <Radio size={16} />
          News intelligence
        </div>
        <h1 className="text-3xl font-bold text-white">Market-moving news and sentiment</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
          NewsAPI feeds are normalized into market categories, commodity tags, and directional sentiment.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Metric label="Articles" value={news.length} icon={Newspaper} tone="indigo" />
        <Metric label="Bullish" value={bullish} icon={TrendingUp} tone="emerald" />
        <Metric label="Bearish" value={bearish} icon={TrendingDown} tone="red" />
        <Metric label="Neutral" value={neutral} icon={Radio} tone="slate" />
      </section>

      {categories.length > 0 && (
        <section className="rounded-xl border border-slate-700 bg-slate-800/60 p-4">
          <h3 className="mb-3 font-semibold text-slate-100">Active Themes</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <span key={category} className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm capitalize text-slate-300">
                {category}
              </span>
            ))}
          </div>
        </section>
      )}

      <NewsPanel news={news} maxItems={20} />
    </div>
  );
}

function Metric({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  tone: 'indigo' | 'emerald' | 'red' | 'slate';
}) {
  const className =
    tone === 'emerald'
      ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
      : tone === 'red'
        ? 'border-red-500/20 bg-red-500/10 text-red-300'
        : tone === 'indigo'
          ? 'border-indigo-500/20 bg-indigo-500/10 text-indigo-300'
          : 'border-slate-700 bg-slate-800 text-slate-300';
  return (
    <div className={`rounded-xl border p-4 ${className}`}>
      <Icon size={18} />
      <div className="mt-3 text-3xl font-bold text-white">{value}</div>
      <div className="text-xs font-semibold uppercase tracking-wide opacity-80">{label}</div>
    </div>
  );
}
