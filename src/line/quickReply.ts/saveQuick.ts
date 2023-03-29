/* eslint-disable prettier/prettier */
import { QuickReplyItem } from '@line/bot-sdk';

export const saveQuick = (event: any): QuickReplyItem[] => {
  return [
    {
      type: 'action',
      action: {
        type: 'postback',
        label: '参考になったで保存',
        text: '参考になったで保存',
        data: `{
          "userId": ${event.source.userId},
          "data": ${event.message.text},
          "reference": "true"
        }`,
      },
    },
    {
      type: 'action',
      action: {
        type: 'postback',
        label: '参考にならなかったで保存',
        text: '参考にならなかったで保存',
        data: `{
          "userId": ${event.source.userId},
          "data": ${event.message.text},
          "reference": "false"
        }`,
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
};
