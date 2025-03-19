import type { Barista } from "./domain/entities/barista";

/**
 * API成功レスポンスの型
 */
export type ApiSuccessResponse<T> = {
  success: true;
  data: T;
};

/**
 * APIエラーレスポンスの型
 */
export type ApiErrorResponse = {
  success: false;
  message: string;
};

/**
 * API全体のレスポンス型
 */
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * バリスタAPI型定義
 */
export type BaristaApi = {
  // バリスタ一覧取得API
  "GET /baristas": {
    response: {
      baristas: Array<Barista>;
    };
  };
  // バリスタ詳細取得API
  "GET /baristas/:id": {
    params: {
      id: string;
    };
    response: {
      barista: Barista;
    };
  };
  // バリスタ作成API
  "POST /baristas": {
    request: {
      userId: string;
      displayName: string;
      iconUrl?: string;
      bio?: string;
      snsLinks?: string[];
      shopName?: string;
    };
    response: {
      id: string;
    };
  };
  // バリスタ更新API
  "PATCH /baristas/:id": {
    params: {
      id: string;
    };
    request: {
      displayName?: string;
      iconUrl?: string;
      bio?: string;
      snsLinks?: string[];
      shopName?: string;
    };
    response: {
      success: boolean;
    };
  };
};
