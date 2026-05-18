import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { SignalType } from '../types';

interface Props {
  signal: SignalType;
  score?: number;
  size?: 'sm' | 'md' | 'lg';
  showScore?: boolean;
}

const CONFIG = {
  BULLISH: {
    bg: 'bg-emerald-500/20',
    border: 'border-emerald-500/40',
    text: 'text-emerald-400',
    icon: TrendingUp,
    label: 'BULLISH',
    dot: 'bg-emerald-400',
  },
  NEUTRAL: {
    bg: 'bg-amber-500/20',
    border: 'border-amber-500/40',
    text: 'text-amber-400',
    icon: Minus,
    label: 'NEUTRAL',
    dot: 'bg-amber-400',
  },
  BEARISH: {
    bg: 'bg-red-500/20',
    border: 'border-red-500/40',
    text: 'text-red-400',
    icon: TrendingDown,
    label: 'BEARISH',
    dot: 'bg-red-400',
  },
} as const;

const SIZE = {
  sm: { padding: 'px-2 py-0.5', text: 'text-xs', icon: 12, gap: 'gap-1' },
  md: { padding: 'px-3 py-1', text: 'text-sm', icon: 14, gap: 'gap-1.5' },
  lg: { padding: 'px-4 py-2', text: 'text-base', icon: 16, gap: 'gap-2' },
};

export default function SignalBadge({ signal, score, size = 'md', showScore = false }: Props) {
  const cfg = CONFIG[signal];
  const sz = SIZE[size];
  const Icon = cfg.icon;

  return (
    <span
      className={`inline-flex items-center ${sz.gap} ${sz.padding} rounded-full border font-semibold font-mono tracking-wider
        ${cfg.bg} ${cfg.border} ${cfg.text}`}
    >
      {/* Animated dot */}
      <span className={`relative flex h-2 w-2`}>
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${cfg.dot} opacity-60`} />
        <span className={`relative inline-flex rounded-full h-2 w-2 ${cfg.dot}`} />
      </span>
      <Icon size={sz.icon} />
      <span className={sz.text}>{cfg.label}</span>
      {showScore && score !== undefined && (
        <span className={`${sz.text} opacity-70`}>{score}</span>
      )}
    </span>
  );
}
