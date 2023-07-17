// dynamodb関係で使用する型定義

// user情報
export interface UserInfoType {
  userId: string;
  mode: number;
  status: number;
  todayCount?: number;
  totalCount?: number;
  todaySave?: number;
  totalSave?: number;
  lastLogin?: number;
  createdAt: number;
  updatedAt?: number;
  deletedAt?: number;
}

// user存在確認
export interface RegisterUserData {
  data: UserInfoType;
  isRegister: boolean;
}

// メッセージテーブル保存
export interface SaveAnswerType {
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

// isRegisterUserの返り値
export type UserInfo = string | boolean;

// ユーザーテーブル更新のparams
export interface UpdateUserTable {
  mode: number;
  status: number;
  todayCount?: number;
  totalCount?: number;
  todaySave?: number;
  totalSave?: number;
  lastLogin?: number;
  createdAt: number;
  updatedAt?: number;
  deletedAt?: number;
}

// referenceType更新(postback)
export interface ReferenceTypeProps {
  userId?: string;
  messageId: string;
  referenceType: number;
  createdAt: number;
}

// モード選択時(postback)
export interface ModeSelectTypeProps {
  mode: number;
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
