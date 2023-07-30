/* 送信・生成上限超過時の返信メッセージ */

import { TextMessage } from '@line/bot-sdk';
import { createQuickReply } from 'src/line/quickReply/quickReply';

export function replyUpperLimit(
  status: number,
  messageLimit: boolean,
  imageLimit: boolean,
): TextMessage {
  let textMessage: string;
  let limitCount: string;
  let planName: string;

  const changePlan = (planName: string) =>
    `もっとご利用いただける場合は${planName}へのお乗り換えをご検討いただけると嬉しいです！\n`;

  const limitOpening = '上限の開放は1週間の間隔になります。';

  switch (status) {
    case 0:
      limitCount =
        '現在は無料プランです。7日間の間にメッセージを10回送信・保存、\n画像生成は10回送信・保存できます\n👍';
      planName = 'イルカモ(420円)・イルカラプラン(980円)・イルカラVIP(3000円)';
      break;
    case 1:
      limitCount =
        '現在はお試し期間中です。\n登録日から7日間はメッセージを40回送信・保存\n画像生成は25回生成・保存できますが、お試し期間をすぎると1週間にメッセージを10回送信・保存、\n画像生成は10回送信・保存に変わります！';
      planName = 'イルカモ(420円)・イルカラプラン(980円)・イルカラVIP(3000円)';
      break;
    case 2:
      limitCount =
        '現在はイルカモプランです。\n7日間の間にメッセージを40回送信・保存、\n画像生成は25回送信・保存できます\n👍';
      planName = 'イルカラプラン(980円)・イルカラVIP(3000円)';
      break;
    case 3:
      limitCount =
        '現在はイルカラプランです。\n7日間の間にメッセージを100回送信・保存、\n画像生成は60回送信・保存できます\n👍';
      planName = 'イルカラVIP(3000円)';
  }

  // 両方超過している時
  if (!messageLimit && !imageLimit) {
    console.log('両方超過', messageLimit, imageLimit);
    const exceedBoth =
      'チャットメッセージ・画像生成共に1週間分の上限を超えました🙇‍♂️🙇‍♀️\n';

    textMessage = `${exceedBoth}${limitCount}${changePlan(
      planName,
    )}${limitOpening}`;
  } else {
    console.log('片方超過', messageLimit, imageLimit);
    // それぞれの超過時
    const msgExcess = 'チャットメッセージの1週間分の上限を超えました🙇‍♂️🙇‍♀️\n';
    const imgExcess = '画像生成の1週間分の上限を超えました🙇‍♂️🙇‍♀️\n';
    switch (status) {
      case 0:
        if (!messageLimit) {
          textMessage = `${msgExcess}${limitCount}${changePlan(
            planName,
          )}${limitOpening}`;
        }
        if (!imageLimit) {
          textMessage = `${imgExcess}${limitCount}${changePlan(
            planName,
          )}${limitOpening}`;
        }
      case 1:
        if (!messageLimit) {
          textMessage = `${msgExcess}${limitCount}${changePlan(
            planName,
          )}${limitOpening}`;
        }
        if (!imageLimit) {
          textMessage = `${imgExcess}${limitCount}${changePlan(
            planName,
          )}${limitOpening}`;
        }
      case 2:
        if (!messageLimit) {
          textMessage = `${msgExcess}${limitCount}${changePlan(
            planName,
          )}${limitOpening}`;
        }
        if (!imageLimit) {
          textMessage = `${imgExcess}${limitCount}${changePlan(
            planName,
          )}${limitOpening}`;
        }
      case 3:
        if (!messageLimit) {
          textMessage = `${msgExcess}${limitCount}${changePlan(
            planName,
          )}${limitOpening}`;
        }
        if (!imageLimit) {
          textMessage = `${imgExcess}${limitCount}${changePlan(
            planName,
          )}${limitOpening}`;
        }
    }
  }

  const quickItem = createQuickReply([
    '使い方を教えて',
    'Irukaraは何ができるの？',
    'Irukaraは無料なの？',
  ]);

  return {
    type: 'text',
    text: textMessage,
    quickReply: {
      items: quickItem,
    },
  };
}
