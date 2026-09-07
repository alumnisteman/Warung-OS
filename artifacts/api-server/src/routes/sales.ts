import { Router, type IRouter } from "express";
import { and, desc, eq, gte } from "drizzle-orm";
import { db, productsTable, salesTable } from "@workspace/db";
import {
  CreateSaleBody,
  CreateSaleResponse,
  ListSalesQueryParams,
  ListSalesResponse,
} from "@workspace/api-zod";
import { toSaleResponse } from "../lib/warung";

const router: IRouter = Router();

router.get("/sales", async (req, res): Promise<void> => {
  const parsedQuery = ListSalesQueryParams.safeParse(req.query);
  if (!parsedQuery.success) {
    res.status(400).json({ error: parsedQuery.error.message });
    return;
  }

  const rows = await db
    .select({ sale: salesTable, productName: productsTable.name })
    .from(salesTable)
    .innerJoin(productsTable, eq(salesTable.productId, productsTable.id))
    .orderBy(desc(salesTable.createdAt))
    .limit(parsedQuery.data.limit);
  res.json(ListSalesResponse.parse(rows.map((row) => toSaleResponse(row.sale, row.productName))));
});

router.post("/sales", async (req, res): Promise<void> => {
  const parsed = CreateSaleBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const sale = await db.transaction(async (tx) => {
    const [product] = await tx
      .select()
      .from(productsTable)
      .where(eq(productsTable.id, parsed.data.productId));
    if (!product) return { error: "Produk tidak ditemukan" as const };

    const [updatedProduct] = await tx
      .update(productsTable)
      .set({
        stock: product.stock - parsed.data.quantity,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(productsTable.id, parsed.data.productId),
          gte(productsTable.stock, parsed.data.quantity),
        ),
      )
      .returning();
    if (!updatedProduct) return { error: "Stok tidak mencukupi" as const };

    const [createdSale] = await tx
      .insert(salesTable)
      .values({
        productId: product.id,
        quantity: parsed.data.quantity,
        unitPrice: product.salePrice,
        total: product.salePrice * parsed.data.quantity,
      })
      .returning();
    return { createdSale, productName: product.name };
  });

  if ("error" in sale) {
    res.status(400).json({ error: sale.error });
    return;
  }
  res.status(201).json(CreateSaleResponse.parse(toSaleResponse(sale.createdSale, sale.productName)));
});

export default router;