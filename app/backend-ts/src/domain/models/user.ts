// ユーザードメインモデル
export interface User {
  id: string;
  email: string;
  authType: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

// 他のモデルからの参照用にProfileインターフェースをimport
import type { Profile } from "./profile.js";

// プロフィール含むユーザー
export type UserWithProfile = User & {
  profile?: Profile;
};

// ユーザー作成時のDTO
export type CreateUserDTO = {
  email: string;
  authType: string;
};
