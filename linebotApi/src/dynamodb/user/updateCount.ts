import DynamoClient from 'src/dynamodb/client';
import { isRegisterUser } from 'src/dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { TransactWriteItemsCommand } from '@aws-sdk/client-dynamodb';
import { jpDayjs } from 'src/common';
import type { UserInfo } from 'src/dynamodb/types';

/**
 * userのtotalCount, todayCountをプラス１
 * lastLogin, updatedAtを更新
 * @param userId
 * @returns
 */
export const updateCount = async (userId: string) => {
  try {
    const client = DynamoClient();
    // ユーザー情報を取得する
    const userInfo: UserInfo = await isRegisterUser(userId);
    console.log('現在のユーザー情報', userInfo);

    // ユーザーが存在する場合は処理を続ける
    if (typeof userInfo === 'string') {
      const userInfoParse = JSON.parse(userInfo);
      let todayCount: number, totalCount: number;
      if (userInfoParse.isRegister) {
        todayCount = parseInt(userInfoParse.data.todayCount) + 1;
        totalCount = parseInt(userInfoParse.data.totalCount) + 1;
        console.log('メッセージカウント', todayCount, totalCount);
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
                'SET todayCount = :value1, totalCount = :value2, lastLogin = :value3, updatedAt = :value4',
              ExpressionAttributeValues: marshall({
                ':value1': todayCount,
                ':value2': totalCount,
                ':value3': jpDayjs().unix(),
                ':value4': jpDayjs().unix(),
              }),
            },
          },
        ],
      };

      const command = new TransactWriteItemsCommand(params);
      await client.send(command);

      const response = JSON.stringify({
        statusCode: 200,
        body: {
          updateData: {
            todayCount: todayCount,
            totalCount: totalCount,
          },
        },
      });

      console.log('メッセージカウントレスポンス', JSON.parse(response));
      return response;
    }
  } catch (err) {
    return JSON.stringify({
      statusCode: 500,
      message: err.message,
      stack: err.stack,
    });
  }
};
