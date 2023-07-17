import { TextMessage } from '@line/bot-sdk';
import { isUpdateMode } from 'src/dynamodb';
import { imageModeReply, inputReply } from './generationMode';

export async function imageProcess(userId: string) {
  console.log('画像生成モードに入ります');

  // userテーブルのmodeを更新
  await isUpdateMode(userId, 1);

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
