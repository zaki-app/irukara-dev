import { Injectable } from '@nestjs/common';
import { Client, ClientConfig } from '@line/bot-sdk';
import { WebhookRequestBody, WebhookEvent } from '@line/bot-sdk';
import { Configuration, OpenAIApi } from 'openai';

// 型定義
type Question = {
  type: string;
  id: string;
  text?: string;
};
@Injectable()
export class LinebotService {
  // linebot環境変数
  private token = process.env.CHANNEL_ACCESS_TOKEN;
  private secret = process.env.CHANNEL_SECRET;
  private chatGpt = process.env.CHATGPT_API_KEYS;

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

  // chatgpt
  async answerChatGPT({ text }: Question) {
    console.log('質問', text);
    const config = new Configuration({
      apiKey: this.chatGpt || '',
    });
    const openAi = new OpenAIApi(config);

    const response = await openAi.createChatCompletion({
      model: process.env.CHATGPT_MODEL,
      messages: [{ role: 'user', content: text }],
    });

    const answer = response.data.choices[0].message.content;
    const answerReplace = answer.replace('\n\n', '');
    console.log(answerReplace);
    return answerReplace;
  }

  sendResultMessage(request: WebhookRequestBody) {
    const events: WebhookEvent[] = request.events;

    events.forEach(async (event: WebhookEvent) => {
      if (event.type === 'message') {
        // 質問からchatGPTの回答を得る
        const result = await this.answerChatGPT(event.message);

        const returnMessage =
          event.message.type === 'text' ? result : 'no question';
        // event.message.type === 'text' ? '調整中' : 'no question';

        const client = this.lineBotClient();

        return client.replyMessage(event.replyToken, {
          type: 'text',
          text: returnMessage,
        });
      }
    });
  }
}
