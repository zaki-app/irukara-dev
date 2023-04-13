import { Body, Controller, Get, Post, Logger, Put } from '@nestjs/common';
import { LineBotService } from './linebot.service';
import { TextMessage, WebhookRequestBody } from '@line/bot-sdk';
import { sorryQuickReply } from 'src/line/quickReply.ts/sorryQuickReply';
import {
  fixedQuestions,
  fixedAnswer,
} from 'src/line/quickReply.ts/fixedQuestion';
import { lineBotClient } from 'src/line/replyMessage/lineBotClient';
import { sorryReply } from 'src/line/replyMessage/sorryReply';
import { saveQuick } from 'src/line/quickReply.ts/saveQuick';
import { ProcessingInDynamo } from 'src/dynamodb';

@Controller('linebot')
export class LineBotController {
  constructor(
    private readonly lineBotService: LineBotService,
    private readonly logger: Logger,
  ) {}

  @Get()
  async getAccess() {
    return 'GETリクエストに変更';
  }

  @Post('webhook')
  async requestLineBot(@Body() req: WebhookRequestBody) {
    try {
      const events: any = req.events;

      const results = events.map(async (event) => {
        this.logger.log('event...', event);

        if (event.type !== 'message' || event.message.type !== 'text') {
          // referenceTypeの値によって保存か削除か分かれる
          if (event.type === 'postback') {
            console.log('postbackの処理', event.postback);
            // dynamodb更新処理へ
            const updateResult = await new ProcessingInDynamo().updateMessage(
              event.postback.data,
            );
            // referenceの値によって返信するメッセージを変更
            const postbackMessage =
              updateResult.body.referenceType === 1
                ? '保存しました😋'
                : '保存しませんでした🌀';
            const textMessage: TextMessage = {
              type: 'text',
              text: postbackMessage,
            };
            return lineBotClient().replyMessage(event.replyToken, textMessage);
          }

          /**
           * テキスト以外のメッセージの場合謝罪メッセージを返す
           */
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
        // ちょいとテスト
        const fixedQ = fixedQuestions;
        if (fixedQ.includes(event.message.text)) {
          const fixedA = fixedAnswer(event.message.text);
          console.log('固定のやつ', fixedA);
          const saveBtn = fixedA.id === 1 ? await saveQuick(event) : [];
          const textMsg: TextMessage = {
            type: 'text',
            text: fixedA.text,
          };
          if (saveBtn) textMsg['quickReply'] = { items: saveBtn };
          return lineBotClient().replyMessage(event.replyToken, textMsg);
        }

        // todo: 質問によって回答をchatGPTに回すかこっちでやるか判定したい
        // const question = event.message.text ?? '質問がありません';

        // 質問からchatGPTの回答を得る
        const replyText = await this.lineBotService.chatGPTsAnswer(
          event.message.text,
        );

        // 一度、回答をdynamodbに保存する
        await new ProcessingInDynamo().createMessage(event, replyText);

        const quickItems = await saveQuick(event, replyText);

        const textMessage: TextMessage = {
          type: 'text',
          text: replyText,
          quickReply: {
            items: quickItems,
          },
        };

        console.log('テキストメッセージ', textMessage);

        return await lineBotClient().replyMessage(
          event.replyToken,
          textMessage,
        );
      });
      const response = await Promise.all(results);
      this.logger.log('最後のレスポンス', response);
      return await Promise.all(response);
    } catch (err) {
      console.error(err);
      this.logger.error(`LineBotエラー: ${err}`);
      return err;
    }
  }

  @Put('webhook')
  async putData(@Body() req) {
    console.log('更新リクエスト', req);
    const result = await new ProcessingInDynamo().updateMessage(req);
    console.log('更新の結果', result);
    return result;
  }
}
