import { Trophy, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { BeneficiaryRanking } from '../types';
import { formatPct, getCommodityEmoji } from '../utils/format';

interface Props {
  rankings: BeneficiaryRanking[];
  onSelect?: (symbol: string) => void;
}

const RANK_COLORS = ['text-yellow-400', 'text-slate-300', 'text-amber-600', 'text-slate-500', 'text-slate-600'];
const RANK_BG = ['bg-yellow-500/10 border-yellow-500/20', 'bg-slate-500/10 border-slate-500/20', 'bg-amber-500/10 border-amber-500/20', '', ''];

export default function BeneficiaryRankingPanel({ rankings, onSelect }: Props) {
  return (
    <div className="bg-slate-800/60 rounded-xl border border-slate-700">
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <Trophy size={18} className="text-yellow-400" />
          <div>
            <h3 className="text-slate-100 font-semibold">Beneficiary Ranking</h3>
            <p className="text-slate-500 text-xs mt-0.5">Commodities ranked by investment signal strength</p>
          </div>
        </div>
      </div>

      <div className="p-3 space-y-2">
        {rankings.map((item) => {
          const rankIdx = item.rank - 1;
          const isPositive = item.changePct1d >= 0;

          return (
            <button
              key={item.symbol}
              onClick={() => onSelect?.(item.symbol)}
              className={`
                w-full text-left p-3 rounded-lg border transition-all
                hover:bg-slate-700/40 hover:border-slate-600 active:scale-[0.99]
                ${rankIdx < 3 ? `${RANK_BG[rankIdx]} border` : 'border-slate-700/50 bg-slate-900/20'}
              `}
            >
              <div className="flex items-center gap-3">
                {/* Rank */}
                <div className={`text-xl font-bold w-8 text-center font-mono ${RANK_COLORS[rankIdx] || 'text-slate-600'}`}>
                  #{item.rank}
                </div>

                {/* Emoji & Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span>{getCommodityEmoji(item.symbol)}</span>
                    <span className="text-slate-100 font-medium text-sm truncate">{item.name}</span>
                    <span className="text-slate-600 font-mono text-xs">{item.symbol}</span>
                  </div>

                  {/* Drivers */}
                  <div className="flex flex-wrap gap-1 mt-1">
                    {item.drivers.slice(0, 2).map((d) => (
                      <span key={d} className="text-xs bg-slate-700/60 text-slate-400 px-1.5 py-0.5 rounded">
                        {d}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Score & Signal */}
                <div className="text-right shrink-0">
                  {/* Score gauge */}
                  <div className="flex items-center justify-end gap-1.5 mb-1">
                    <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${item.score}%`,
                          backgroundColor:
                            item.signal === 'BULLISH' ? '#34d399' :
                            item.signal === 'BEARISH' ? '#f87171' : '#fbbf24',
                        }}
                      />
                    </div>
                    <span className="text-slate-300 font-mono text-sm font-bold">{item.score}</span>
                  </div>

                  {/* Signal pill */}
                  <div className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                    item.signal === 'BULLISH' ? 'bg-emerald-500/20 text-emerald-400' :
                    item.signal === 'BEARISH' ? 'bg-red-500/20 text-red-400' :
                    'bg-amber-500/20 text-amber-400'
                  }`}>
                    {item.signal === 'BULLISH' ? <TrendingUp size={10} /> :
                     item.signal === 'BEARISH' ? <TrendingDown size={10} /> :
                     <Minus size={10} />}
                    {item.signal}
                  </div>

                  {/* 1D change */}
                  <div className={`text-xs font-mono mt-1 ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                    {formatPct(item.changePct1d)}
                  </div>
                </div>
              </div>
            </button>
          );
        })}

        {rankings.length === 0 && (
          <div className="p-8 text-center text-slate-500 text-sm">Loading rankings...</div>
        )}
      </div>
    </div>
  );
}
