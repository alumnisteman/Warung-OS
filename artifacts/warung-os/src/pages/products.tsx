import { useMemo, useState } from 'react';
import { Edit3, PackagePlus, Plus, Search, Trash2, X } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useCreateProduct, useDeleteProduct, useListProducts, useUpdateProduct, getListProductsQueryKey } from '@workspace/api-client-react';
import type { Product, ProductInput } from '@workspace/api-client-react';
import { AppShell, ErrorState, PageIntro, SkeletonBlock } from '@/components/app-shell';
import { StockBadge } from '@/components/status-badge';

const rupiah = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
const blankProduct: ProductInput = { name: '', sku: '', category: 'Sembako', purchasePrice: 0, salePrice: 0, stock: 0, lowStockThreshold: 5, unit: 'pcs' };

export default function Products() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | 'low' | 'out'>('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductInput>(blankProduct);
  const [feedback, setFeedback] = useState('');
  const queryClient = useQueryClient();
  const productsQuery = useListProducts({ search: search || undefined, stockStatus: status === 'all' ? undefined : status });
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const products = useMemo(() => productsQuery.data ?? [], [productsQuery.data]);

  const openCreate = () => { setEditing(null); setForm(blankProduct); setFeedback(''); setFormOpen(true); };
  const openEdit = (product: Product) => { setEditing(product); setForm({ name: product.name, sku: product.sku ?? '', category: product.category, purchasePrice: product.purchasePrice, salePrice: product.salePrice, stock: product.stock, lowStockThreshold: product.lowStockThreshold, unit: product.unit }); setFeedback(''); setFormOpen(true); };
  const updateField = (field: keyof ProductInput, value: string) => setForm((current) => ({ ...current, [field]: ['purchasePrice', 'salePrice', 'stock', 'lowStockThreshold'].includes(field) ? Number(value) : value }));
  const saveProduct = (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name.trim() || !form.category.trim() || !form.unit.trim()) { setFeedback('Lengkapi nama, kategori, dan satuan dulu.'); return; }
    const onDone = () => { void queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() }); setFormOpen(false); setFeedback(editing ? 'Produk diperbarui.' : 'Produk baru ditambahkan.'); };
    if (editing) updateProduct.mutate({ id: editing.id, data: form }, { onSuccess: onDone, onError: () => setFeedback('Belum tersimpan. Coba lagi.') });
    else createProduct.mutate({ data: form }, { onSuccess: onDone, onError: () => setFeedback('Belum tersimpan. Coba lagi.') });
  };
  const removeProduct = (product: Product) => {
    if (!window.confirm(`Hapus ${product.name} dari daftar produk?`)) return;
    deleteProduct.mutate({ id: product.id }, { onSuccess: () => { void queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() }); setFeedback(`${product.name} dihapus.`); }, onError: () => setFeedback('Produk belum bisa dihapus.') });
  };

  return <AppShell>
    <PageIntro eyebrow="Katalog warung" title="Produk & stok" description="Satu pandangan untuk semua barang yang kamu jual." action={<button type="button" onClick={openCreate} data-testid="button-add-product" className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><Plus size={17} />Tambah produk</button>} />
    {feedback && <div data-testid="status-product-feedback" className="mb-5 flex items-center justify-between rounded-xl border border-[hsl(91_34%_48%/0.25)] bg-[hsl(91_34%_48%/0.1)] px-4 py-3 text-sm font-semibold text-[hsl(91_34%_34%)]"><span>{feedback}</span><button type="button" aria-label="Tutup pesan" onClick={() => setFeedback('')} data-testid="button-dismiss-feedback"><X size={16} /></button></div>}
    <div className="rounded-2xl border border-border bg-card p-4 shadow-xs sm:p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <label className="relative block flex-1 lg:max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} data-testid="input-product-search" placeholder="Cari nama atau SKU..." className="h-11 w-full rounded-xl border border-input bg-background pl-10 pr-4 text-sm outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/10" /></label>
        <div className="flex rounded-xl bg-muted p-1">
          {(['all', 'low', 'out'] as const).map((item) => <button type="button" key={item} onClick={() => setStatus(item)} data-testid={`button-filter-${item}`} className={`rounded-lg px-3 py-2 text-xs font-bold transition ${status === item ? 'bg-card text-primary shadow-xs' : 'text-muted-foreground hover:text-foreground'}`}>{item === 'all' ? 'Semua' : item === 'low' ? 'Menipis' : 'Habis'}</button>)}
        </div>
      </div>
      {productsQuery.isLoading ? <div className="mt-5 space-y-3">{[1, 2, 3, 4].map((item) => <SkeletonBlock key={item} className="h-[74px]" />)}</div> : productsQuery.isError ? <div className="mt-5"><ErrorState onRetry={() => void productsQuery.refetch()} /></div> : products.length === 0 ? <EmptyProducts onAdd={openCreate} /> : <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[720px] text-left"><thead><tr className="border-b border-border text-[10px] uppercase tracking-[0.16em] text-muted-foreground"><th className="pb-3 pl-3 font-mono">Produk</th><th className="pb-3 font-mono">Kategori</th><th className="pb-3 font-mono">Harga jual</th><th className="pb-3 font-mono">Stok</th><th className="pb-3 font-mono">Status</th><th className="pb-3 pr-3 text-right font-mono">Aksi</th></tr></thead><tbody className="divide-y divide-border">{products.map((product) => <tr key={product.id} data-testid={`row-product-${product.id}`} className="group transition hover:bg-muted/40"><td className="py-4 pl-3"><div className="flex items-center gap-3"><div className="grid size-9 place-items-center rounded-xl bg-secondary/30 text-primary"><PackagePlus size={17} /></div><div><p className="text-sm font-bold">{product.name}</p><p className="mt-0.5 font-mono text-[10px] text-muted-foreground">{product.sku || 'Tanpa SKU'}</p></div></div></td><td className="py-4 text-sm text-muted-foreground">{product.category}</td><td className="py-4 font-mono text-xs font-bold">{rupiah(product.salePrice)}</td><td className="py-4"><span className="font-mono text-sm font-bold">{product.stock}</span> <span className="text-xs text-muted-foreground">{product.unit}</span></td><td className="py-4"><StockBadge status={product.stockStatus} /></td><td className="py-4 pr-3"><div className="flex justify-end gap-1 opacity-70 transition group-hover:opacity-100"><button type="button" onClick={() => openEdit(product)} data-testid={`button-edit-product-${product.id}`} aria-label={`Edit ${product.name}`} className="grid size-9 place-items-center rounded-lg text-muted-foreground transition hover:bg-secondary/40 hover:text-primary"><Edit3 size={16} /></button><button type="button" onClick={() => removeProduct(product)} data-testid={`button-delete-product-${product.id}`} aria-label={`Hapus ${product.name}`} className="grid size-9 place-items-center rounded-lg text-muted-foreground transition hover:bg-accent/10 hover:text-accent"><Trash2 size={16} /></button></div></td></tr>)}</tbody></table></div>}
    </div>
    {formOpen && <ProductModal editing={editing} form={form} updateField={updateField} onClose={() => setFormOpen(false)} onSubmit={saveProduct} pending={createProduct.isPending || updateProduct.isPending} feedback={feedback} />}
  </AppShell>;
}

function EmptyProducts({ onAdd }: { onAdd: () => void }) {
  return <div className="flex flex-col items-center justify-center px-5 py-16 text-center"><div className="grid size-14 place-items-center rounded-2xl bg-secondary/35 text-primary"><PackagePlus size={25} /></div><h3 className="mt-4 font-serif text-xl font-bold">Belum ada produk di sini</h3><p className="mt-1 max-w-sm text-sm text-muted-foreground">Mulai dari barang yang paling sering dicari pelangganmu.</p><button type="button" onClick={onAdd} data-testid="button-empty-add-product" className="mt-5 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground">Tambah produk</button></div>;
}

function ProductModal({ editing, form, updateField, onClose, onSubmit, pending, feedback }: { editing: Product | null; form: ProductInput; updateField: (field: keyof ProductInput, value: string) => void; onClose: () => void; onSubmit: (event: React.FormEvent) => void; pending: boolean; feedback: string }) {
  const fields: { key: keyof ProductInput; label: string; type?: string; placeholder?: string }[] = [
    { key: 'name', label: 'Nama produk', placeholder: 'Contoh: Beras Pulen 5kg' }, { key: 'sku', label: 'SKU (opsional)', placeholder: 'BR-005' }, { key: 'category', label: 'Kategori', placeholder: 'Sembako' }, { key: 'unit', label: 'Satuan', placeholder: 'pcs, botol, kg' }, { key: 'purchasePrice', label: 'Harga beli', type: 'number' }, { key: 'salePrice', label: 'Harga jual', type: 'number' }, { key: 'stock', label: 'Stok saat ini', type: 'number' }, { key: 'lowStockThreshold', label: 'Batas stok menipis', type: 'number' },
  ];
  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/35 p-0 backdrop-blur-sm sm:items-center sm:p-5"><div role="dialog" aria-modal="true" className="max-h-[92dvh] w-full max-w-2xl overflow-y-auto rounded-t-3xl border border-border bg-card p-5 shadow-2xl sm:rounded-3xl sm:p-7"><div className="flex items-start justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">{editing ? 'Perbarui katalog' : 'Katalog baru'}</p><h3 className="mt-1 font-serif text-2xl font-bold tracking-[-0.04em]">{editing ? 'Edit produk' : 'Tambah produk'}</h3></div><button type="button" onClick={onClose} data-testid="button-close-product-modal" className="grid size-9 place-items-center rounded-lg text-muted-foreground hover:bg-muted"><X size={18} /></button></div><form onSubmit={onSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">{fields.map((field) => <label key={field.key} className={field.key === 'name' || field.key === 'category' ? 'sm:col-span-2' : ''}><span className="mb-1.5 block text-xs font-bold text-foreground">{field.label}</span><input required={field.key !== 'sku'} type={field.type ?? 'text'} min={field.type === 'number' ? 0 : undefined} value={form[field.key] as string | number} onChange={(event) => updateField(field.key, event.target.value)} data-testid={`input-product-${field.key}`} placeholder={field.placeholder} className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10" /></label>)}{feedback && <p className="sm:col-span-2 text-xs font-semibold text-accent">{feedback}</p>}<div className="mt-2 flex justify-end gap-2 border-t border-border pt-5 sm:col-span-2"><button type="button" onClick={onClose} data-testid="button-cancel-product" className="rounded-xl px-4 py-2.5 text-sm font-bold text-muted-foreground transition hover:bg-muted">Batal</button><button type="submit" disabled={pending} data-testid="button-save-product" className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60">{pending ? 'Menyimpan...' : editing ? 'Simpan perubahan' : 'Simpan produk'}</button></div></form></div></div>;
}