// プロフィールドメインモデル
export interface Profile {
  id: string;
  userId: string;
  type: string;
  displayName: string;
  iconURL?: string;
  bio?: string;
  snsLinks?: string;
  shopName?: string;
  createdAt: Date;
}

// バリスタプロフィール作成・更新用DTO
export type BaristaProfileDTO = {
  displayName: string;
  iconUrl?: string;
  bio?: string;
  snsLinks?: string[];
  shopName?: string;
};
