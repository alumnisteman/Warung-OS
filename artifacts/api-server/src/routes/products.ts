import { Router, type IRouter } from "express";
import { asc, eq } from "drizzle-orm";
import { db, productsTable } from "@workspace/db";
import {
  CreateProductBody,
  CreateProductResponse,
  DeleteProductParams,
  ListProductsQueryParams,
  ListProductsResponse,
  UpdateProductBody,
  UpdateProductParams,
  UpdateProductResponse,
} from "@workspace/api-zod";
import { toProductResponse } from "../lib/warung";

const router: IRouter = Router();

router.get("/products", async (req, res): Promise<void> => {
  const parsedQuery = ListProductsQueryParams.safeParse(req.query);
  if (!parsedQuery.success) {
    res.status(400).json({ error: parsedQuery.error.message });
    return;
  }

  const { search, stockStatus } = parsedQuery.data;
  const rows = await db.select().from(productsTable).orderBy(asc(productsTable.name));
  const normalizedSearch = search?.trim().toLowerCase();
  const products = rows
    .map(toProductResponse)
    .filter((product) => {
      const matchesSearch =
        !normalizedSearch ||
        product.name.toLowerCase().includes(normalizedSearch) ||
        product.category.toLowerCase().includes(normalizedSearch) ||
        product.sku?.toLowerCase().includes(normalizedSearch);
      const matchesStatus = stockStatus === "all" || product.stockStatus === stockStatus;
      return matchesSearch && matchesStatus;
    });

  res.json(ListProductsResponse.parse(products));
});

router.post("/products", async (req, res): Promise<void> => {
  const parsed = CreateProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [product] = await db.insert(productsTable).values(parsed.data).returning();
  res.status(201).json(CreateProductResponse.parse(toProductResponse(product)));
});

router.patch("/products/:id", async (req, res): Promise<void> => {
  const parsedParams = UpdateProductParams.safeParse(req.params);
  if (!parsedParams.success) {
    res.status(400).json({ error: parsedParams.error.message });
    return;
  }
  const parsedBody = UpdateProductBody.safeParse(req.body);
  if (!parsedBody.success) {
    res.status(400).json({ error: parsedBody.error.message });
    return;
  }

  const [product] = await db
    .update(productsTable)
    .set({ ...parsedBody.data, updatedAt: new Date() })
    .where(eq(productsTable.id, parsedParams.data.id))
    .returning();

  if (!product) {
    res.status(404).json({ error: "Produk tidak ditemukan" });
    return;
  }
  res.json(UpdateProductResponse.parse(toProductResponse(product)));
});

router.delete("/products/:id", async (req, res): Promise<void> => {
  const parsedParams = DeleteProductParams.safeParse(req.params);
  if (!parsedParams.success) {
    res.status(400).json({ error: parsedParams.error.message });
    return;
  }

  const [product] = await db
    .delete(productsTable)
    .where(eq(productsTable.id, parsedParams.data.id))
    .returning();

  if (!product) {
    res.status(404).json({ error: "Produk tidak ditemukan" });
    return;
  }
  res.sendStatus(204);
});

export default router;