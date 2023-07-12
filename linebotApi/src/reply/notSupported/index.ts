import { TextMessage } from '@line/bot-sdk';
import { fixedQuickReply } from 'src/line/quickReply.ts/sorryQuickReply';
import { sorryReply } from 'src/line/replyMessage/sorryReply';

export function notSupported(event: any): TextMessage {
  const replySorry = sorryReply(event);
  return {
    type: 'text',
    text: replySorry,
    quickReply: {
      items: fixedQuickReply,
    },
  };
}
