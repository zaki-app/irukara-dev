import { QueryCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import DynamoClient from 'src/dynamodb/client';
import lodash from 'lodash';
import {
  ChatCompletionRequestMessage,
  ChatCompletionRequestMessageRoleEnum,
} from 'openai';

/**
 * 会話履歴を取得しrole, cntentオブジェクトの配列を返却する
 * @param userId
 * @returns
 */
export async function getPastMessage(userId: string) {
  const { Items } = await DynamoClient().send(
    new QueryCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME,
      IndexName: 'userIdIndex',
      KeyConditionExpression: '#userId = :userId',
      ExpressionAttributeNames: {
        '#userId': 'userId',
      },
      ExpressionAttributeValues: {
        ':userId': { S: userId },
      },
    }),
  );

  const items = Items.map((item) => unmarshall(item));
  const sortItems = lodash.orderBy(items, ['createdAt'], ['desc']);
  // 上位2件に絞り込み
  const limitItems = sortItems.slice(0, 2);
  const sortAsc = lodash.orderBy(limitItems, ['createdAt'], ['asc']);
  const history = sortAsc.flatMap((item) => [
    {
      role: ChatCompletionRequestMessageRoleEnum.User,
      content: item.question,
    },
    {
      role: ChatCompletionRequestMessageRoleEnum.Assistant,
      content: item.answer,
    },
  ]);
  console.log('会話履歴レスポンス', history);
  return history as ChatCompletionRequestMessage[];
}
