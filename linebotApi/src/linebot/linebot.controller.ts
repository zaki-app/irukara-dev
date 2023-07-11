import { Body, Controller, Post, Logger, Headers } from '@nestjs/common';
import { LineBotService } from './linebot.service';
import { fixedQuickReply } from 'src/line/quickReply.ts/sorryQuickReply';
import {
  fixedQuestions,
  fixedAnswer,
} from 'src/line/quickReply.ts/fixedQuestion';
import { lineBotClient } from 'src/line/replyMessage/lineBotClient';
import { sorryReply } from 'src/line/replyMessage/sorryReply';
import { saveQuick } from 'src/line/quickReply.ts/saveQuick';
import { LineBotReqEventDto } from './dto/linebot-req-event.dto';
import LineRichMenu from 'src/line/richMenu';
import {
  createUserIdHash,
  LineInspection,
  toUpperLimitMessage,
} from 'src/common';
import {
  isRegisterUser,
  registerUser,
  updateCount,
  updateMessage,
  saveMessage,
  isUserLimit,
} from 'src/dynamodb';

import type { UserInfo, PostbackType } from 'src/dynamodb/types';
import type {
  TextMessage,
  WebhookRequestBody,
  MessageAPIResponseBase,
} from '@line/bot-sdk';

@Controller('linebot')
export class LineBotController {
  constructor(
    private readonly lineBotService: LineBotService,
    private readonly logger: Logger,
  ) {}

  @Post('webhook')
  async requestLineBot(
    @Headers('x-line-signature') signature: string,
    @Body() req: WebhookRequestBody,
  ): Promise<any> {
    console.time('test');
    // 著名の検証
    const isSignature = new LineInspection().verifySignature(
      signature,
      JSON.stringify(req),
    );
    if (!isSignature) {
      console.error('不正なアクセス', isSignature);
      throw new Error('invalid signature');
    }

    // リッチメニューを適用
    await new LineRichMenu().createRichMenu();

    this.logger.log('処理スタート');
    try {
      const events: any = req.events;

      const results: MessageAPIResponseBase[] = events.map(
        async (event: LineBotReqEventDto): Promise<MessageAPIResponseBase> => {
          console.log('イベント', event);

          // hash化したuserIdがuserTableにない場合は登録する
          const hashUserId = createUserIdHash(event.source.userId);
          const isRegister: UserInfo = await isRegisterUser(hashUserId);
          if (!isRegister) await registerUser(hashUserId);

          /* postback 保存・保存しないボタン押下 */
          if (event.type === 'postback') {
            const postbackParse: PostbackType = JSON.parse(event.postback.data);
            console.log('postback', postbackParse);

            await updateMessage(postbackParse);

            const postbackMessage =
              postbackParse.referenceType === 1
                ? '保存しました😋'
                : '保存しませんでした🌀';
            const textMessage: TextMessage = {
              type: 'text',
              text: postbackMessage,
              quickReply: {
                items: fixedQuickReply,
              },
            };

            return lineBotClient().replyMessage(event.replyToken, textMessage);
          } else if (
            event.message.type === 'image' ||
            event.message.type === 'video' ||
            event.message.type === 'sticker' ||
            event.message.type === 'location'
          ) {
            /* スタンプ・画像・ビデオの時謝罪メッセージを返却 */
            console.log('ステッカー');
            const replySorry = sorryReply(event);
            return lineBotClient().replyMessage(event.replyToken, {
              type: 'text',
              text: replySorry,
              quickReply: {
                items: fixedQuickReply,
              },
            });
          } else {
            /* 固定の質問場合 */
            if (fixedQuestions.includes(event.message.text)) {
              const fixedA = fixedAnswer(event.message.text);
              const textMsg: TextMessage = {
                type: 'text',
                text: fixedA.text,
                quickReply: {
                  items: fixedQuickReply,
                },
              };
              return lineBotClient().replyMessage(event.replyToken, textMsg);
            } else if (typeof isRegister === 'string') {
              /* 通常の質問の場合 */
              const userInfo = JSON.parse(isRegister);
              const userLimit = await isUserLimit(userInfo);
              console.log('ユーザーはまだ遊べるか？', userLimit);
              if (!userLimit) {
                return lineBotClient().replyMessage(event.replyToken, {
                  type: 'text',
                  text: toUpperLimitMessage.text,
                  quickReply: {
                    items: fixedQuickReply,
                  },
                });
              } else if (event.message.type === 'text') {
                // TODO isUserLimitを使用しているところは最初に取得したデータを使い回したい
                /* postback以外の処理 通常の質問が来た時 */
                // 質問からchatGPTの回答を得る
                const replyText = await this.lineBotService.chatGPTsAnswer(
                  event.message.text,
                  hashUserId,
                );

                console.log('最新の質問の答え', replyText);

                // 回答をmessageテーブルに保存
                await saveMessage(event, replyText);
                // userテーブルのメッセージカウントを更新
                await updateCount(hashUserId);

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
              } else {
                // 何にも該当しなかった場合のメッセージを入れる
              }
            }
          }
        },
      );
      const response = await Promise.all(results);

      console.timeEnd('test');
      return response;
    } catch (err) {
      console.error(err);
      this.logger.error(`LineBotエラー: ${err}`);
      // エラーの時も何かメッセージを入れたい
      return err;
    } finally {
      this.logger.log('全ての処理が終了');
    }
  }
}
