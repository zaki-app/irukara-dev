import { createUserIdHash, jpDayjs } from 'src/common';
import { TransactWriteItemsCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import DynamoClient from 'src/dynamodb/client';

import type { MessageTable } from 'src/types/message';
import { MessageCounts } from 'src/types/user';
import { updateUser } from '../user/updateUser';

/**
 * 質問と回答を保存する
 * @param event
 * @param replayText
 * @returns
 */
export async function saveMessage(
  event: any,
  replayText: string,
  messageCount: MessageCounts,
): Promise<any> {
  let response;
  try {
    // 保存する項目(ユーザーIDはハッシュ化する)
    const hashUserId = createUserIdHash(event.source.userId);
    const params: MessageTable = {
      messageId: event.replyToken,
      userId: hashUserId,
      mode: 0,
      shareStatus: 0,
      question: event.message.text,
      answer: replayText,
      referenceType: 0,
      memberStatus: 0,
      createdAt: jpDayjs().unix(),
    };

    console.log('メッセージ保存パラムス', params);
    const transactItem = {
      // トランザクション用のparams
      TransactItems: [
        {
          Put: {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            Item: marshall(params || {}),
          },
        },
      ],
    };

    // メッセージの保存
    await DynamoClient().send(new TransactWriteItemsCommand(transactItem));

    // ユーザーのメッセージカウントを更新
    const userMessageCount = await updateUser(hashUserId, messageCount);
    console.log('メッセージカウント', userMessageCount);

    response = JSON.stringify({
      statusCode: 200,
      body: {
        data: params,
      },
    });
  } catch (err) {
    console.log('message save error...', err);
    response = JSON.stringify({
      statusCode: 500,
      message: err.message,
      stack: err.stack,
    });
  }
  return response;
}
