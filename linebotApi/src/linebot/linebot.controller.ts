import { Body, Controller, Post, Logger, Headers } from '@nestjs/common';
import { LineBotService } from './linebot.service';
import { sorryQuickReply } from 'src/line/quickReply.ts/sorryQuickReply';
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

          // 今日のメッセージ回数・保存回数から処理を進められるか判断
          if (typeof isRegister === 'string') {
            const userInfo = JSON.parse(isRegister);
            const userLimit = await isUserLimit(userInfo);
            console.log('ユーザーはまだ遊べるか？', userLimit);
            if (!userLimit) {
              return lineBotClient().replyMessage(event.replyToken, {
                type: 'text',
                text: toUpperLimitMessage.text,
                quickReply: {
                  items: sorryQuickReply,
                },
              });
            } else {
              // TODO isUserLimitを使用しているところは最初に取得したデータを使い回したい
              /* postback以外の処理 通常の質問が来た時 */
              if (event.type !== 'postback') {
              }

              /**
               * postback(保存する・しないボタンクリック時)の処理
               */
              if (event.type !== 'message' || event.message.type !== 'text') {
                if (event.type === 'postback') {
                  const postbackParse: PostbackType = JSON.parse(
                    event.postback.data,
                  );
                  console.log('postback', postbackParse);

                  // 保存するボタンクック時
                  if (postbackParse.referenceType === 1) {
                    // 0::00になったら保存上限のリセット
                    // const params = { todaySave: 0, totalSave: 0 };
                    // const isLimit = await isUpperLimit(
                    //   postbackParse.userId,
                    //   params,
                    // );
                    // const result = await updateSave(hashUserId);
                    // console.log('saved count isLimit', result);

                    // if (
                    //   (isLimit.status === userStatus.free ||
                    //     isLimit.status === userStatus.billingToFree) &&
                    //   isLimit.todaySave >= userSavedLimit.free
                    // ) {
                    //   console.log(
                    //     `こちらのユーザー(${postbackParse.userId})は保存回数上限に到達しました`,
                    //   );
                    //   return lineBotClient().replyMessage(event.replyToken, {
                    //     type: 'text',
                    //     text: toUpperLimitSaved.text,
                    //     // quickReply: {
                    //     //   items: sorryQuickReply,
                    //     // },
                    //   });
                    // }
                    // referenceType, 保存回数の更新
                    await updateMessage(postbackParse);
                  }
                  // referenceの値によって返信するメッセージを変更
                  const postbackMessage =
                    postbackParse.referenceType === 1
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
      return err;
    } finally {
      this.logger.log('全ての処理が終了');
    }
  }
}
