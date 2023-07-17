import { Client } from '@line/bot-sdk';

export const lineBotClient = () => {
  const config = {
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN ?? '',
    channelSecret: process.env.CHANNEL_SECRET ?? '',
  };

  return new Client(config);
};
