/* エラー関係のリプライをまとめる */

import type { TextMessage } from '@line/bot-sdk';

export const imageSaveError = (props?: any): TextMessage => ({
  type: 'text',
  text: '画像が正常に保存・生成できませんでした。\n申し訳ないのですが、再度行っていただくか時間をおいてお試しをお願いします🙇‍♂️🙇‍♀️',
  quickReply: {
    items: [
      {
        type: 'action',
        action: {
          type: 'message',
          label: '前回と同じ呪文で生成する',
          text: props
            ? props
            : '前回の呪文が取得できませんでした\n別の呪文を入力してください',
        },
      },
      {
        type: 'action',
        action: {
          type: 'message',
          label: '別の呪文で生成してみる',
          text: '別の呪文で生成してみる',
        },
      },
      {
        type: 'action',
        action: {
          type: 'message',
          label: '使い方を教えて',
          text: '使い方を教えて',
        },
      },
    ],
  },
});
