import { QuickReplyItem } from '@line/bot-sdk';

export const sorryQuickReply: QuickReplyItem[] = [
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
  // {
  //   type: 'action',
  //   action: {
  //     type: 'postback',
  //     label: 'no',
  //     data: '{"action":"no"}',
  //   },
  // },
];
