/* userとmesssageテーブルに対しての処理をまとめる */
import { getPastMessage } from 'src/dynamodb/message/getPastMessage';
import { saveMessage } from 'src/dynamodb/message/saveMessage';
import { updateMessage } from 'src/dynamodb/message/updateSaveMessage';

import { updateCount } from 'src/dynamodb/user/updateCount';
import { updateSave } from 'src/dynamodb/user/updateSave';
import { isUpperLimit } from 'src/dynamodb/user/upperLimit';
import { isUserLimit } from './user/isUserLimit';
import {
  registerUser,
  isRegisterUser,
  updateUserInfo,
} from 'src/dynamodb/user/userRegister';

export {
  getPastMessage,
  saveMessage,
  updateMessage,
  updateCount,
  updateSave,
  isUpperLimit,
  isUserLimit,
  registerUser,
  isRegisterUser,
  updateUserInfo,
};
