import { zValidator } from "@hono/zod-validator";

import { buildHono, errThrowHelper } from "../common";

import { GetAllBaristasUseCase } from "../../application/usecases/barista/get-all-baristas-usecase";
import { GetBaristaByIdUseCase } from "../../application/usecases/barista/get-barista-by-id-usecase";
import { CreateBaristaUseCase } from "../../application/usecases/barista/create-barista-usecase";
import { UpdateBaristaUseCase } from "../../application/usecases/barista/update-barista-usecase";
import { getBaristaRepository } from "../../infrastructure/repositories";

import { createBaristaSchema, updateBaristaSchema } from "../../domain/entities/barista";

/**
 * バリスタ関連のルーティング
 *
 * バリスタのCRUD操作を提供するエンドポイント
 */
const app = buildHono()
  /**
   * バリスタ一覧取得
   *
   * GET /baristas
   * @returns すべてのバリスタ情報の一覧
   */
  .get("/", async (c) => {
    try {
      const baristaRepository = getBaristaRepository(c.env);
      const getAllBaristasUseCase = new GetAllBaristasUseCase(baristaRepository);

      const result = await getAllBaristasUseCase.execute();
      return c.json({
        success: true,
        baristas: result,
      });
    } catch (error) {
      console.error("バリスタ一覧取得エラー:", error);
      const message = error instanceof Error ? error.message : "サーバーエラーが発生しました";
      return c.json(
        {
          success: false,
          message,
        },
        500,
      );
    }
  })

  /**
   * バリスタ詳細取得
   *
   * GET /baristas/:id
   * @param id - 取得するバリスタのID
   * @returns 指定されたIDのバリスタ情報
   */
  .get("/:id", async (c) => {
    const id = c.req.param("id");

    try {
      const baristaRepository = getBaristaRepository(c.env);
      const getBaristaByIdUseCase = new GetBaristaByIdUseCase(baristaRepository);

      const barista = await getBaristaByIdUseCase.execute(id);
      if (!barista) {
        return c.json(
          {
            success: false,
            message: "バリスタが見つかりません",
          },
          404,
        );
      }

      return c.json({
        success: true,
        barista,
      });
    } catch (error) {
      console.error("バリスタ詳細取得エラー:", error);
      const message = error instanceof Error ? error.message : "サーバーエラーが発生しました";
      return c.json(
        {
          success: false,
          message,
        },
        500,
      );
    }
  });

// /**
//  * バリスタ作成
//  * 認証が必要
//  *
//  * POST /baristas
//  * @body バリスタの作成情報
//  * @returns 作成されたバリスタ情報
//  */
// .post("/", authMiddleware, zValidator("json", createBaristaSchema), async (c) => {
//   const body = await c.req.valid("json");
//   const user = c.get("user");

//   // authMiddlewareでuserが設定されていることを確認
//   if (!user) {
//     throw errThrowHelper(401, "認証が必要です");
//   }

//   // ユーザーIDを設定（認証済みユーザーのIDを使用）
//   const data = {
//     ...body,
//     userId: user.id,
//   };

//   try {
//     const baristaRepository = getBaristaRepository(c.env);
//     const createBaristaUseCase = new CreateBaristaUseCase(baristaRepository);

//     const barista = await createBaristaUseCase.execute(data);
//     return c.json(
//       {
//         success: true,
//         barista,
//       },
//       201,
//     );
//   } catch (error) {
//     console.error("バリスタ作成エラー:", error);
//     const message = error instanceof Error ? error.message : "サーバーエラーが発生しました";
//     return c.json(
//       {
//         success: false,
//         message,
//       },
//       500,
//     );
//   }
// })

// /**
//  * バリスタ更新
//  * 認証が必要
//  *
//  * PATCH /baristas/:id
//  * @param id - 更新するバリスタのID
//  * @body 更新するバリスタ情報
//  * @returns 更新されたバリスタ情報
//  */
// .patch("/:id", authMiddleware, zValidator("json", updateBaristaSchema), async (c) => {
//   const id = c.req.param("id");
//   const body = c.req.valid("json");
//   const user = c.get("user");

//   // authMiddlewareでuserが設定されていることを確認
//   if (!user) {
//     throw errThrowHelper(401, "認証が必要です");
//   }

//   try {
//     const baristaRepository = getBaristaRepository(c.env);

//     // 権限チェック：自分のプロフィールかどうか確認
//     const barista = await baristaRepository.getBaristaById(id);
//     if (!barista) {
//       return c.json(
//         {
//           success: false,
//           message: "バリスタが見つかりません",
//         },
//         404,
//       );
//     }

//     if (barista.userId !== user.id) {
//       return c.json(
//         {
//           success: false,
//           message: "このバリスタプロフィールを更新する権限がありません",
//         },
//         403,
//       );
//     }

//     const updateBaristaUseCase = new UpdateBaristaUseCase(baristaRepository);
//     const updatedBarista = await updateBaristaUseCase.execute(id, body);

//     return c.json({
//       success: true,
//       barista: updatedBarista,
//     });
//   } catch (error) {
//     console.error("バリスタ更新エラー:", error);
//     const message = error instanceof Error ? error.message : "サーバーエラーが発生しました";
//     return c.json(
//       {
//         success: false,
//         message,
//       },
//       500,
//     );
//   }
// })

// /**
//  * バリスタ削除
//  * 認証が必要
//  *
//  * DELETE /baristas/:id
//  * @param id - 削除するバリスタのID
//  * @returns 削除結果
//  */
// .delete("/:id", authMiddleware, async (c) => {
//   const id = c.req.param("id");
//   const user = c.get("user");

//   // authMiddlewareでuserが設定されていることを確認
//   if (!user) {
//     throw errThrowHelper(401, "認証が必要です");
//   }

//   try {
//     const baristaRepository = getBaristaRepository(c.env);

//     // 権限チェック：自分のプロフィールかどうか確認
//     const barista = await baristaRepository.getBaristaById(id);
//     if (!barista) {
//       return c.json(
//         {
//           success: false,
//           message: "バリスタが見つかりません",
//         },
//         404,
//       );
//     }

//     if (barista.userId !== user.id) {
//       return c.json(
//         {
//           success: false,
//           message: "このバリスタプロフィールを削除する権限がありません",
//         },
//         403,
//       );
//     }

//     // バリスタの削除処理を実装
//     await baristaRepository.deleteBaristaById(id);

//     return c.json({
//       success: true,
//       message: "バリスタが正常に削除されました",
//     });
//   } catch (error) {
//     console.error("バリスタ削除エラー:", error);
//     const message = error instanceof Error ? error.message : "サーバーエラーが発生しました";
//     return c.json(
//       {
//         success: false,
//         message,
//       },
//       500,
//     );
//   }
// });

export default app;
