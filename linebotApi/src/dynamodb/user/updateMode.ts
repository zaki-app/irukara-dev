import { TransactWriteItemsCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { jpDayjs } from 'src/common';
import DynamoClient from 'src/dynamodb/client';

/* userテーブルのmodeを変更する */
export async function isUpdateMode(
  userId: string,
  imageMode: number,
): Promise<boolean> {
  let response: boolean;
  try {
    const params = {
      TransactItems: [
        {
          Update: {
            TableName: process.env.DYNAMODB_USER_TABLE_NAME,
            Key: marshall({ userId }),
            ConditionExpression: 'attribute_exists(userId)',
            UpdateExpression: 'SET #md = :value1, updatedAt = :value2',
            ExpressionAttributeNames: {
              '#md': 'mode',
            },
            ExpressionAttributeValues: marshall({
              ':value1': imageMode,
              ':value2': jpDayjs().unix(),
            }),
          },
        },
      ],
    };

    // messageテーブルのreferenceType更新
    const command = new TransactWriteItemsCommand(params);
    const updateData = await DynamoClient().send(command);

    if (updateData.$metadata.httpStatusCode === 200) {
      response = true;
    } else {
      response = false;
    }
  } catch (err) {
    console.log('モードチェンジエラー', err);
    response = false;
  }

  console.log('モードレスポンス', response);
  return response;
}
