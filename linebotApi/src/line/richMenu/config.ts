import type { RichMenu } from '@line/bot-sdk';

export const richMenuConfig: RichMenu = {
  size: {
    width: 2500,
    height: 400,
  },
  selected: false,
  name: 'irukara-rich-menu',
  chatBarText: 'Irukala.com',
  areas: [
    {
      bounds: {
        x: 0,
        y: 0,
        width: 800,
        height: 400,
      },
      action: {
        type: 'uri',
        label: 'irukara',
        uri: 'https://staging.d2hjuf0oqfobak.amplifyapp.com/',
      },
    },
    {
      bounds: {
        x: 0,
        y: 843,
        width: 800,
        height: 400,
      },
      action: {
        type: 'uri',
        label: 'irukara',
        uri: 'https://staging.d2hjuf0oqfobak.amplifyapp.com/',
      },
    },
    {
      bounds: {
        x: 0,
        y: 843,
        width: 843,
        height: 400,
      },
      action: {
        type: 'uri',
        label: 'irukara',
        uri: 'https://staging.d2hjuf0oqfobak.amplifyapp.com/',
      },
    },
  ],
};
