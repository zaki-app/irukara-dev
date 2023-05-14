import DynamoClient from 'src/dynamodb/client';
import { isRegisterUser } from 'src/dynamodb/userRegister';
import { marshall } from '@aws-sdk/util-dynamodb';
import dayjs from 'dayjs';
import { TransactWriteItemsCommand } from '@aws-sdk/client-dynamodb';
import { UserInfo } from 'src/dynamodb/types';

/**
 * ユーザーの今日の送信回数、合計の送信回数をカウントする関数
 * @param userId
 * @returns
 */
export const todayCount = async (userId: string) => {
  try {
    const client = DynamoClient();
    // ユーザー情報を取得する
    const userInfo: UserInfo = await isRegisterUser(userId);

    // ユーザーが存在する場合は処理を続ける
    if (typeof userInfo === 'string') {
      const userInfoParse = JSON.parse(userInfo);
      let count: number, totalCount: number;
      if (userInfoParse.isRegister) {
        count = parseInt(userInfoParse.data.todayCount) + 1;
        totalCount = parseInt(userInfoParse.data.totalCount) + 1;
        console.log(count, totalCount);
      }

      // count, totalCountを更新する
      const params = {
        TransactItems: [
          {
            Update: {
              TableName: process.env.DYNAMODB_USER_TABLE_NAME,
              Key: marshall({
                userId: userId,
              }),
              UpdateExpression:
                'SET todayCount = :value1, totalCount = :value2, updatedAt = :value3',
              ExpressionAttributeValues: marshall({
                ':value1': count,
                ':value2': totalCount,
                ':value3': dayjs().unix(),
              }),
            },
          },
        ],
      };

      const command = new TransactWriteItemsCommand(params);
      const response = await client.send(command);
      console.log('レスポンス', response);

      return response;
    }
  } catch (err) {
    console.log('updated error...', err);
  }
};

// 今日のカウント数を取得する
