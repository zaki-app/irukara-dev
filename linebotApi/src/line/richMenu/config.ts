import type { RichMenu } from '@line/bot-sdk';

export const richMenuConfig: RichMenu = {
  size: {
    width: 2500,
    height: 1686,
  },
  selected: true,
  name: 'irukara-rich-menu',
  chatBarText: 'ここがチャットバーです',
  areas: [
    {
      bounds: {
        x: 0,
        y: 0,
        width: 2500,
        height: 1686,
      },
      action: {
        type: 'postback',
        data: 'action=datadata',
      },
    },
  ],
};
