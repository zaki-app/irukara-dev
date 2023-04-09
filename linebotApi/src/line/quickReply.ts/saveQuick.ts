/* eslint-disable prettier/prettier */
import { QuickReplyItem } from '@line/bot-sdk';

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
  console.log('回答を送れるか？', event, text);

  const params: QuickReplyItem[] = [
    /**
     * TODO 今後、参考になったならなかったボタンを設置するのでreferenceは残す
     */
    {
      type: 'action',
      action: {
        type: 'postback',
        label: '保存する',
        // dataは最大300文字の制限あり
        data: JSON.stringify({
          // 保存は1なのでreferenceTypeを1にして送る
          replyToken: event.replyToken,
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
          replyToken: event.replyToken,
          referenceType: 3,
          createdAt: event.timestamp,
        }),
      },
    },
  ];

  return await Promise.all(params);
};
