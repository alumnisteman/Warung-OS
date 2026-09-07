import { count } from "drizzle-orm";
import { db, productsTable, salesTable } from "@workspace/db";

export async function ensureSeedData() {
  const [{ value }] = await db.select({ value: count() }).from(productsTable);
  if (Number(value) > 0) return;

  const products = await db
    .insert(productsTable)
    .values([
      {
        name: "Indomie Goreng",
        sku: "SKU-001",
        category: "Sembako",
        purchasePrice: 2600,
        salePrice: 3500,
        stock: 8,
        lowStockThreshold: 10,
        unit: "pcs",
      },
      {
        name: "Kopi Kapal Api",
        sku: "SKU-002",
        category: "Minuman",
        purchasePrice: 1200,
        salePrice: 2000,
        stock: 34,
        lowStockThreshold: 12,
        unit: "sachet",
      },
      {
        name: "Aqua 600ml",
        sku: "SKU-003",
        category: "Minuman",
        purchasePrice: 2500,
        salePrice: 4000,
        stock: 0,
        lowStockThreshold: 8,
        unit: "botol",
      },
      {
        name: "Telur Ayam",
        sku: "SKU-004",
        category: "Sembako",
        purchasePrice: 27000,
        salePrice: 32000,
        stock: 18,
        lowStockThreshold: 10,
        unit: "kg",
      },
      {
        name: "Teh Pucuk Harum",
        sku: "SKU-005",
        category: "Minuman",
        purchasePrice: 2800,
        salePrice: 4000,
        stock: 26,
        lowStockThreshold: 10,
        unit: "botol",
      },
    ])
    .returning();

  const now = Date.now();
  const productByName = new Map(products.map((product) => [product.name, product]));
  const seedSales = [
    ["Indomie Goreng", 3, 0],
    ["Kopi Kapal Api", 5, 1],
    ["Aqua 600ml", 2, 2],
    ["Teh Pucuk Harum", 4, 3],
    ["Indomie Goreng", 2, 4],
    ["Kopi Kapal Api", 6, 6],
    ["Telur Ayam", 1, 7],
  ].flatMap(([name, quantity, daysAgo]) => {
    const product = productByName.get(String(name));
    if (!product) return [];
    return [{
      productId: product.id,
      quantity: Number(quantity),
      unitPrice: product.salePrice,
      total: product.salePrice * Number(quantity),
      createdAt: new Date(now - Number(daysAgo) * 86_400_000),
    }];
  });
  if (seedSales.length > 0) {
    await db.insert(salesTable).values(seedSales);
  }
}