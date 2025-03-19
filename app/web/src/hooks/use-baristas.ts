import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { InferRequestType, InferResponseType } from "hono/client";
import { apiClient } from "../lib/api";
import { throwHttpErrorAtFailure } from "./use-handle-http-error";

// バリスタAPI参照
const baristasApi = apiClient.baristas;
const baristaIdApi = baristasApi[":id"];

// レスポンス型定義
export type BaristasListResponse = InferResponseType<typeof baristasApi.$get>;
export type BaristaDetailResponse = InferResponseType<typeof baristaIdApi.$get>;
export type CreateBaristaResponse = InferResponseType<typeof baristasApi.$post>;
export type UpdateBaristaResponse = InferResponseType<typeof baristaIdApi.$patch>;

// クエリキー定義
const BARISTAS_KEY = ["baristas"];
const BARISTA_DETAIL_KEY = (id: string) => ["barista", id];

/**
 * バリスタ一覧を取得するフック
 */
export const useBaristas = () => {
  const fetcher = async () => {
    const res = await baristasApi.$get();
    await throwHttpErrorAtFailure(res);
    return res.json() as Promise<BaristasListResponse>;
  };

  return useQuery<BaristasListResponse, Error>({
    queryKey: BARISTAS_KEY,
    queryFn: fetcher,
  });
};

/**
 * 特定のバリスタ詳細を取得するフック
 */
export const useBaristaDetail = (id?: string) => {
  const fetcher = async () => {
    if (!id) return null;
    const res = await baristaIdApi.$get({ param: { id } });
    await throwHttpErrorAtFailure(res);
    return res.json() as Promise<BaristaDetailResponse>;
  };

  return useQuery<BaristaDetailResponse | null, Error>({
    queryKey: BARISTA_DETAIL_KEY(id || ""),
    queryFn: fetcher,
    enabled: !!id,
  });
};

/**
 * バリスタを作成するフック
 */
export const useCreateBarista = () => {
  const queryClient = useQueryClient();

  const fetcher = async (data: InferRequestType<typeof baristasApi.$post>["json"]) => {
    const res = await baristasApi.$post({ json: data });
    await throwHttpErrorAtFailure(res);
    return res.json();
  };

  return useMutation({
    mutationFn: fetcher,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BARISTAS_KEY });
    },
  });
};

/**
 * バリスタを更新するフック
 */
export const useUpdateBarista = (id: string) => {
  const queryClient = useQueryClient();

  const fetcher = async (data: InferRequestType<typeof baristaIdApi.$patch>["json"]) => {
    const res = await baristaIdApi.$patch({ param: { id }, json: data });
    await throwHttpErrorAtFailure(res);
    return res.json();
  };

  return useMutation({
    mutationFn: fetcher,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BARISTAS_KEY });
      queryClient.invalidateQueries({ queryKey: BARISTA_DETAIL_KEY(id) });
    },
  });
};

/**
 * 動的IDでバリスタを作成するフック
 */
export const useCreateBaristaDynamic = () => {
  const queryClient = useQueryClient();

  const fetcher = async (arg: {
    userId: string;
    data: Omit<InferRequestType<typeof baristasApi.$post>["json"], "userId">;
  }) => {
    const { userId, data: baristaData } = arg;
    const res = await baristasApi.$post({
      json: { userId, ...baristaData },
    });
    await throwHttpErrorAtFailure(res);
    return res.json();
  };

  return useMutation({
    mutationFn: fetcher,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BARISTAS_KEY });
    },
  });
};
