import { Body, Controller, Get, Post, Res, Logger } from '@nestjs/common';
import { LineBotService } from './linebot.service';
import {
  Client,
  TextMessage,
  WebhookEvent,
  WebhookRequestBody,
} from '@line/bot-sdk';
import { Configuration, OpenAIApi } from 'openai';
import { Response } from 'express';

@Controller('linebot')
export class LineBotController {
  constructor(
    private readonly lineBotService: LineBotService,
    private readonly logger: Logger,
  ) {}

  @Get()
  getAccess() {
    return 'GETリクエストに変更';
  }

  @Post('webhook')
  async requestLineBot(@Body() req: WebhookRequestBody, @Res() res: Response) {
    console.log('リクエスト', req);
    try {
      console.log('tryに入った');
      const events: WebhookEvent[] = req.events;
      events.map((event) => {
        // これがないとメッセージが取得できない
        if (event.type !== 'message' || event.message.type !== 'text') {
          return null;
        }
        const question = event.message.text ?? '質問がありません';
        console.log('質問', question);
        console.log('.env見れるか？', process.env);
        // console.log(
        //   'コントローラー側',
        //   this.lineBotService.createLineBotClient(),
        // );
        const results = this.lineBotService
          .createLineBotClient()
          .replyMessage(event.replyToken, {
            type: 'text',
            text: question,
          });
        this.logger.log(`レスポンス: ${results}`);
        // res.sendStatus(200).send(results);
        return results;
      });
    } catch (err) {
      this.logger.error(`LineBotエラー: ${err}`);
      res.sendStatus(500);
    }

    // // linebot
    // const lineBotClient = new Client({
    //   channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
    //   // channelSecret: process.env.CHANNEL_SECRET,
    // });

    // const events: WebhookEvent[] = req.events;
    // try {
    // const results = await Promise.all(
    //   events.map((event) => {
    //     // これがないとメッセージが取得できない
    //     if (event.type !== 'message' || event.message.type !== 'text') {
    //       return null;
    //     }
    //     const question = event.message.text ?? '質問がなかった';
    //     // if (question) {
    //     const replyMessage: TextMessage = {
    //       type: 'text',
    //       text: question,
    //     };
    //     // return [replayToken, replyMessage];
    //     return lineBotClient.replyMessage(event.replyToken, replyMessage);
    //     // }
    //   }),
    // );
    // console.log('結果', results);
    // return await Promise.all(results);
    // return lineBotClient.replyMessage(results[0], results[1]);
    // } catch (err) {
    //   console.error('エラーです', err);
    // }

    // chatgpt
    // const chatGPTConfig = new Configuration({
    //   apiKey: process.env.CHATGPT_API_KEYS,
    // });
    // const openAi = new OpenAIApi(chatGPTConfig);

    // // 質問からchatGPTの回答を得る
    // const events: WebhookEvent[] = req.events;

    // const response = await Promise.all(
    //   events.map(async (event) => {
    //     if (event.type !== 'message' || event.message.type !== 'text') {
    //       return null;
    //     }

    //     // try {
    //     const question = event.message.text;
    //     const setQuestion = await openAi.createChatCompletion({
    //       model: process.env.CHATGPT_MODEL,
    //       messages: [{ role: 'user', content: question }],
    //     });
    //     const answer = setQuestion.data.choices[0].message.content;
    //     console.log('回答です', answer);
    //     const replaceAnswer = answer.replace('\n\n', '');

    //     // lineBot用に変換して返信
    //     const replyText: TextMessage = {
    //       type: 'text',
    //       text: replaceAnswer,
    //     };

    //     console.log('テキストメッセージ', event.replyToken, replyText);
    //     const replyToken = event.replyToken;
    //     const results = await lineBotClient.replyMessage(replyToken, replyText);
    //     console.log('最終の結果', res.json(results));
    //     return res.json(results);
    // } catch (err) {
    //   console.error('最終的にエラーになりました', err);
    //   return err;
    // }
    //   }),
    // );
  }
}
