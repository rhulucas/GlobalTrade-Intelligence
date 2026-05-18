import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import type { CommodityPrice, InvestmentSignal } from '../types';
import SignalBadge from './SignalBadge';
import { formatPrice, formatPct, formatChange, formatUnit, getCommodityColor, getCommodityEmoji } from '../utils/format';

interface Props {
  price: CommodityPrice;
  signal?: InvestmentSignal;
  selected?: boolean;
  onClick?: () => void;
}

export default function CommodityCard({ price, signal, selected, onClick }: Props) {
  const isPositive = price.changePct1d >= 0;
  const color = getCommodityColor(price.symbol);

  return (
    <button
      onClick={onClick}
      className={`
        relative w-full text-left p-4 rounded-xl border transition-all duration-200
        hover:scale-[1.02] hover:shadow-lg active:scale-[0.99]
        ${selected
          ? 'border-indigo-500 bg-indigo-500/10 shadow-indigo-500/20 shadow-lg'
          : 'border-slate-700 bg-slate-800/60 hover:border-slate-600 hover:bg-slate-800'
        }
      `}
    >
      {/* Selection indicator */}
      {selected && (
        <div className="absolute inset-x-0 top-0 h-0.5 rounded-t-xl bg-indigo-500" />
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{getCommodityEmoji(price.symbol)}</span>
          <div>
            <div className="font-semibold text-slate-100 text-sm leading-tight">{price.name}</div>
            <div className="text-xs text-slate-500 font-mono">{price.symbol}</div>
          </div>
        </div>
        {signal && <SignalBadge signal={signal.signal} score={signal.score} size="sm" />}
      </div>

      {/* Price */}
      <div className="mb-2">
        <span
          className="text-2xl font-bold font-mono"
          style={{ color }}
        >
          {formatPrice(price.price, price.symbol)}
        </span>
        <span className="text-slate-500 text-xs ml-1">{formatUnit(price.symbol)}</span>
      </div>

      {/* Change */}
      <div className={`flex items-center gap-1.5 text-sm font-mono ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
        {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
        <span>{formatChange(price.change1d, price.symbol)}</span>
        <span className="text-slate-500 mx-0.5">|</span>
        <span>{formatPct(price.changePct1d)}</span>
        <span className="text-slate-600 text-xs ml-1">1D</span>
      </div>

      {/* Signal score bar */}
      {signal && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Signal Strength</span>
            <span className="font-mono">{signal.score}/100</span>
          </div>
          <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${signal.score}%`,
                backgroundColor:
                  signal.signal === 'BULLISH' ? '#34d399' :
                  signal.signal === 'BEARISH' ? '#f87171' : '#fbbf24',
              }}
            />
          </div>
        </div>
      )}

      {/* Source */}
      <div className="mt-2 flex items-center gap-1 text-xs text-slate-600">
        <RefreshCw size={10} />
        <span>{price.source}</span>
        <span className="mx-1">·</span>
        <span>{price.priceDate}</span>
      </div>
    </button>
  );
}
