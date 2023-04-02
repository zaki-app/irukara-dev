import { Body, Controller, Get, Post, Res, Logger } from '@nestjs/common';
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
import { v4 as uuidv4 } from 'uuid';
import { nanoSecondFormat } from 'src/common/timeFormat';

@Controller('linebot')
export class LineBotController {
  constructor(
    private readonly lineBotService: LineBotService,
    private readonly logger: Logger,
  ) {}

  @Get()
  async getAccess() {
    console.log('環境変数', process.env);
    const datas = await new ProcessingInDynamo().getDatas();
    console.log('dynamodbのデータ', datas);
    console.log('uuid', uuidv4());
    console.log('ナノ秒', nanoSecondFormat());
    return 'GETリクエストに変更';
  }

  @Post('webhook')
  async requestLineBot(@Body() req: WebhookRequestBody) {
    // console.log('リクエスト', req);
    try {
      const events: any = req.events;

      const results = events.map(async (event) => {
        console.log('イベント', event);

        if (event.type !== 'message' || event.message.type !== 'text') {
          /**
           * postbackで来た時は保存処理に移る
           */
          if (event.type === 'postback') {
            console.log('postbackの処理', event.postback.data);
            // dynamodbへの保存処理へ
            const saveData = await new ProcessingInDynamo().createMessage(
              event,
            );
            console.log('渡ってきた保存データ', saveData);
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
        if (event.message.text.includes('保存')) {
          return;
        }
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

        console.log('回答', replyText);
        const quickItems = await saveQuick(event, replyText);
        // ここでクイックリプライが返ってこない
        console.log('クイックリプライ', quickItems);
        console.log('クイックリプライの次');

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

        // return await lineBotClient().replyMessage(event.replyToken, {
        //   type: 'text',
        //   text: replyText,
        //   quickReply: {
        //     items: quickItems,
        //   },
        // });
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
}
