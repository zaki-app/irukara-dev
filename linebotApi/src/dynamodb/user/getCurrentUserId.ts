import { GetItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import DynamoClient from '../client';

/* 現在のユーザー情報を取得する */
export const getCurrentUserId = async (userId: string) => {
  const params = {
    TableName: process.env.DYNAMODB_USER_TABLE_NAME,
    Key: marshall({ userId }),
  };

  const { Item } = await DynamoClient().send(new GetItemCommand(params));
  console.log('アイテム', unmarshall(Item));
  return unmarshall(Item);
};
