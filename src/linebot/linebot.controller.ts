import { Body, Controller, Get, Post, Res, Logger } from '@nestjs/common';
import { LineBotService } from './linebot.service';
import { WebhookEvent, WebhookRequestBody } from '@line/bot-sdk';
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
      events.map(async (event) => {
        // これがないとメッセージが取得できない
        if (event.type !== 'message' || event.message.type !== 'text') {
          return null;
        }
        const question = event.message.text ?? '質問がありません';
        console.log('質問', question);
        console.log('.env見れるか？', process.env);

        // 質問からchatGPTの回答を得る
        const replyChatGPT = await this.lineBotService.chatGPTsAnswer(
          event.message.text,
        );
        console.log('平文で来てるか？', replyChatGPT);

        const results = this.lineBotService
          .createLineBotClient()
          .replyMessage(event.replyToken, {
            type: 'text',
            text: replyChatGPT,
          });
        this.logger.log(`レスポンス: ${results}`);
        return results;
      });
    } catch (err) {
      this.logger.error(`LineBotエラー: ${err}`);
      res.sendStatus(500);
    }
  }
}
