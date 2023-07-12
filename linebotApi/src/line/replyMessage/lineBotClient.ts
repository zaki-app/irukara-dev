import { Client } from '@line/bot-sdk';

export const lineBotClient = () => {
  const tokens = {
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN ?? '',
    channelSecret: process.env.CHANNEL_SECRET ?? '',
  };

  return new Client(tokens);
};
