/* usersTable */
export interface UsersTable {
  userId: string;
  mode: number;
  status: number;
  weekMsg: number;
  totalMsg: number;
  weekMsgSave: number;
  totalMsgSave: number;
  weekImg: number;
  totalImge: number;
  weekImgSave: number;
  totalImgSave: number;
  lastLogin?: number;
  createdAt: number;
  updatedAt?: number;
  deletedAt?: number;
}

// user存在確認
export interface RegisterUserData {
  data: UsersTable;
  isRegister: boolean;
}

// isRegisterUserの返り値
export type UserInfo = string | boolean;

// ユーザーテーブル更新のparams
export interface UpdateUsersTable {
  mode?: number;
  status?: number;
  weekMsg?: number;
  totalMsg?: number;
  weekMsgSave?: number;
  totalMsgSave?: number;
  weekImg?: number;
  totalImge?: number;
  weekImgSave?: number;
  totalImgSave?: number;
  lastLogin?: number;
  updatedAt?: number;
  deletedAt?: number;
}

// モード選択時(postback)
export interface ModeSelectTypeProps {
  mode: number;
}
