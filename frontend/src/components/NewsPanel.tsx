import { ExternalLink, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { NewsItem } from '../types';
import { timeAgo } from '../utils/format';

interface Props {
  news: NewsItem[];
  maxItems?: number;
}

const SENTIMENT_CONFIG = {
  bullish: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: TrendingUp, label: '▲ Bullish' },
  bearish: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', icon: TrendingDown, label: '▼ Bearish' },
  neutral: { color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20', icon: Minus, label: '— Neutral' },
};

const CATEGORY_COLORS: Record<string, string> = {
  energy: 'bg-orange-500/20 text-orange-400',
  agriculture: 'bg-yellow-500/20 text-yellow-400',
  metals: 'bg-violet-500/20 text-violet-400',
  shipping: 'bg-cyan-500/20 text-cyan-400',
  geopolitics: 'bg-rose-500/20 text-rose-400',
  trade: 'bg-blue-500/20 text-blue-400',
};

export default function NewsPanel({ news, maxItems = 8 }: Props) {
  const displayed = news.slice(0, maxItems);

  return (
    <div className="bg-slate-800/60 rounded-xl border border-slate-700">
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-slate-100 font-semibold">Geopolitical News Feed</h3>
            <p className="text-slate-500 text-xs mt-0.5">Market-moving events &amp; analysis</p>
          </div>
          <span className="text-xs text-slate-500 bg-slate-900 px-2 py-1 rounded-lg">
            {news.length} articles
          </span>
        </div>
      </div>

      <div className="divide-y divide-slate-700/50">
        {displayed.map((item) => {
          const sentCfg = SENTIMENT_CONFIG[item.sentiment];
          const SentIcon = sentCfg.icon;
          const catColor = CATEGORY_COLORS[item.category] || 'bg-slate-500/20 text-slate-400';

          return (
            <article key={item.id} className="p-4 hover:bg-slate-700/20 transition-colors group">
              <div className="flex gap-3">
                {/* Image */}
                {item.imageUrl && (
                  <div className="shrink-0">
                    <img
                      src={item.imageUrl}
                      alt=""
                      className="w-16 h-16 rounded-lg object-cover bg-slate-700"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Tags */}
                  <div className="flex items-center flex-wrap gap-1.5 mb-1.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${catColor}`}>
                      {item.category}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border flex items-center gap-1 ${sentCfg.bg} ${sentCfg.border} ${sentCfg.color}`}>
                      <SentIcon size={10} />
                      {sentCfg.label}
                    </span>
                    {item.relatedCommodities.slice(0, 2).map((sym) => (
                      <span key={sym} className="text-xs px-1.5 py-0.5 rounded bg-slate-700 text-slate-400 font-mono">
                        {sym}
                      </span>
                    ))}
                  </div>

                  {/* Title */}
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-100 text-sm font-medium leading-snug group-hover:text-indigo-400 transition-colors line-clamp-2 flex items-start gap-1"
                  >
                    {item.title}
                    <ExternalLink size={12} className="shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>

                  {/* Description */}
                  {item.description && (
                    <p className="text-slate-500 text-xs mt-1 line-clamp-2">{item.description}</p>
                  )}

                  {/* Meta */}
                  <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-600">
                    <span className="font-medium text-slate-500">{item.source}</span>
                    <span>·</span>
                    <span>{timeAgo(item.publishedAt)}</span>
                  </div>
                </div>
              </div>
            </article>
          );
        })}

        {news.length === 0 && (
          <div className="p-8 text-center text-slate-500">
            <div className="text-2xl mb-2">📰</div>
            <div className="text-sm">No news articles available</div>
          </div>
        )}
      </div>
    </div>
  );
}
