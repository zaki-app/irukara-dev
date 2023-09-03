import { TextMessage } from '@line/bot-sdk';
import { isUpdateMode } from 'src/dynamodb';
import { createQuickReply } from 'src/line/quickReply/quickReply';

export async function updateMode(
  hashUserId: string,
  mode: number,
): Promise<TextMessage> {
  // 返信メッセージ
  let textMessage: string;
  let quickItem;
  if (mode === 0) {
    textMessage = 'チャットモードになりました';
    quickItem = createQuickReply([
      '使い方を教えて',
      'どんなことを手伝ってくれるの？',
      '今日のレシピの候補',
      '面白い話を教えて',
      '1分間スピーチのテンプレを教えて',
    ]);
  } else if (mode === 1) {
    textMessage =
      'イラストモードになりました。\n作りたい画像を入力してください';
    quickItem = createQuickReply([
      '草食系のイケメン男子',
      '肉食系のイケメンスーツ男子',
      '白シャツ姿のOL',
    ]);
  } else if (mode === 2) {
    textMessage = 'リアルモードになりました。\n作りたい画像を入力してください';
    quickItem = createQuickReply([
      '草食系のイケメン男子',
      '肉食系のイケメンスーツ男子',
      '白シャツ姿のOL',
    ]);
  }

  await isUpdateMode(hashUserId, mode);

  console.log('クイックアイテム', quickItem);
  return {
    type: 'text',
    text: textMessage,
    quickReply: {
      items: quickItem,
    },
  };
}
