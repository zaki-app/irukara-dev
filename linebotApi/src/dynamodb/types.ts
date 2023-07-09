// dynamodb関係で使用する型定義

// user情報
export interface UserInfoType {
  userId: string;
  subUserId: string;
  status: number;
  todayCount?: number;
  totalCount?: number;
  todaySave?: number;
  totalSave?: number;
  lastLogin?: number;
  accessToken?: string;
  createdAt: number;
  updatedAt?: number;
  deletedAt?: number;
}

// user存在確認
export interface IsRegisterUser {
  data: {
    userId: string;
    subUserId: string;
    status: number;
    todayCount?: number;
    totalCount?: number;
    todaySave?: number;
    totalSave?: number;
    lastLogin?: number;
    accessToken?: string;
    createdAt: number;
    updatedAt?: number;
    deletedAt?: number;
  };
  isRegister: boolean;
}

// メッセージ保存
// 型定義
export interface SaveAnswerType {
  messageId: string;
  userId: string;
  shareStatus: number;
  question: string;
  answer: string;
  referenceType: number;
  memberStatus: number;
  createdAt: number;
}

// isRegisterUserの返り値
export type UserInfo = string | boolean;

// ユーザーテーブル更新のparams
export interface UpdateUserTable {
  subUserId?: string;
  status?: number;
  todayCount?: number;
  totalCount?: number;
  todaySave?: number;
  totalSave?: number;
  lastLogin?: number;
  accessToken?: string;
  createdAt?: number;
  updatedAt?: number;
  deletedAt?: number;
}

// postback時の型
export interface PostbackType {
  userId?: string;
  messageId: string;
  referenceType: number;
  createdAt: number;
}

// メッセージ送信、postbackでの上限をリセット
export interface UpperLimitParams {
  todayCount?: number;
  totalCount?: number;
  todaySave?: number;
  totalSave?: number;
  lastLogin?: number;
  updatedAt?: number;
}
