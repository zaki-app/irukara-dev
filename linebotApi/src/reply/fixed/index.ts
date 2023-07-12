import { TextMessage } from '@line/bot-sdk';
import { fixedAnswer } from 'src/line/quickReply.ts/fixedQuestion';
import { fixedQuickReply } from 'src/line/quickReply.ts/sorryQuickReply';

export function fixed(text: string): TextMessage {
  const fixedA = fixedAnswer(text);
  return {
    type: 'text',
    text: fixedA.text,
    quickReply: {
      items: fixedQuickReply,
    },
  };
}
