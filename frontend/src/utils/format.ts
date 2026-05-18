export function formatPrice(price: number, symbol: string): string {
  if (symbol === 'BDI') return price.toLocaleString('en-US', { maximumFractionDigits: 0 });
  if (symbol === 'NATGAS') return price.toFixed(3);
  if (symbol === 'WHEAT' || symbol === 'ALUMINUM') {
    return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return price.toFixed(2);
}

export function formatUnit(symbol: string): string {
  const units: Record<string, string> = {
    BRENT: '$/bbl',
    NATGAS: '$/MMBtu',
    WHEAT: '$/mt',
    ALUMINUM: '$/mt',
    BDI: 'pts',
  };
  return units[symbol] || '';
}

export function formatPct(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

export function formatChange(value: number, symbol: string): string {
  const sign = value >= 0 ? '+' : '';
  if (symbol === 'BDI') return `${sign}${value.toFixed(0)}`;
  if (symbol === 'NATGAS') return `${sign}${value.toFixed(3)}`;
  return `${sign}${value.toFixed(2)}`;
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function getCommodityColor(symbol: string): string {
  const colors: Record<string, string> = {
    BRENT: '#f97316',    // orange
    NATGAS: '#22d3ee',   // cyan
    WHEAT: '#eab308',    // yellow
    ALUMINUM: '#a78bfa', // violet
    BDI: '#34d399',      // emerald
  };
  return colors[symbol] || '#6366f1';
}

export function getCommodityEmoji(symbol: string): string {
  const emojis: Record<string, string> = {
    BRENT: '🛢️',
    NATGAS: '🔥',
    WHEAT: '🌾',
    ALUMINUM: '⚙️',
    BDI: '🚢',
  };
  return emojis[symbol] || '📈';
}
