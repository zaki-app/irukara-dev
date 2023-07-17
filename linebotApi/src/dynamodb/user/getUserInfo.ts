import { GetItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import DynamoClient from '../client';

/**
 * userテーブルから現在のモードを取得する
 * 0 chatgpt
 * 1 イラスト
 * 2 リアル
 * 9999 エラー
 * @params userId
 * return ModeProps
 */
interface ModeProps {
  mode: number;
}

export async function getMode(userId: string): Promise<ModeProps> {
  let response: ModeProps;
  try {
    const params = {
      TableName: process.env.DYNAMODB_USER_TABLE_NAME,
      Key: marshall({ userId }),
    };

    const { Item } = await DynamoClient().send(new GetItemCommand(params));
    const item = unmarshall(Item);

    return {
      mode: item.mode,
    };
  } catch (err) {
    console.log('モードが取得できませんでした', err);
    response = {
      mode: 9999,
    };
  }

  return response;
}
