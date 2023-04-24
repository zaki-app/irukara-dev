import {
  Body,
  Controller,
  Get,
  Post,
  Logger,
  Put,
  Headers,
} from '@nestjs/common';
import { LineBotService } from './linebot.service';
import {
  TextMessage,
  WebhookRequestBody,
  MessageAPIResponseBase,
} from '@line/bot-sdk';
import { sorryQuickReply } from 'src/line/quickReply.ts/sorryQuickReply';
import {
  fixedQuestions,
  fixedAnswer,
} from 'src/line/quickReply.ts/fixedQuestion';
import { lineBotClient } from 'src/line/replyMessage/lineBotClient';
import { sorryReply } from 'src/line/replyMessage/sorryReply';
import { saveQuick } from 'src/line/quickReply.ts/saveQuick';
import { ProcessingInDynamo } from 'src/dynamodb';
import {
  LineBotReqEventDto,
  ReturnReplyMsgDto,
} from './dto/linebot-req-event.dto';
import LineRichMenu from 'src/line/richMenu';
import LineInspection from 'src/common/lineInspection';
// import * as fs from 'fs';
import * as fs from 'fs';

@Controller('linebot')
export class LineBotController {
  constructor(
    private readonly lineBotService: LineBotService,
    private readonly logger: Logger,
  ) {}

  @Get()
  async getAccess() {
    const image = fs.createReadStream('src/assets/richmenu-template.png');
    console.log('画像', image);
    return 'GETリクエストに変更';
  }

  @Post('webhook')
  async requestLineBot(
    @Headers('x-line-signature') signature: string,
    @Body() req: WebhookRequestBody,
  ): Promise<any> {
    // リクエスト
    // this.logger.log('event', req);
    // 著名の検証
    const isSignature = new LineInspection().verifySignature(
      signature,
      JSON.stringify(req),
    );
    if (!isSignature) {
      console.error('不正なアクセス', isSignature);
      throw new Error('invalid signature');
    }

    try {
      const events: any = req.events;

      // リッチメニューを適用
      const richMenu = await new LineRichMenu().createRichMenu();
      console.log('リッチメニュー', richMenu);

      const results: MessageAPIResponseBase[] = events.map(
        async (event: LineBotReqEventDto): Promise<MessageAPIResponseBase> => {
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
              return lineBotClient().replyMessage(
                event.replyToken,
                textMessage,
              );
            } else {
              /**
               * postback以外のメッセージの場合謝罪メッセージを返す
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
          }

          // 固定の質問が来た時
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

          return await lineBotClient().replyMessage(
            event.replyToken,
            textMessage,
          );
        },
      );
      const response = await Promise.all(results);
      this.logger.log('最後のレスポンス', response);
      return response;
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
