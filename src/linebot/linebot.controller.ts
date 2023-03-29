import { Body, Controller, Get, Post, Res, Logger } from '@nestjs/common';
import { LineBotService } from './linebot.service';
import { WebhookRequestBody } from '@line/bot-sdk';
import { sorryQuickReply } from 'src/line/quickReply.ts/sorryQuickReply';
import {
  fixedQuestions,
  fixedAnswer,
} from 'src/line/quickReply.ts/fixedQuestion';
import { lineBotClient } from 'src/line/replyMessage/lineBotClient';
import { sorryReply } from 'src/line/replyMessage/sorryReply';
import { saveQuick } from 'src/line/quickReply.ts/saveQuick';
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
    console.log('リクエスト', req.events);
    try {
      console.log('tryに入った');
      const events: any = req.events;

      const results = events.map(async (event) => {
        if (event.type !== 'message' || event.message.type !== 'text') {
          // テキスト以外の時は謝罪のメッセージを送信する
          const replySorry = sorryReply(event);

          return lineBotClient().replyMessage(event.replyToken, {
            type: 'text',
            text: replySorry,
            quickReply: {
              items: sorryQuickReply,
            },
          });
        }

        // 固定の質問が来た時
        const fixedQ = fixedQuestions;
        if (fixedQ.includes(event.message.text)) {
          const fixedA = fixedAnswer(event.message.text);
          const saveBtn = saveQuick(event);
          return lineBotClient().replyMessage(event.replyToken, {
            type: 'text',
            text: fixedA.text,
            quickReply: {
              items: saveBtn ? saveBtn : [],
            },
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

        const results = lineBotClient().replyMessage(event.replyToken, {
          type: 'text',
          text: replyText,
        });

        this.logger.log(`レスポンス: ${results}`);
      });
      return await Promise.all(results);
    } catch (err) {
      this.logger.error(`LineBotエラー: ${err}`);
      return err;
    }
  }
}
