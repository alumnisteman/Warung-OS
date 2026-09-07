import type { Product, Sale } from "@workspace/db";

export function getStockStatus(product: Pick<Product, "stock" | "lowStockThreshold">) {
  if (product.stock <= 0) return "out" as const;
  if (product.stock <= product.lowStockThreshold) return "low" as const;
  return "safe" as const;
}

export function toProductResponse(product: Product) {
  return {
    ...product,
    purchasePrice: Number(product.purchasePrice),
    salePrice: Number(product.salePrice),
    stockStatus: getStockStatus(product),
  };
}

export function toSaleResponse(sale: Sale, productName: string) {
  return {
    ...sale,
    productName,
    unitPrice: Number(sale.unitPrice),
    total: Number(sale.total),
  };
}

export function startOfDay(date = new Date()) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

export function startOfMonth(date = new Date()) {
  const result = new Date(date);
  result.setDate(1);
  result.setHours(0, 0, 0, 0);
  return result;
}