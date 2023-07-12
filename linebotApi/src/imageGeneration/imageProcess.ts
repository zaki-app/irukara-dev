import { TextMessage } from '@line/bot-sdk';
import { imageModeReply, inputReply } from './generationMode';

export function imageProcess() {
  console.log('画像生成モードに入ります');

  const textMessage: TextMessage[] = [
    {
      type: 'text',
      text: imageModeReply,
    },
    {
      type: 'text',
      text: inputReply,
    },
  ];

  return textMessage;
}
