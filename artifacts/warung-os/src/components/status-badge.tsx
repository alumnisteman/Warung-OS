import { AlertTriangle, Check, CircleSlash } from 'lucide-react';

export function StockBadge({ status }: { status: 'safe' | 'low' | 'out' }) {
  const config = {
    safe: { label: 'Aman', className: 'bg-[hsl(91_34%_48%/0.13)] text-[hsl(91_34%_34%)]', icon: Check },
    low: { label: 'Menipis', className: 'bg-[hsl(45_88%_61%/0.22)] text-[hsl(31_65%_35%)]', icon: AlertTriangle },
    out: { label: 'Habis', className: 'bg-[hsl(11_72%_57%/0.14)] text-[hsl(5_68%_39%)]', icon: CircleSlash },
  }[status];
  const Icon = config.icon;
  return <span data-testid={`status-stock-${status}`} className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.08em] ${config.className}`}><Icon size={12} strokeWidth={2.5} />{config.label}</span>;
}

export function UrgencyBadge({ urgency }: { urgency: 'urgent' | 'soon' | 'planned' }) {
  const config = {
    urgent: { label: 'Segera', className: 'bg-accent text-accent-foreground' },
    soon: { label: 'Minggu ini', className: 'bg-secondary text-secondary-foreground' },
    planned: { label: 'Terjadwal', className: 'bg-muted text-muted-foreground' },
  }[urgency];
  return <span className={`rounded-full px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.08em] ${config.className}`}>{config.label}</span>;
}