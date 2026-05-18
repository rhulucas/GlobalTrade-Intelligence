import { Info, BarChart2 } from 'lucide-react';
import type { InvestmentSignal } from '../types';
import SignalBadge from './SignalBadge';

interface Props {
  signal: InvestmentSignal;
  commodityName: string;
}

export default function SignalDetail({ signal, commodityName }: Props) {
  const factors = signal.factors;

  return (
    <div className="bg-slate-800/60 rounded-xl border border-slate-700 p-5">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <BarChart2 size={18} className="text-indigo-400" />
          <div>
            <h3 className="text-slate-100 font-semibold">Investment Signal Analysis</h3>
            <p className="text-slate-500 text-xs mt-0.5">{commodityName}</p>
          </div>
        </div>
        <SignalBadge signal={signal.signal} score={signal.score} size="md" showScore />
      </div>

      {/* Score Gauge */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-slate-500 mb-1.5">
          <span>Bearish (0)</span>
          <span className="font-mono font-medium text-slate-300">Score: {signal.score}/100</span>
          <span>Bullish (100)</span>
        </div>
        <div className="h-3 bg-slate-700 rounded-full overflow-hidden relative">
          {/* Color zones */}
          <div className="absolute inset-0 flex">
            <div className="flex-[42] bg-red-500/20" />
            <div className="flex-[16] bg-amber-500/20" />
            <div className="flex-[42] bg-emerald-500/20" />
          </div>
          {/* Score indicator */}
          <div
            className="absolute top-0 h-full w-1 bg-white rounded-full shadow-[0_0_6px_rgba(255,255,255,0.8)] transition-all duration-700"
            style={{ left: `${signal.score}%`, transform: 'translateX(-50%)' }}
          />
        </div>
      </div>

      {/* Reasoning */}
      <div className="mb-4 p-3 bg-slate-900/60 rounded-lg border border-slate-700/50">
        <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-2">
          <Info size={12} />
          <span>Analysis Summary</span>
        </div>
        <p className="text-slate-300 text-sm leading-relaxed">{signal.reasoning}</p>
      </div>

      {/* Factor Grid */}
      <div className="grid grid-cols-2 gap-2">
        {Object.entries(factors).map(([key, value]) => (
          <div key={key} className="bg-slate-900/40 rounded-lg p-2.5 border border-slate-700/30">
            <div className="text-slate-500 text-xs capitalize mb-1">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </div>
            <div className="text-slate-200 text-sm font-mono font-medium">
              {typeof value === 'number'
                ? value.toFixed(key.toLowerCase().includes('pct') || key.toLowerCase().includes('pct') ? 2 : 2)
                : value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
