import { TextMessage } from '@line/bot-sdk';
import { fixedAnswer } from 'src/line/quickReply/fixedQuestion';
import { fixedQuickReply } from 'src/line/quickReply/quickReply';

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
