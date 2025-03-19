import { hc } from "hono/client";
import type { AppType } from "../../../backend/src/index";

/**
 * API接続先URLの設定
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8787";

// バリスタのレスポンス型定義
interface BaristaListResponse {
  baristas: Array<{
    id: string;
    displayName: string;
    iconUrl?: string;
    shopName?: string;
  }>;
}

interface BaristaDetailResponse {
  barista: {
    id: string;
    userId: string;
    displayName: string;
    iconUrl?: string;
    bio?: string;
    snsLinks?: string[];
    shopName?: string;
    createdAt: string;
    evaluationCount: number;
  };
}

/**
 * バリスタ一覧を取得する
 */
export const getBaristas = async (): Promise<BaristaListResponse> => {
  try {
    const res = await fetch(`${API_BASE_URL}/baristas`);

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "バリスタ一覧の取得に失敗しました");
    }

    return res.json();
  } catch (error) {
    console.error("バリスタ一覧取得エラー:", error);
    throw error;
  }
};

/**
 * バリスタの詳細を取得する
 */
export const getBaristaById = async (id: string): Promise<BaristaDetailResponse> => {
  try {
    const res = await fetch(`${API_BASE_URL}/baristas/${id}`);

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "バリスタ詳細の取得に失敗しました");
    }

    return res.json();
  } catch (error) {
    console.error("バリスタ詳細取得エラー:", error);
    throw error;
  }
};

/**
 * 新しいバリスタを作成する
 */
export const createBarista = async (data: {
  userId: string;
  displayName: string;
  iconUrl?: string;
  bio?: string;
  snsLinks?: string[];
  shopName?: string;
}) => {
  try {
    const res = await fetch(`${API_BASE_URL}/baristas`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "バリスタの作成に失敗しました");
    }

    return res.json();
  } catch (error) {
    console.error("バリスタ作成エラー:", error);
    throw error;
  }
};

/**
 * バリスタ情報を更新する
 */
export const updateBarista = async (
  id: string,
  data: {
    displayName?: string;
    iconUrl?: string;
    bio?: string;
    snsLinks?: string[];
    shopName?: string;
  },
) => {
  try {
    const res = await fetch(`${API_BASE_URL}/baristas/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "バリスタの更新に失敗しました");
    }

    return res.json();
  } catch (error) {
    console.error("バリスタ更新エラー:", error);
    throw error;
  }
};
