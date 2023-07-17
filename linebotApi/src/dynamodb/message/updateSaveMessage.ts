import { marshall } from '@aws-sdk/util-dynamodb';
import { jpDayjs } from 'src/common';
import { TransactWriteItemsCommand } from '@aws-sdk/client-dynamodb';
import { updateSave } from 'src/dynamodb';
import DynamoClient from 'src/dynamodb/client';

import type { ReferenceTypeProps } from 'src/dynamodb/types';

/**
 * 保存するボタンクリック後の更新処理
 * messageテーブルからreferenceType更新
 * userテーブルからtodaySave, totalSave更新
 * @param data
 * @returns
 */

export async function updateMessage(data: ReferenceTypeProps) {
  console.log('更新処理の時', data.messageId);
  try {
    const params = {
      TransactItems: [
        {
          Update: {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            Key: marshall({
              messageId: data.messageId,
            }),
            UpdateExpression:
              'SET referenceType = :value1, updatedAt = :value2',
            ExpressionAttributeValues: marshall({
              ':value1': data.referenceType,
              ':value2': jpDayjs().unix(),
            }),
          },
        },
      ],
    };

    // messageテーブルのreferenceType更新
    const command = new TransactWriteItemsCommand(params);
    await DynamoClient().send(command);

    // userテーブルの保存回数更新
    const updateSaveCount = await updateSave(data.userId);
    console.log('保存回数更新', updateSaveCount);

    const response = JSON.stringify({
      statusCode: 200,
      data: data,
    });

    return response;
  } catch (err) {
    const response = JSON.stringify({
      message: 'dynamodb以外でエラー',
      errorMsg: err.message,
      errorStack: err.errorStack,
    });

    return response;
  }
}
