import { QuickReplyItem } from '@line/bot-sdk';

export const fixedQuickReply: QuickReplyItem[] = [
  {
    type: 'action',
    action: {
      type: 'message',
      label: '使い方を教えて',
      text: '使い方を教えて',
    },
  },
  {
    type: 'action',
    action: {
      type: 'message',
      label: 'Irukaraは何ができるの？',
      text: 'Irukaraは何ができるの？',
    },
  },
  {
    type: 'action',
    action: {
      type: 'message',
      label: 'Irukaraは無料なの？',
      text: 'Irukaraは無料なの？',
    },
  },
];

// テキスト配列からmessageのクイックリプライを生成する
export function createQuickReply(messages): QuickReplyItem[] {
  console.log('引数', messages);
  const replies = [];
  messages.forEach((item: string) => {
    replies.push({
      type: 'action',
      action: {
        type: 'message',
        label: item,
        text: item,
      },
    });
  });

  console.log('クイックリプライ', replies);
  return replies;
}
