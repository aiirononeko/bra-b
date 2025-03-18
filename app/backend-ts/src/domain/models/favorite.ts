// お気に入りドメインモデル
export interface Favorite {
  id: string;
  userId: string;
  baristaProfileId: string;
  createdAt: Date;
}

// お気に入り追加用DTO
export type AddFavoriteDTO = {
  baristaId: string;
};
