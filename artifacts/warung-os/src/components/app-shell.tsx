import { Bell, ChevronRight, LayoutDashboard, Package, ShoppingCart, Store, Truck } from 'lucide-react';
import { useState } from 'react';
import { useNetworkStatus } from '@/hooks/use-network-status';
import { Link, useLocation } from 'wouter';

const navItems = [
  { href: '/', label: 'Ringkasan', icon: LayoutDashboard },
  { href: '/products', label: 'Produk & stok', icon: Package },
  { href: '/sales', label: 'Penjualan', icon: ShoppingCart },
  { href: '/restock', label: 'Perlu restok', icon: Truck },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [notice, setNotice] = useState(false);
  const online = useNetworkStatus();
  const pageName = navItems.find((item) => item.href === location)?.label ?? 'Ringkasan';
  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[246px] flex-col bg-sidebar text-sidebar-foreground lg:flex">
        <div className="flex h-[88px] items-center gap-3 border-b border-sidebar-border px-7">
          <div className="grid size-10 place-items-center rounded-[14px] bg-sidebar-primary text-sidebar-primary-foreground shadow-sm">
            <Store size={21} strokeWidth={2.5} />
          </div>
          <div>
            <div className="font-serif text-lg font-bold tracking-[-0.04em]">WarungOS</div>
            <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-sidebar-foreground/55">bikin warung lancar</div>
          </div>
        </div>
        <div className="px-4 pt-8">
          <p className="mb-3 px-3 font-mono text-[10px] uppercase tracking-[0.18em] text-sidebar-foreground/45">Menu utama</p>
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const active = item.href === '/' ? location === '/' : location.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href} data-testid={`link-${item.label.toLowerCase().replaceAll(' ', '-')}`} className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-all duration-200 ${active ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-[0_6px_18px_hsl(45_94%_63%/0.12)]' : 'text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'}`}>
                  <Icon size={18} strokeWidth={active ? 2.4 : 2} />
                  <span>{item.label}</span>
                  {active && <ChevronRight size={15} className="ml-auto opacity-65" />}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="mt-auto px-5 pb-6">
          <div className="rounded-2xl border border-sidebar-border bg-sidebar-accent/55 p-4">
            <div className="mb-2 flex items-center gap-2 text-sidebar-primary">
              <span className="size-2 rounded-full bg-sidebar-primary" />
              <span className="font-mono text-[10px] uppercase tracking-[0.15em]">Warung buka</span>
            </div>
            <p className="text-xs leading-relaxed text-sidebar-foreground/60">Semua yang penting, ada di sini. Cek sebentar sebelum mulai ramai.</p>
          </div>
          <div className="mt-5 flex items-center gap-3 border-t border-sidebar-border pt-5">
            <div className="grid size-9 place-items-center rounded-full bg-accent font-serif text-sm font-bold text-accent-foreground">BS</div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">Bu Sari</p>
              <p className="truncate text-xs text-sidebar-foreground/50">Warung Sari Jaya</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="lg:pl-[246px]">
        <header className="sticky top-0 z-20 flex h-[74px] items-center justify-between border-b border-border/75 bg-background/90 px-5 backdrop-blur-md sm:px-8">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Warung Sari Jaya / hari ini</p>
            <h1 className="mt-1 font-serif text-xl font-bold tracking-[-0.04em] sm:text-2xl">{pageName}</h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div title={online ? "Terhubung ke internet" : "Offline"} className={`hidden items-center gap-2 rounded-xl border px-3 py-2 text-[10px] font-bold sm:flex ${online ? "border-border bg-card text-muted-foreground" : "border-accent/30 bg-accent/10 text-accent"}`}>
              <span className={`size-2 rounded-full ${online ? "bg-[hsl(91_34%_40%)]" : "bg-accent"}`} />
              {online ? "Online" : "Offline"}
            </div>
            <button type="button" aria-label="Notifikasi" onClick={() => setNotice((current) => !current)} data-testid="button-notifications" className="relative grid size-10 place-items-center rounded-xl border border-border bg-card text-muted-foreground transition hover:border-primary/40 hover:text-primary">
              <Bell size={18} />
              <span className="absolute right-2 top-2 size-1.5 rounded-full bg-accent" />
            </button>
            {notice && <div className="absolute right-5 top-[62px] z-50 w-64 rounded-xl border border-border bg-card p-3 text-xs shadow-lg"><p className="font-bold">Tidak ada yang mendesak</p><p className="mt-1 leading-relaxed text-muted-foreground">Warung sedang berjalan lancar. Saran baru akan muncul di sini.</p></div>}
            <div className="hidden h-9 w-px bg-border sm:block" />
            <div className="grid size-9 place-items-center rounded-full bg-primary font-serif text-sm font-bold text-primary-foreground">BS</div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1420px] px-5 py-7 sm:px-8 sm:py-9">{children}</main>
      </div>

      <nav className="fixed inset-x-3 bottom-3 z-40 flex h-16 items-center justify-around rounded-2xl border border-border/80 bg-card/95 px-2 shadow-lg backdrop-blur-md lg:hidden">
        {navItems.map((item) => {
          const active = item.href === '/' ? location === '/' : location.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} data-testid={`mobile-link-${item.label.toLowerCase().replaceAll(' ', '-')}`} className={`flex min-w-[66px] flex-col items-center gap-1 rounded-xl py-2 text-[10px] font-semibold transition ${active ? 'bg-secondary/35 text-primary' : 'text-muted-foreground'}`}>
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export function PageIntro({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
      <div>
        {eyebrow && <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-accent">{eyebrow}</p>}
        <h2 className="font-serif text-3xl font-bold tracking-[-0.055em] text-foreground sm:text-[40px]">{title}</h2>
        {description && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function SkeletonBlock({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-muted ${className}`} />;
}

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center">
      <p className="font-serif text-lg font-bold text-destructive">Data belum bisa dibuka</p>
      <p className="mt-1 text-sm text-muted-foreground">Coba lagi sebentar. Data warung tetap aman.</p>
      <button type="button" onClick={onRetry} data-testid="button-retry" className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:-translate-y-0.5">Coba lagi</button>
    </div>
  );
}