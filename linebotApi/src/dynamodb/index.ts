/* users・messsages・imagesテーブルに対しての処理をまとめる */
import { getPastMessage } from 'src/dynamodb/message/getPastMessage';
import { saveMessage } from 'src/dynamodb/message/saveMessage';
import { updateMessage } from 'src/dynamodb/message/updateMessage';

import { isUpdateMode } from 'src/dynamodb/user/updateMode';
import { registerUser, isRegisterUser } from 'src/dynamodb/user/userRegister';
import { updateUser } from 'src/dynamodb/user/updateUser';

export {
  // messages
  getPastMessage,
  saveMessage,
  updateMessage,
  // images

  // users
  registerUser,
  isRegisterUser,
  isUpdateMode,
  updateUser,
};
