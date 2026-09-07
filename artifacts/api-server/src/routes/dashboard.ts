import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import { db, productsTable, salesTable } from "@workspace/db";
import {
  GetDashboardSummaryResponse,
  ListActivityResponse,
  ListRestockRecommendationsResponse,
} from "@workspace/api-zod";
import { getStockStatus, startOfDay, startOfMonth, toProductResponse, toSaleResponse } from "../lib/warung";

const router: IRouter = Router();

async function getSalesWithNames() {
  const rows = await db
    .select({ sale: salesTable, productName: productsTable.name })
    .from(salesTable)
    .innerJoin(productsTable, eq(salesTable.productId, productsTable.id))
    .orderBy(desc(salesTable.createdAt));
  return rows.map((row) => toSaleResponse(row.sale, row.productName));
}

router.get("/dashboard/summary", async (_req, res): Promise<void> => {
  const [productRows, sales] = await Promise.all([
    db.select().from(productsTable),
    getSalesWithNames(),
  ]);
  const now = new Date();
  const today = startOfDay(now);
  const month = startOfMonth(now);
  const todaySales = sales.filter((sale) => sale.createdAt >= today);
  const monthSales = sales.filter((sale) => sale.createdAt >= month);
  const weeklyRevenue = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));
    const nextDate = new Date(date);
    nextDate.setDate(date.getDate() + 1);
    const value = sales
      .filter((sale) => sale.createdAt >= date && sale.createdAt < nextDate)
      .reduce((sum, sale) => sum + sale.total, 0);
    return {
      label: new Intl.DateTimeFormat("id-ID", { weekday: "short" }).format(date),
      value: Math.round(value),
    };
  });
  const productTotals = new Map<string, { quantity: number; revenue: number }>();
  for (const sale of monthSales) {
    const current = productTotals.get(sale.productName) ?? { quantity: 0, revenue: 0 };
    productTotals.set(sale.productName, {
      quantity: current.quantity + sale.quantity,
      revenue: current.revenue + sale.total,
    });
  }
  const topProducts = [...productTotals.entries()]
    .map(([name, values]) => ({ name, ...values }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);
  const response = {
    revenueToday: Math.round(todaySales.reduce((sum, sale) => sum + sale.total, 0)),
    revenueMonth: Math.round(monthSales.reduce((sum, sale) => sum + sale.total, 0)),
    salesToday: todaySales.length,
    productCount: productRows.length,
    lowStockCount: productRows.filter((product) => getStockStatus(product) !== "safe").length,
    weeklyRevenue,
    topProducts: topProducts.map((product) => ({
      ...product,
      revenue: Math.round(product.revenue),
    })),
  };
  res.json(GetDashboardSummaryResponse.parse(response));
});

router.get("/dashboard/activity", async (_req, res): Promise<void> => {
  const [products, sales] = await Promise.all([
    db.select().from(productsTable).orderBy(desc(productsTable.createdAt)),
    getSalesWithNames(),
  ]);
  const saleActivities = sales.slice(0, 12).map((sale) => ({
    id: sale.id,
    type: "sale" as const,
    title: "Penjualan tercatat",
    description: `${sale.quantity} ${sale.productName} · Rp${Math.round(sale.total).toLocaleString("id-ID")}`,
    createdAt: sale.createdAt,
  }));
  const productActivities = products.slice(0, 8).map((product) => ({
    id: 100000 + product.id,
    type: "product" as const,
    title: "Produk ditambahkan",
    description: `${product.name} · stok awal ${product.stock} ${product.unit}`,
    createdAt: product.createdAt,
  }));
  const activities = [...saleActivities, ...productActivities]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 12);
  res.json(ListActivityResponse.parse(activities));
});

router.get("/dashboard/restock-recommendations", async (_req, res): Promise<void> => {
  const [products, sales] = await Promise.all([
    db.select().from(productsTable),
    getSalesWithNames(),
  ]);
  const since = new Date();
  since.setDate(since.getDate() - 30);
  const recommendations = products
    .filter((product) => getStockStatus(product) !== "safe")
    .map((product) => {
      const quantitySold = sales
        .filter((sale) => sale.productId === product.id && sale.createdAt >= since)
        .reduce((sum, sale) => sum + sale.quantity, 0);
      const avgDailySales = quantitySold / 30;
      const targetStock = Math.max(product.lowStockThreshold * 2, Math.ceil(avgDailySales * 14));
      const suggestedQuantity = Math.max(1, targetStock - product.stock);
      const daysRemaining = avgDailySales > 0 ? product.stock / avgDailySales : 99;
      const urgency: "urgent" | "soon" | "planned" =
        product.stock === 0 || daysRemaining <= 3 ? "urgent" : daysRemaining <= 7 ? "soon" : "planned";
      return {
        productId: product.id,
        productName: product.name,
        currentStock: product.stock,
        suggestedQuantity,
        avgDailySales: Math.round(avgDailySales * 10) / 10,
        urgency,
        reason:
          product.stock === 0
            ? "Stok habis dan perlu segera diisi."
            : avgDailySales > 0
              ? `Dengan penjualan rata-rata ${Math.round(avgDailySales * 10) / 10} per hari, stok diperkirakan cepat menipis.`
              : "Stok sudah di bawah batas minimum yang Anda tetapkan.",
      };
    })
    .sort((a, b) => {
      const priority = { urgent: 0, soon: 1, planned: 2 };
      return priority[a.urgency] - priority[b.urgency];
    });
  res.json(ListRestockRecommendationsResponse.parse(recommendations));
});

export default router;