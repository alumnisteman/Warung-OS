# WarungOS

WarungOS membantu pemilik warung memantau produk, stok, penjualan, omzet, dan kebutuhan restock dari satu aplikasi yang ringkas.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/warung-os` — React + Vite web app untuk dashboard, produk, penjualan, dan restock.
- `artifacts/api-server` — Express API dan seed data development.
- `lib/api-spec/openapi.yaml` — kontrak sumber tunggal untuk endpoint WarungOS.
- `lib/db/src/schema` — tabel PostgreSQL untuk produk dan penjualan.
- `artifacts/warung-os/src/index.css` — token warna dan tema aplikasi.

## Architecture decisions

- API dibuat contract-first melalui OpenAPI dan menghasilkan hook React Query typed.
- MVP tidak memakai autentikasi lokal; data development menggunakan database proyek dan satu konteks warung.
- Rekomendasi restock dihitung dari stok minimum dan rata-rata penjualan 30 hari terakhir.
- Seed data dijalankan sekali saat API mulai jika tabel produk masih kosong, agar preview langsung informatif.

## Product

- Dashboard ringkasan omzet hari ini/bulan ini, transaksi, produk aktif, grafik mingguan, produk terlaris, dan aktivitas.
- Manajemen produk dengan pencarian, filter status stok, tambah, ubah, dan hapus.
- Pencatatan penjualan yang mengurangi stok otomatis dan menolak transaksi saat stok tidak cukup.
- Halaman restock dengan prioritas urgensi dan jumlah yang disarankan.

## User preferences

- Gunakan bahasa Indonesia pada pengalaman pengguna.

## Gotchas

- Workflow menyediakan `PORT` dan `BASE_PATH`; build manual frontend perlu dijalankan dengan keduanya.
- Setelah mengubah OpenAPI, jalankan codegen sebelum memakai hook atau schema baru.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
