import { TextMessage } from '@line/bot-sdk';
import { fixedQuickReply } from 'src/line/quickReply.ts/sorryQuickReply';

export function replyReferenceType(referenceType: number): TextMessage {
  const saveStatus =
    referenceType === 1 ? '保存しました😋' : '保存しませんでした🌀';

  // 保存状況を返却
  return {
    type: 'text',
    text: saveStatus,
    quickReply: {
      items: fixedQuickReply,
    },
  };
}
