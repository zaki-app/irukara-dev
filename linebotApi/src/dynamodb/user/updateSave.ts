import DynamoClient from 'src/dynamodb/client';
import { UserInfo } from 'src/dynamodb/types';
import { isRegisterUser } from 'src/dynamodb/user/userRegister';
import { marshall } from '@aws-sdk/util-dynamodb';
import { jpDayjs } from 'src/common/timeFormat';
import { TransactWriteItemsCommand } from '@aws-sdk/client-dynamodb';

/**
 * 今日の保存数、合計保存数を更新する
 * @param userId
 */
export const updateSave = async (userId: string) => {
  try {
    const client = DynamoClient();
    // ユーザー情報を取得する
    const userInfo: UserInfo = await isRegisterUser(userId);
    console.log('update userinfo', userInfo);

    // stringなら取得に成功している、falseなら失敗している
    if (typeof userInfo === 'string') {
      const userInfoParse = JSON.parse(userId);
      let todaySave: number, totalSave: number;
      if (userInfoParse.isRegister) {
        todaySave = parseInt(userInfoParse.data.todaySave) + 1;
        totalSave = parseInt(userInfoParse.data.totalSave) + 1;
        console.log('save count', todaySave, totalSave);
      }

      // 更新処理
      const params = {
        TransactItems: [
          {
            Update: {
              TableName: process.env.DYNAMODB_USER_TABLE_NAME,
              Key: marshall({
                userId: userId,
              }),
              UpdateExpression:
                'SET todaySave = :value1, totalSave = :value2, lastLogin = :value3, updatedAt = :value4',
              ExpressionAttributeValues: marshall({
                ':value1': todaySave,
                ':value2': totalSave,
                ':value3': jpDayjs().unix(),
                ':value4': jpDayjs().unix(),
              }),
            },
          },
        ],
      };

      const command = new TransactWriteItemsCommand(params);
      const response = await client.send(command);

      return response;
    }
  } catch (err) {
    console.log('updated save count error...', err);
  }
};
