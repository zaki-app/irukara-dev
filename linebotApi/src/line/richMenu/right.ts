import type { RichMenu } from '@line/bot-sdk';

export const rightMenu: RichMenu = {
  size: {
    width: 2500,
    height: 1686,
  },
  selected: false,
  name: 'Irukara right Rich Menu',
  chatBarText: 'Irukaraメニュー',
  areas: [
    // 利用規約
    {
      bounds: {
        x: 39,
        y: 325,
        width: 750,
        height: 800,
      },
      action: {
        type: 'message',
        label: 'terms of service',
        text: '利用規約について確認する',
      },
    },
    // プライバシーポリシー
    {
      bounds: {
        x: 875,
        y: 325,
        width: 750,
        height: 800,
      },
      action: {
        type: 'message',
        label: 'privacy policy',
        text: 'プライバシーポリシーについて確認する',
      },
    },
    // お問合せ
    {
      bounds: {
        x: 1710,
        y: 325,
        width: 750,
        height: 800,
      },
      action: {
        type: 'message',
        label: 'contact',
        text: 'お問合せについて確認する',
      },
    },
    // irukara.net
    {
      bounds: {
        x: 1290,
        y: 17,
        width: 1170,
        height: 227,
      },
      action: {
        type: 'uri',
        label: 'irukara.net',
        uri: process.env.LIFF_URL,
      },
    },
    // tab(left)
    {
      bounds: {
        x: 40,
        y: 17,
        width: 1170,
        height: 227,
      },
      action: {
        type: 'richmenuswitch',
        richMenuAliasId: 'alias-left',
        data: 'richmenu-changed-to-left',
      },
    },
  ],
};
