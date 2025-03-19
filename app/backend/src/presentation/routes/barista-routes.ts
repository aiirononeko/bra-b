import { zValidator } from "@hono/zod-validator";

import { buildHono } from "../common";
import { GetAllBaristasUseCase } from "../../application/usecases/get-all-baristas-usecase";
import { GetBaristaByIdUseCase } from "../../application/usecases/get-barista-by-id-usecase";
import { CreateBaristaUseCase } from "../../application/usecases/create-barista-usecase";
import { UpdateBaristaUseCase } from "../../application/usecases/update-barista-usecase";
import { DrizzleBaristaRepository } from "../../infrastructure/repositories/drizzle-barista-repository";
import { createBaristaSchema, updateBaristaSchema } from "../../domain/entities/barista";

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
  })

  /**
   * バリスタ詳細取得
   */
  .get("/:id", async (c) => {
    const id = c.req.param("id");
    const db = c.get("db");
    const baristaRepository = new DrizzleBaristaRepository(db);
    const getBaristaByIdUseCase = new GetBaristaByIdUseCase(baristaRepository);

    try {
      const barista = await getBaristaByIdUseCase.execute(id);
      if (!barista) {
        return c.json({ message: "バリスタが見つかりません" }, 404);
      }
      return c.json({ barista });
    } catch (error) {
      console.error("バリスタ詳細取得エラー:", error);
      return c.json({ message: "サーバーエラーが発生しました" }, 500);
    }
  })

  /**
   * バリスタ作成
   */
  .post("/", zValidator("json", createBaristaSchema), async (c) => {
    const body = await c.req.valid("json");
    const db = c.get("db");
    const baristaRepository = new DrizzleBaristaRepository(db);
    const createBaristaUseCase = new CreateBaristaUseCase(baristaRepository);

    try {
      const barista = await createBaristaUseCase.execute(body);
      return c.json({ barista }, 201);
    } catch (error) {
      console.error("バリスタ作成エラー:", error);
      return c.json({ message: "サーバーエラーが発生しました" }, 500);
    }
  })

  /**
   * バリスタ更新
   */
  .patch("/:id", zValidator("json", updateBaristaSchema), async (c) => {
    const id = c.req.param("id");
    const body = await c.req.valid("json");
    const db = c.get("db");
    const baristaRepository = new DrizzleBaristaRepository(db);
    const updateBaristaUseCase = new UpdateBaristaUseCase(baristaRepository);

    try {
      // TODO: 認証情報からログインユーザーのIDを取得し、自分のプロフィールかどうかをチェックする
      const barista = await updateBaristaUseCase.execute(id, body);
      return c.json({ barista });
    } catch (error) {
      console.error("バリスタ更新エラー:", error);
      return c.json({ message: "サーバーエラーが発生しました" }, 500);
    }
  });

export default app;
