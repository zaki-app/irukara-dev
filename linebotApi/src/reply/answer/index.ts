import { TextMessage } from '@line/bot-sdk';
import { saveMessage, updateCount } from 'src/dynamodb';
import { saveQuick } from 'src/line/quickReply.ts/saveQuick';

export async function answer(
  hashUserId: string,
  event: any,
  replyText: string,
): Promise<TextMessage> {
  console.log('リプライテキスト', replyText);
  // 回答をmessageテーブルに保存
  await saveMessage(event, replyText);
  // userテーブルのメッセージカウントを更新
  await updateCount(hashUserId);

  const quickItems = await saveQuick(event, replyText);

  return {
    type: 'text',
    text: replyText,
    quickReply: {
      items: quickItems,
    },
  };
}
