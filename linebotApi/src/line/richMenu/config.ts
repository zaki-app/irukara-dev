import type { RichMenu } from '@line/bot-sdk';

export const richMenuConfig: RichMenu = {
  size: {
    width: 2500,
    height: 843,
  },
  selected: false,
  name: 'irukara-rich-menu',
  chatBarText: 'Irukala.net',
  areas: [
    {
      bounds: {
        x: 0,
        y: 0,
        width: 833,
        height: 843,
      },
      action: {
        type: 'uri',
        label: 'irukara',
        uri: process.env.LIFF_URL,
      },
    },
    {
      bounds: {
        x: 833,
        y: 0,
        width: 833,
        height: 843,
      },
      action: {
        type: 'uri',
        label: '使い方',
        uri: `${process.env.LIFF_URL}/usage`,
      },
    },
    {
      bounds: {
        x: 1667,
        y: 0,
        width: 833,
        height: 843,
      },
      action: {
        type: 'uri',
        label: 'お問い合わせ',
        uri: `${process.env.LIFF_URL}/contact`,
      },
    },
  ],
};
