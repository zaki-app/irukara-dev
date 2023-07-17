/* eslint-disable prettier/prettier */
import { QuickReplyItem } from '@line/bot-sdk';
import { createUserIdHash } from 'src/common';

/**
 * 回答返信後に表示する保存クイックリプライ
 * @param event
 * @param text
 * @returns
 */
export const saveQuick = async (
  event: any,
  text?: string,
): Promise<QuickReplyItem[]> => {
  // ユーザーIDはハッシュ化する
  const hashUserId = createUserIdHash(event.source.userId);
  const params: QuickReplyItem[] = [
    /**
     * TODO 今後、参考になったならなかったボタンを設置するのでreferenceは残す
     */
    // 保存は1, 保存しないは2に更新する, 何もしていないは0
    {
      type: 'action',
      action: {
        type: 'postback',
        label: '保存する',
        // dataは最大300文字の制限あり
        data: JSON.stringify({
          userId: hashUserId,
          messageId: event.replyToken,
          referenceType: 1,
          createdAt: event.timestamp,
        }),
      },
    },
    {
      type: 'action',
      action: {
        type: 'postback',
        label: '保存しない',
        data: JSON.stringify({
          userId: hashUserId,
          messageId: event.replyToken,
          referenceType: 2,
          createdAt: event.timestamp,
        }),
      },
    },
  ];

  return await Promise.all(params);
};
