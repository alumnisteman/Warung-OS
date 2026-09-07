import { ArrowUpRight, Boxes, CircleCheck, Clock3, Package, Plus, Receipt, ShoppingBag, TrendingUp, WalletCards } from 'lucide-react';
import { Link } from 'wouter';
import { useGetDashboardSummary, useListActivity } from '@workspace/api-client-react';
import { AppShell, ErrorState, PageIntro, SkeletonBlock } from '@/components/app-shell';

const rupiah = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
const timeAgo = (date: string) => {
  const mins = Math.max(1, Math.floor((Date.now() - new Date(date).getTime()) / 60000));
  return mins < 60 ? `${mins} menit lalu` : mins < 1440 ? `${Math.floor(mins / 60)} jam lalu` : `${Math.floor(mins / 1440)} hari lalu`;
};

function DashboardContent() {
  const summaryQuery = useGetDashboardSummary();
  const activityQuery = useListActivity();
  const summary = summaryQuery.data;
  const activities = activityQuery.data ?? [];
  const maxRevenue = Math.max(...(summary?.weeklyRevenue ?? []).map((point) => point.value), 1);

  if (summaryQuery.isLoading || activityQuery.isLoading) {
    return <><PageIntro eyebrow="Selamat pagi, Bu Sari" title="Hari ini di warung" description="Sedikit cek, lalu lanjut melayani." /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[1, 2, 3, 4].map((item) => <SkeletonBlock key={item} className="h-36" />)}</div><div className="mt-6 grid gap-6 xl:grid-cols-[1.3fr_0.7fr]"><SkeletonBlock className="h-80" /><SkeletonBlock className="h-80" /></div></>;
  }
  if (summaryQuery.isError || activityQuery.isError || !summary) return <ErrorState onRetry={() => { void summaryQuery.refetch(); void activityQuery.refetch(); }} />;

  return (
    <>
      <PageIntro eyebrow="Selamat pagi, Bu Sari" title="Hari ini di warung" description="Sedikit cek, lalu lanjut melayani." action={<Link href="/sales" data-testid="link-record-sale" className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><Plus size={17} />Catat penjualan</Link>} />
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Pendapatan hari ini" value={rupiah(summary.revenueToday)} note={`${summary.salesToday} transaksi tercatat`} icon={WalletCards} tone="yellow" />
        <MetricCard label="Transaksi hari ini" value={String(summary.salesToday)} note="penjualan berjalan baik" icon={Receipt} tone="green" />
        <MetricCard label="Produk aktif" value={String(summary.productCount)} note="di daftar warung" icon={Boxes} tone="cream" />
        <MetricCard label="Perlu perhatian" value={String(summary.lowStockCount)} note={summary.lowStockCount === 0 ? 'semua stok aman' : 'produk perlu restok'} icon={CircleCheck} tone={summary.lowStockCount === 0 ? 'green' : 'red'} />
      </section>

      {summary.lowStockCount > 0 && <Link href="/restock" data-testid="card-restock-alert" className="group mt-6 flex items-center gap-4 rounded-2xl border border-accent/25 bg-accent/10 p-4 transition hover:border-accent/45 hover:bg-accent/15 sm:p-5"><div className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground"><TrendingUp size={20} /></div><div className="min-w-0"><p className="font-semibold text-foreground">Ada {summary.lowStockCount} produk yang mulai menipis</p><p className="mt-0.5 text-sm text-muted-foreground">Lihat saran restok supaya tidak kehabisan saat warung ramai.</p></div><ArrowUpRight className="ml-auto shrink-0 text-accent transition group-hover:translate-x-1 group-hover:-translate-y-1" size={19} /></Link>}

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <section className="rounded-2xl border border-border bg-card p-5 shadow-xs sm:p-6">
          <div className="flex items-start justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Irama warung</p><h3 className="mt-1 font-serif text-xl font-bold tracking-[-0.04em]">Pendapatan minggu ini</h3></div><span className="inline-flex items-center gap-1.5 rounded-full bg-[hsl(91_34%_48%/0.13)] px-2.5 py-1 font-mono text-[10px] font-bold text-[hsl(91_34%_34%)]"><TrendingUp size={12} /> stabil</span></div>
          <div className="mt-8 flex h-52 items-end gap-2 sm:gap-4">{summary.weeklyRevenue.map((point) => <div key={point.label} className="group flex h-full flex-1 flex-col items-center justify-end gap-2"><div className="relative flex w-full flex-1 items-end"><div className="w-full rounded-t-lg bg-secondary/45 transition-all duration-500 group-hover:bg-secondary" style={{ height: `${Math.max(7, (point.value / maxRevenue) * 100)}%` }}><span className="absolute -top-7 left-1/2 hidden -translate-x-1/2 rounded-md bg-primary px-2 py-1 font-mono text-[9px] text-primary-foreground group-hover:block">{rupiah(point.value).replace('Rp', 'Rp ')}</span></div></div><span className="font-mono text-[10px] text-muted-foreground">{point.label}</span></div>)}</div>
          <div className="mt-5 flex items-center justify-between border-t border-border pt-4"><p className="text-xs text-muted-foreground">Total 7 hari terakhir</p><p className="font-mono text-sm font-bold">{rupiah(summary.weeklyRevenue.reduce((sum, item) => sum + item.value, 0))}</p></div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 shadow-xs sm:p-6">
          <div className="flex items-start justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Yang paling laku</p><h3 className="mt-1 font-serif text-xl font-bold tracking-[-0.04em]">Produk favorit</h3></div><ShoppingBag className="text-accent" size={20} /></div>
          <div className="mt-6 space-y-4">{summary.topProducts.length === 0 ? <EmptyInline label="Belum ada penjualan minggu ini" /> : summary.topProducts.slice(0, 4).map((item, index) => <div key={item.name} data-testid={`row-top-product-${index}`} className="flex items-center gap-3"><span className={`grid size-8 shrink-0 place-items-center rounded-lg font-mono text-xs font-bold ${index === 0 ? 'bg-secondary text-secondary-foreground' : 'bg-muted text-muted-foreground'}`}>{String(index + 1).padStart(2, '0')}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{item.name}</p><p className="mt-0.5 text-xs text-muted-foreground">{item.quantity} terjual</p></div><span className="font-mono text-xs font-bold">{rupiah(item.revenue)}</span></div>)}</div>
        </section>
      </div>

      <section className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-xs sm:p-6">
        <div className="flex items-center justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Jejak hari ini</p><h3 className="mt-1 font-serif text-xl font-bold tracking-[-0.04em]">Aktivitas terbaru</h3></div><Link href="/sales" data-testid="link-view-sales" className="text-xs font-bold text-primary transition hover:text-accent">Lihat semua</Link></div>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">{activities.length === 0 ? <EmptyInline label="Belum ada aktivitas" /> : activities.slice(0, 4).map((activity) => <div key={activity.id} data-testid={`activity-${activity.id}`} className="flex gap-3 rounded-xl bg-muted/50 p-3"><div className={`mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg ${activity.type === 'sale' ? 'bg-secondary/45 text-primary' : activity.type === 'stock' ? 'bg-accent/15 text-accent' : 'bg-primary/10 text-primary'}`}>{activity.type === 'sale' ? <Receipt size={15} /> : activity.type === 'stock' ? <Package size={15} /> : <Boxes size={15} />}</div><div className="min-w-0"><p className="truncate text-sm font-semibold">{activity.title}</p><p className="mt-0.5 truncate text-xs text-muted-foreground">{activity.description}</p><p className="mt-2 flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.08em] text-muted-foreground"><Clock3 size={10} />{timeAgo(activity.createdAt)}</p></div></div>)}</div>
      </section>
    </>
  );
}

function MetricCard({ label, value, note, icon: Icon, tone }: { label: string; value: string; note: string; icon: typeof WalletCards; tone: 'yellow' | 'green' | 'cream' | 'red' }) {
  const styles = { yellow: 'bg-secondary/28 text-primary', green: 'bg-[hsl(91_34%_48%/0.13)] text-[hsl(91_34%_34%)]', cream: 'bg-muted text-muted-foreground', red: 'bg-accent/12 text-accent' };
  return <div data-testid={`metric-${label.toLowerCase().replaceAll(' ', '-')}`} className="group rounded-2xl border border-border bg-card p-5 shadow-xs transition duration-200 hover:-translate-y-1 hover:shadow-md"><div className="flex items-center justify-between"><span className="text-xs font-semibold text-muted-foreground">{label}</span><span className={`grid size-9 place-items-center rounded-xl ${styles[tone]}`}><Icon size={18} /></span></div><p className="mt-5 font-mono text-[25px] font-bold tracking-[-0.05em]">{value}</p><p className="mt-1 text-xs text-muted-foreground">{note}</p></div>;
}

function EmptyInline({ label }: { label: string }) { return <div className="rounded-xl border border-dashed border-border p-5 text-center text-sm text-muted-foreground">{label}</div>; }

export default function Dashboard() { return <AppShell><DashboardContent /></AppShell>; }