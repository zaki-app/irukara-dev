import { TransactWriteItemsCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import DynamoClient from 'src/dynamodb/client';
import { ImageSaveProps } from 'src/dynamodb/imageGenaration/types';
import { SaveImageType } from 'src/dynamodb/imageGenaration/types';

/**
 * イメージテーブルに保存
 * @param props ImageSaveProps
 * @returns boolean
 */
export async function isImageSave(props: ImageSaveProps): Promise<boolean> {
  console.log('イメージプロップス', props);
  let response;
  try {
    const params: SaveImageType = {
      imageId: props.imageId,
      userId: props.hashUserId,
      shareStatus: 0,
      prompt: props.prompt,
      imageUrl: props.imageUrl,
      referenceType: 0,
      good: 0,
      mode: props.mode,
      memberStatus: 0,
      createdAt: props.createdAt,
    };

    // トランザクション
    const transactItem = {
      TransactItems: [
        {
          Put: {
            TableName: process.env.DYNAMODB_IMAGE_TABLE_NAME,
            Item: marshall(params || {}),
          },
        },
      ],
    };

    // イメージテーブルへ保存
    const transact = await DynamoClient().send(
      new TransactWriteItemsCommand(transactItem),
    );
    console.log('イメージテーブル保存レスポンス', transact);

    response = true;
  } catch (err) {
    console.error('image save error...', err);
    response = false;
  }

  return response;
}
