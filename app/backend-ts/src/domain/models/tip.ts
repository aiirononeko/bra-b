// チップドメインモデル
export interface Tip {
  id: string;
  baristaProfileId: string;
  senderUserId?: string;
  amount: number;
  message?: string;
  stripePaymentIntentId: string;
  sentAt: Date;
}

// チップ送信用DTO
export type SendTipDTO = {
  baristaId: string;
  amount: number;
  message?: string;
};
