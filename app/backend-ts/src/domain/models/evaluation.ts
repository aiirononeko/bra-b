// 評価ドメインモデル
export interface Evaluation {
  id: string;
  baristaProfileId: string;
  evaluatorUserId?: string;
  evaluatedAt: Date;
  details: EvaluationDetail[];
}

// 評価詳細モデル
export interface EvaluationDetail {
  id: string;
  evaluationId: string;
  evaluationItemId: string;
}

// 評価項目モデル
export interface EvaluationItem {
  id: string;
  categoryId?: string;
  name: string;
  isCommon: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
}

// 評価カテゴリモデル
export interface EvaluationCategory {
  id: string;
  name: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  items?: EvaluationItem[];
}

// バリスタ評価用DTO
export type EvaluateBaristaDTO = {
  baristaId: string;
  selectedTagIds: string[];
};
