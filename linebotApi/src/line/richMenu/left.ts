import type { RichMenu } from '@line/bot-sdk';

export const leftMenu: RichMenu = {
  size: {
    width: 2500,
    height: 1686,
  },
  selected: false,
  name: 'Irukara-left-rich-menu',
  chatBarText: 'Irukaraメニュー',
  areas: [
    // chat
    {
      bounds: {
        x: 39,
        y: 325,
        width: 750,
        height: 800,
      },
      action: {
        type: 'postback',
        displayText: 'chat-mode',
        data: 'mode=0',
      },
    },
    // illustration
    {
      bounds: {
        x: 875,
        y: 325,
        width: 750,
        height: 800,
      },
      action: {
        type: 'postback',
        displayText: 'illustration-mode',
        data: 'mode=1',
      },
    },
    // real
    {
      bounds: {
        x: 1710,
        y: 325,
        width: 750,
        height: 800,
      },
      action: {
        type: 'postback',
        displayText: 'real-mode',
        data: 'mode=2',
      },
    },
    // irukara.net
    {
      bounds: {
        x: 0,
        y: 1206,
        width: 2500,
        height: 480,
      },
      action: {
        type: 'uri',
        label: 'irukara.net',
        uri: process.env.LIFF_URL,
      },
    },
    // tab(right)
    {
      bounds: {
        x: 1290,
        y: 17,
        width: 1170,
        height: 227,
      },
      action: {
        type: 'richmenuswitch',
        richMenuAliasId: 'alias-right',
        data: 'richmenu-changed-to-right',
      },
    },
  ],
};
