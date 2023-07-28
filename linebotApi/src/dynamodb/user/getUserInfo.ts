import { GetItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { UsersTable } from 'src/types/user';
import DynamoClient from '../client';

/**
 * userテーブルからユーザー情報を取得する
 * 0 chatgpt
 * 1 イラスト
 * 2 リアル
 * 9999 エラー
 * @params userId
 * return number
 */

export async function getUserInfo(
  userId: string,
): Promise<UsersTable | number> {
  let response: UsersTable | number;
  try {
    const params = {
      TableName: process.env.DYNAMODB_USER_TABLE_NAME,
      Key: marshall({ userId }),
    };

    const { Item } = await DynamoClient().send(new GetItemCommand(params));
    response = unmarshall(Item) as UsersTable;
  } catch (err) {
    console.log('モードが取得できませんでした', err);
    response = 9999;
  }

  return response;
}
