import { Injectable } from '@nestjs/common';
import { Client, ClientConfig } from '@line/bot-sdk';
import { WebhookRequestBody, WebhookEvent } from '@line/bot-sdk';

@Injectable()
export class LinebotService {
  // linebot環境変数
  private token = process.env.CHANNEL_ACCESS_TOKEN;
  private secret = process.env.CHANNEL_SECRET;

  getLinebot(): string {
    return 'linebotのサービスからです';
  }

  // messaging API
  lineBotClient() {
    const config = {
      channelAccessToken: this.token || '',
      channelSecret: this.secret || '',
    };
    const client = new Client(config);

    return client;
  }

  sendResultMessage(request: WebhookRequestBody) {
    const events: WebhookEvent[] = request.events;

    events.forEach((event: WebhookEvent) => {
      if (event.type === 'message') {
        const returnMessage =
          event.message.type === 'text'
            ? event.message.text
            : 'テキストでないです';

        const client = this.lineBotClient();
        return client.replyMessage(event.replyToken, {
          type: 'text',
          text: returnMessage,
        });
      }
    });
  }
}
