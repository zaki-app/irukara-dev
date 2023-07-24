import { updateMessage } from 'src/dynamodb';
import { fixedQuickReply } from 'src/line/quickReply/quickReply';

import type { ReferenceTypeProps } from 'src/types/message';
import type { TextMessage } from '@line/bot-sdk';
import { updateImagesTable } from 'src/dynamodb/imageGenaration/updateImagesTable';
import { ImageReferenceTypeProps } from 'src/types/image';

export async function updateReferenceType(
  props: ReferenceTypeProps,
): Promise<TextMessage> {
  const updateTypeText =
    props.referenceType === 1 ? '保存しました😋' : '保存しませんでした🌀';

  if (props.mode === 0) {
    const updateParams = {
      referenceType: props.referenceType,
      updatedAt: props.updatedAt,
    };
    await updateMessage(props.messageId, updateParams);
  } else if (props.mode === 1 || props.mode === 2) {
    const imageProps = props as ImageReferenceTypeProps;
    console.log('画像生成のreferenceType更新ゾーンです', imageProps);
    const updateParams = {
      referenceType: imageProps.referenceType,
      updatedAt: imageProps.updatedAt,
    };
    await updateImagesTable(imageProps.imageId, updateParams);
  }

  return {
    type: 'text',
    text: updateTypeText,
    quickReply: {
      items: fixedQuickReply,
    },
  };
}
