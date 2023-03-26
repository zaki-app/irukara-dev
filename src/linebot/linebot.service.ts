import { HttpStatus, Injectable, Req, Res } from '@nestjs/common';
import { Client, TextMessage } from '@line/bot-sdk';
import { WebhookRequestBody, WebhookEvent } from '@line/bot-sdk';
import { Configuration, OpenAIApi } from 'openai';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

// 型定義
type Question = {
  type: string;
  id: string;
  text?: string;
};
@Injectable()
export class LineBotService {
  // lineBotClient
  createLineBotClient() {
    const configService = new ConfigService();
    const tokens = {
      channelAccessToken: configService.get<string>('CHANNEL_ACCESS_TOKEN'),
      channelSecret: configService.get<string>('CHANNEL_SECRET'),
      // rou
      // channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
      // channelSecret: process.env.CHANNEL_SECRET,
    };
    console.log('トークンたち', tokens);
    return new Client(tokens);
  }

  // chatgpt
  // async answerChatGPT(event: any) {
  //   // lineBot
  //   const token = process.env.CHANNEL_ACCESS_TOKEN;
  //   const secret = process.env.CHANNEL_SECRET;
  //   const chatGpt = process.env.CHATGPT_API_KEYS;
  //   const lineBotClient = new Client({
  //     channelAccessToken: token || '',
  //     channelSecret: secret || '',
  //   });
  //   console.log(lineBotClient);
  //   console.log(secret);
  //   // question
  //   const question = event.message.text;
  //   console.log('質問', question);
  //   const config = new Configuration({
  //     apiKey: chatGpt || '',
  //   });
  //   const openAi = new OpenAIApi(config);
  //   const response = await openAi.createChatCompletion({
  //     model: process.env.CHATGPT_MODEL,
  //     messages: [{ role: 'user', content: question }],
  //   });
  //   const answer = response.data.choices[0].message.content;
  //   const answerReplace = answer.replace('\n\n', '');
  //   console.log('成形後の答え', answerReplace);
  //   // lineBot用に成形
  //   const lineBotResult: TextMessage = {
  //     type: 'text',
  //     text: answerReplace,
  //   };
  //   console.log('送り返す', lineBotResult);
  //   const result = await lineBotClient.replyMessage(
  //     event.replyToken,
  //     lineBotResult,
  //   );
  //   console.log('どうだ？', result);
  //   return lineBotClient.replyMessage(event.replyToken, lineBotResult);
  // }
  // async sendResultMessage(request) {
  //   try {
  //     console.log('リクエスト', request);
  //     const events: WebhookEvent[] = request.events;
  //     const result = await Promise.all(events.map(this.answerChatGPT));
  //     console.log('最終結果', result);
  //     return result;
  //   } catch (err) {
  //     console.error(err);
  //     return err;
  //   }
  // }
  // lineBot
  // chatGPT
}
