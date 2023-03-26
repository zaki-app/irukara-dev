import { Client, TextMessage } from '@line/bot-sdk';

export const lineClient = (text: any) => {
  const token = process.env.CHANNEL_ACCESS_TOKEN ?? '';
  const secret = process.env.CHANNEL_SECRET ?? '';

  const client = new Client({
    channelAccessToken: token,
    channelSecret: secret,
  });

  const repliedMessage: TextMessage = {
    type: 'text',
    text: text,
  };
};
