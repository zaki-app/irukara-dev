/* eslint-disable prettier/prettier */
import { QuickReplyItem } from '@line/bot-sdk';
import { v4 as uuidv4 } from 'uuid';

type QuickReplyData = {
  userId: string;
  question: string;
  answer: string;
  createdAt: number;
};

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
          // 保存は1なのでreferenceを1にして送る
          reference: 1,
          replyToken: event.replyToken,
        }),
      },
    },
    {
      type: 'action',
      action: {
        type: 'message',
        label: '保存しない',
        text: '保存しない',
      },
    },
  ];

  return await Promise.all(params);
};
