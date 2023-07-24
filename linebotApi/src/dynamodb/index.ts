/* users・messsages・imagesテーブルに対しての処理をまとめる */
import { getPastMessage } from 'src/dynamodb/message/getPastMessage';
import { saveMessage } from 'src/dynamodb/message/saveMessage';
import { updateMessage } from 'src/dynamodb/message/updateSaveMessage';

import { isUpdateMode } from 'src/dynamodb/user/updateMode';
import { updateCount } from 'src/dynamodb/user/updateCount';
import { updateSave } from 'src/dynamodb/user/updateSave';
import {
  registerUser,
  isRegisterUser,
  updateUserInfo,
} from 'src/dynamodb/user/userRegister';

export {
  // messages
  getPastMessage,
  saveMessage,
  updateMessage,

  // users
  updateCount,
  updateSave,
  registerUser,
  isRegisterUser,
  updateUserInfo,
  isUpdateMode,
};
