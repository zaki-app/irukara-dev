import DynamoClient from 'src/dynamodb/client';
import { isRegisterUser } from 'src/dynamodb/userRegister';
import { marshall } from '@aws-sdk/util-dynamodb';
// import dayjs from 'dayjs';
import { TransactWriteItemsCommand } from '@aws-sdk/client-dynamodb';
import { UserInfo } from 'src/dynamodb/types';
import { jpDayjs } from 'src/common/timeFormat';
import { createUserIdHash } from 'src/common/createHash';

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
        console.log('メッセージカウント', count, totalCount);
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
                ':value3': jpDayjs().unix(),
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
            todayCount: count,
            totalCount: totalCount,
          },
        },
      });

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

// 今日のカウント数を取得する
