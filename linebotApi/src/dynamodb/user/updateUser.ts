import { TransactWriteItemsCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import DynamoClient from '../client';
import type { UpdateUsersTable } from 'src/types/user';

/**
 * ユーザーテーブルを更新する
 * @params userid
 * @params UpdateUserTable
 */
export const updateUser = async (
  userId: string,
  updateParams: UpdateUsersTable,
) => {
  console.log('updateの値', userId, updateParams);
  try {
    const client = DynamoClient();
    const objKeys = Object.keys(updateParams);

    const params = {
      TransactItems: [
        {
          Update: {
            TableName: process.env.DYNAMODB_USER_TABLE_NAME,
            Key: marshall({
              userId: userId,
            }),
            UpdateExpression: `SET ${objKeys
              .map((_, index) => `#key${index} = :value${index}`)
              .join(', ')}`,
            ExpressionAttributeNames: objKeys.reduce(
              (acc, key, index) => ({
                ...acc,
                [`#key${index}`]: key,
              }),
              {},
            ),
            ExpressionAttributeValues: marshall(
              objKeys.reduce(
                (acc, key, index) => ({
                  ...acc,
                  [`:value${index}`]: updateParams[key],
                }),
                {},
              ),
            ),
          },
        },
      ],
    };

    const command = new TransactWriteItemsCommand(params);
    await client.send(command);

    const response = JSON.stringify({
      statusCode: 200,
      body: {
        data: updateParams,
        message: `${userId}の更新が成功しました`,
      },
    });

    console.log('update userTable success!', response);

    return response;
  } catch (err: any) {
    const response = JSON.stringify({
      statusCode: 500,
      body: {
        message: 'ユーザー情報の更新に失敗しました',
        errorMessage: err.message,
        errorStack: err.stack,
      },
    });

    console.log('update userTable Failed...', response);
    return response;
  }
};
