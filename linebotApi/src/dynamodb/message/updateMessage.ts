import { marshall } from '@aws-sdk/util-dynamodb';
import { TransactWriteItemsCommand } from '@aws-sdk/client-dynamodb';
import DynamoClient from 'src/dynamodb/client';

import type { UpdateUsersTable } from 'src/types/user';

/**
 * メッセージテーブルの更新
 * @params messageId
 * @params UpdateUsersTable
 * @returns
 */

export async function updateMessage(
  messageId: string,
  updateParams: UpdateUsersTable,
) {
  console.log('アップデートメッセージ', messageId, updateParams);
  let response;
  try {
    const client = DynamoClient();
    const objKeys = Object.keys(updateParams);

    const params = {
      TransactItems: [
        {
          Update: {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            Key: marshall({
              messageId,
            }),
            ConditionExpression: 'attribute_exists(messageId)',
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

    // TODO userテーブルの保存回数更新

    response = JSON.stringify({
      statusCode: 200,
      data: updateParams,
    });

    return response;
  } catch (err) {
    if (
      err.CancellationReasons &&
      err.CancellationReasons[0].Code === 'ConditionalCheckFailed'
    ) {
      response = JSON.stringify({
        message: 'messageIdがMessagesTabelに存在しません',
        errorMsg: err.message,
        errorStack: err.errorStack,
      });
    } else {
      response = JSON.stringify({
        message: 'dynamodb以外でエラー',
        errorMsg: err.message,
        errorStack: err.errorStack,
      });
    }
  }

  console.log('messagesTable update result...', response);
  return response;
}
