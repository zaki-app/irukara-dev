import { TransactWriteItemsCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { UpdateImagesTable } from 'src/types/image';
import DynamoClient from '../client';

export async function updateImagesTable(
  imageId: string,
  updateParams: UpdateImagesTable,
) {
  console.log('イメージアップデート引数', imageId, updateParams);
  let response;
  try {
    const client = DynamoClient();
    const objKeys = Object.keys(updateParams);

    const params = {
      TransactItems: [
        {
          Update: {
            TableName: process.env.DYNAMODB_IMAGE_TABLE_NAME,
            Key: marshall({
              imageId,
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

    response = JSON.stringify({
      statusCode: 200,
      data: updateParams,
    });
  } catch (err) {
    console.error('画像テーブル更新エラー', err);
    response = JSON.stringify({
      message: 'dynamodb以外でエラー',
      errorMsg: err.message,
      errorStack: err.errorStack,
    });
  }

  console.log('imagesTable update result...', response);
  return response;
}
