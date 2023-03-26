import { Body, Controller, Get, Post, Res, Logger } from '@nestjs/common';
import { LineBotService } from './linebot.service';
import { WebhookRequestBody } from '@line/bot-sdk';
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
  async requestLineBot(@Body() req: WebhookRequestBody) {
    console.log('リクエスト', req);
    try {
      console.log('tryに入った');
      const events: any = req.events;
      const results = events.map(async (event) => {
        // これがないとメッセージが取得できない
        if (event.type !== 'message' || event.message.type !== 'text') {
          // テキスト以外の時は謝罪のメッセージを送信する
          const replySorry = this.lineBotService.replySorry(event.message.type);
          return this.lineBotService
            .createLineBotClient()
            .replyMessage(event.replyToken, {
              type: 'text',
              text: replySorry,
            });
        }
        // todo: 質問によって回答をchatGPTに回すかこっちでやるか判定したい
        const question = event.message.text ?? '質問がありません';
        console.log('質問', question);

        // 質問からchatGPTの回答を得る
        const replyText = await this.lineBotService.chatGPTsAnswer(
          event.message.text,
        );
        console.log('平文で来てるか？', replyText);

        const results = this.lineBotService
          .createLineBotClient()
          .replyMessage(event.replyToken, {
            type: 'text',
            text: replyText,
          });
        this.logger.log(`レスポンス: ${results}`);
        // return results;
      });
      return await Promise.all(results);
    } catch (err) {
      this.logger.error(`LineBotエラー: ${err}`);
      return err;
    }
  }
}
