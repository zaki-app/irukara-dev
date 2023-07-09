import { createUserIdHash, jpDayjs } from 'src/common';
import { TransactWriteItemsCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { updateCount } from 'src/dynamodb';
import DynamoClient from 'src/dynamodb/client';

import type { SaveAnswerType } from '../types';

/**
 * 質問と回答を保存する
 * @param event
 * @param replayText
 * @returns
 */
export async function saveMessage(
  event: any,
  replayText: string,
): Promise<any> {
  try {
    // 保存する項目(ユーザーIDはハッシュ化する)
    const hashUserId = createUserIdHash(event.source.userId);
    const params: SaveAnswerType = {
      messageId: event.replyToken,
      userId: hashUserId,
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

    // ユーザーの送信カウントを1増加させる
    const userCount = await updateCount(event.source.userId);
    console.log('ユーザーカウント', userCount);

    const answerResponse = JSON.stringify({
      statusCode: 200,
      body: {
        data: params,
      },
    });
    return answerResponse;
  } catch (err) {
    return JSON.stringify({
      statusCode: 500,
      message: err.message,
      stack: err.stack,
    });
  }
}
