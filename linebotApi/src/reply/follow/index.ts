import type { QuickReplyItem, TextMessage } from '@line/bot-sdk';

// フォローしてくれた時のメッセージ
const followReply =
  'はじめまして！イルカラ(Irukara)です🐬\nフォローしていただきありがとうございます。\nイルカラはAIを使用してのご質問の回答。画像生成して保存ができる優れものです！\n保存したデータは\nhttps://Irukara.net で確認することができます。\n早速メッセージを送っていただくか、下に出てくるボタンを押したりしてみてください';

const followQuickReply: QuickReplyItem[] = [
  {
    type: 'action',
    action: {
      type: 'message',
      label: 'Irukaraに質問する',
      text: 'Irukaraに質問する',
    },
  },
  {
    type: 'action',
    action: {
      type: 'message',
      label: '画像生成してみる',
      text: '画像生成してみる',
    },
  },
  {
    type: 'action',
    action: {
      type: 'message',
      label: '使い方を教えて',
      text: '使い方を教えて',
    },
  },
  {
    type: 'action',
    action: {
      type: 'message',
      label: 'Irukaraは何ができるの？',
      text: 'Irukaraは何ができるの？',
    },
  },
  {
    type: 'action',
    action: {
      type: 'message',
      label: 'お問合せ',
      text: 'お問合せ',
    },
  },
];

export function follow(): TextMessage {
  return {
    type: 'text',
    text: followReply,
    quickReply: {
      items: followQuickReply,
    },
  };
}
