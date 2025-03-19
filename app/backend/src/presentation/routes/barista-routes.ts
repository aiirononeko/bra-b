import { zValidator } from "@hono/zod-validator";

import { authMiddleware } from "../middlewares/auth";
import { buildHono, errThrowHelper } from "../common";

import { GetAllBaristasUseCase } from "../../application/usecases/barista/get-all-baristas-usecase";
import { GetBaristaByIdUseCase } from "../../application/usecases/barista/get-barista-by-id-usecase";
import { CreateBaristaUseCase } from "../../application/usecases/barista/create-barista-usecase";
import { UpdateBaristaUseCase } from "../../application/usecases/barista/update-barista-usecase";
import { getBaristaRepository } from "../../infrastructure/repositories";

import { createBaristaSchema, updateBaristaSchema } from "../../domain/entities/barista";

const app = buildHono()
  /**
   * バリスタ一覧取得
   */
  .get("/", async (c) => {
    const baristaRepository = getBaristaRepository(c.env);
    const getAllBaristasUseCase = new GetAllBaristasUseCase(baristaRepository);

    const result = await getAllBaristasUseCase.execute();
    return c.json({ baristas: result });
  })

  /**
   * バリスタ詳細取得
   */
  .get("/:id", async (c) => {
    const id = c.req.param("id");
    const baristaRepository = getBaristaRepository(c.env);
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
   * 認証が必要
   */
  .post("/", authMiddleware, zValidator("json", createBaristaSchema), async (c) => {
    const body = await c.req.valid("json");
    const user = c.get("user");

    // authMiddlewareでuserが設定されていることを確認
    if (!user) {
      throw errThrowHelper(401, "認証が必要です");
    }

    // ユーザーIDを設定（認証済みユーザーのIDを使用）
    const data = {
      ...body,
      userId: user.id,
    };

    const baristaRepository = getBaristaRepository(c.env);
    const createBaristaUseCase = new CreateBaristaUseCase(baristaRepository);

    try {
      const barista = await createBaristaUseCase.execute(data);
      return c.json({ barista }, 201);
    } catch (error) {
      console.error("バリスタ作成エラー:", error);
      return c.json({ message: "サーバーエラーが発生しました" }, 500);
    }
  })

  /**
   * バリスタ更新
   * 認証が必要
   */
  .patch("/:id", authMiddleware, zValidator("json", updateBaristaSchema), async (c) => {
    const id = c.req.param("id");
    const body = c.req.valid("json");
    const user = c.get("user");

    // authMiddlewareでuserが設定されていることを確認
    if (!user) {
      throw errThrowHelper(401, "認証が必要です");
    }

    const baristaRepository = getBaristaRepository(c.env);

    // 権限チェック：自分のプロフィールかどうか確認
    const barista = await baristaRepository.findById(id);
    if (!barista) {
      return c.json({ message: "バリスタが見つかりません" }, 404);
    }

    if (barista.userId !== user.id) {
      return c.json({ message: "このバリスタプロフィールを更新する権限がありません" }, 403);
    }

    const updateBaristaUseCase = new UpdateBaristaUseCase(baristaRepository);

    try {
      const updatedBarista = await updateBaristaUseCase.execute(id, body);
      return c.json({ barista: updatedBarista });
    } catch (error) {
      console.error("バリスタ更新エラー:", error);
      return c.json({ message: "サーバーエラーが発生しました" }, 500);
    }
  });

export default app;
