/* messagesTable */

// メッセージテーブル保存
export interface MessageTable {
  messageId: string;
  mode: number;
  userId: string;
  shareStatus: number;
  question: string;
  answer: string;
  referenceType: number;
  memberStatus: number;
  createdAt: number;
}

// referenceType更新(postback)
export interface MessageReferenceTypeProps {
  userId?: string;
  messageId?: string;
  referenceType: number;
  mode: number;
  updatedAt: number;
}
