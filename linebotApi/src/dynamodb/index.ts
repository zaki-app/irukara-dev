/* userとmesssageテーブルに対しての処理をまとめる */
import { getPastMessage } from 'src/dynamodb/message/getPastMessage';
import { saveMessage } from 'src/dynamodb/message/saveMessage';
import { updateMessage } from 'src/dynamodb/message/updateSaveMessage';

import { getCurrentUserId } from 'src/dynamodb/user/getCurrentUserId';
import { updateCount } from 'src/dynamodb/user/updateCount';
import { updateSave } from 'src/dynamodb/user/updateSave';
import { isUpperLimit } from 'src/dynamodb/user/upperLimit';
import {
  registerUser,
  isRegisterUser,
  updateUserInfo,
} from 'src/dynamodb/user/userRegister';

export {
  getPastMessage,
  saveMessage,
  updateMessage,
  getCurrentUserId,
  updateCount,
  updateSave,
  isUpperLimit,
  registerUser,
  isRegisterUser,
  updateUserInfo,
};
