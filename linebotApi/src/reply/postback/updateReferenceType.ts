import { TextMessage } from '@line/bot-sdk';
import { updateMessage } from 'src/dynamodb';
import { ReferenceTypeProps } from 'src/dynamodb/types';
// import { fixedQuickReply } from 'src/line/quickReply.ts/quickReply';
import { fixedQuickReply } from 'src/line/quickReply/quickReply';

export async function updateReferenceType(
  props: ReferenceTypeProps,
): Promise<TextMessage> {
  const updateTypeText =
    props.referenceType === 1 ? '保存しました😋' : '保存しませんでした🌀';

  await updateMessage(props);

  return {
    type: 'text',
    text: updateTypeText,
    quickReply: {
      items: fixedQuickReply,
    },
  };
}
