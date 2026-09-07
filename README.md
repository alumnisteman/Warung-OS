# WarungOS

Aplikasi POS/operasional warung berbasis React + Express + Drizzle/PostgreSQL.

## Sudah tersedia
- Dashboard omzet dan aktivitas
- Produk & stok
- Penjualan
- Rekomendasi restok
- API + OpenAPI/Zod
- API URL configurable untuk Android
- PWA manifest + service worker
- Capacitor configuration untuk APK

## Build web

```bash
pnpm install
pnpm --filter @workspace/warung-os build
```

## Build Android

Lihat [docs/ANDROID_APK.md](docs/ANDROID_APK.md).

## Roadmap produksi
Auth/PIN, multi-warung, offline SQLite + sync, supplier, pelanggan/piutang, pembayaran, struk/printer, barcode, WhatsApp Business, AI forecasting, audit log, backup, rate limiting, monitoring.
