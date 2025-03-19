import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { GetAllBaristasUseCase } from "../../application/usecases/get-all-baristas-usecase";
import { DrizzleBaristaRepository } from "../../infrastructure/repositories/drizzle-barista-repository";
import type { Env } from "../../types";
import type { Database } from "../../types";
import { createBaristaSchema, updateBaristaSchema } from "../../domain/entities/barista";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import type * as schema from "../../db/schema";
import { buildHono } from "../common";

const app = buildHono()
  /**
   * バリスタ一覧取得
   */
  .get("/", async (c) => {
    const db = c.get("db");
    const baristaRepository = new DrizzleBaristaRepository(db);
    const getAllBaristasUseCase = new GetAllBaristasUseCase(baristaRepository);

    const result = await getAllBaristasUseCase.execute();
    return c.json({ baristas: result });
  });

export default app;

// /**
//  * バリスタ詳細取得
//  */
// baristaRoutes.get("/baristas/:id", async (c) => {
//   const id = c.req.param("id");
//   const db = c.get("db");
//   const baristaRepository = new DrizzleBaristaRepository(db);
//   const getBaristaByIdUseCase = new GetBaristaByIdUseCase(baristaRepository);

//   try {
//     const barista = await getBaristaByIdUseCase.execute(id);
//     if (!barista) {
//       return c.json({ error: "Barista not found" }, 404);
//     }
//     return c.json({ barista });
//   } catch (error) {
//     console.error("Error fetching barista:", error);
//     return c.json({ error: "Internal Server Error" }, 500);
//   }
// });

// /**
//  * バリスタ作成
//  */
// baristaRoutes.post("/baristas", async (c) => {
//   const body = await c.req.json();
//   const db = c.get("db");
//   const baristaRepository = new DrizzleBaristaRepository(db);
//   const createBaristaUseCase = new CreateBaristaUseCase(baristaRepository);

//   try {
//     const id = await createBaristaUseCase.execute(body);
//     return c.json({ id }, 201);
//   } catch (error) {
//     console.error("Error creating barista:", error);
//     return c.json({ error: "Internal Server Error" }, 500);
//   }
// });

// /**
//  * バリスタ更新
//  */
// baristaRoutes.patch("/baristas/:id", async (c) => {
//   const id = c.req.param("id");
//   const body = await c.req.json();
//   const db = c.get("db");
//   const baristaRepository = new DrizzleBaristaRepository(db);
//   const updateBaristaUseCase = new UpdateBaristaUseCase(baristaRepository);

//   try {
//     await updateBaristaUseCase.execute(id, body);
//     return c.json({ success: true });
//   } catch (error) {
//     console.error("Error updating barista:", error);
//     return c.json({ error: "Internal Server Error" }, 500);
//   }
// });
