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
          messageId: uuidv4(),
          userId: event.source.userId,
          question: event.message.text,
          // answer: text,
          reference: 1,
          memberStatus: 0,
          createdAt: event.timestamp,
          updatedAt: 0,
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
