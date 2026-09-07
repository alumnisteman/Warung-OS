# WarungOS Production Checklist

## P0 — wajib sebelum transaksi nyata
- [ ] Auth + role Owner/Kasir
- [ ] Multi-warung / tenant isolation
- [ ] Audit log
- [ ] Idempotency key transaksi
- [ ] Backup PostgreSQL
- [ ] HTTPS + secret management
- [ ] Error monitoring

## P1 — operasional warung
- [ ] Stock movement: masuk/keluar/koreksi
- [ ] Supplier
- [ ] Customer
- [ ] Hutang/piutang
- [ ] Metode pembayaran
- [ ] Struk/cetak
- [ ] Barcode
- [ ] Laporan laba kotor

## P2 — pembeda WarungOS
- [ ] Offline transaction queue + auto sync
- [ ] WhatsApp Business
- [ ] AI restock
- [ ] Forecast penjualan
- [ ] Notifikasi stok

## Catatan
Harga uang sebaiknya memakai integer Rupiah atau decimal yang konsisten, bukan floating point, sebelum production.
