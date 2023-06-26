import { Body, Controller, Post, Logger, Headers } from '@nestjs/common';
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
import { LineBotReqEventDto } from './dto/linebot-req-event.dto';
import LineRichMenu from 'src/line/richMenu';
import LineInspection from 'src/common/lineInspection';
import { isUpperLimit } from 'src/dynamodb/upperLimit';
import {
  isRegisterUser,
  registerUser,
  updateUserInfo,
} from 'src/dynamodb/userRegister';
import {
  userStatus,
  userMessageLimit,
  toUpperLimitMessage,
  toUpperLimitSaved,
  userSavedLimit,
} from 'src/common/userStatus';
import { todaySave } from 'src/dynamodb/messageSave';
import { jpDayjs } from 'src/common/timeFormat';
import { PostbackType, UserInfo } from 'src/dynamodb/types';
import { createUserIdHash } from 'src/common/createHash';

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
    console.log('シグネチャ', isSignature);
    if (!isSignature) {
      console.error('不正なアクセス', isSignature);
      throw new Error('invalid signature');
    }

    // リッチメニューを適用
    await new LineRichMenu().createRichMenu();

    try {
      const events: any = req.events;

      const results: MessageAPIResponseBase[] = events.map(
        async (event: LineBotReqEventDto): Promise<MessageAPIResponseBase> => {
          this.logger.log('event...', event);

          // userId(hash化)が存在するか確認
          const hashUserId = createUserIdHash(event.source.userId);
          const isRegister: UserInfo = await isRegisterUser(hashUserId);

          // 登録がなかったら登録処理
          if (!isRegister) await registerUser(hashUserId);

          /**
           * postback以外の処理
           */
          if (event.type !== 'postback') {
            // 0::00になったらメッセージ上限のリセット
            const params = { todayCount: 0, todaySave: 0 };
            // const isLimit = await isUpperLimit(event.source.userId, params);
            const isLimit = await isUpperLimit(hashUserId, params);
            console.log('message isLimit', isLimit);
            if (
              (isLimit.status === userStatus.free ||
                isLimit.status === userStatus.billingToFree) &&
              isLimit.todayCount >= userMessageLimit.free
            ) {
              console.log(
                `こちらのユーザー(${event.source.userId})はメッセージ上限に到達しました`,
              );
              return lineBotClient().replyMessage(event.replyToken, {
                type: 'text',
                text: toUpperLimitMessage.text,
                // quickReply: {
                //   items: sorryQuickReply,
                // },
              });
            }
          }

          /**
           * 基本的にpostback(保存するしないボタンクリック時)の処理
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
                const params = { todaySave: 0, totalSave: 0 };
                const isLimit = await isUpperLimit(
                  postbackParse.userId,
                  params,
                );
                console.log('saved count isLimit', isLimit);

                if (
                  (isLimit.status === userStatus.free ||
                    isLimit.status === userStatus.billingToFree) &&
                  isLimit.todaySave >= userSavedLimit.free
                ) {
                  console.log(
                    `こちらのユーザー(${postbackParse.userId})は保存回数上限に到達しました`,
                  );
                  return lineBotClient().replyMessage(event.replyToken, {
                    type: 'text',
                    text: toUpperLimitSaved.text,
                    // quickReply: {
                    //   items: sorryQuickReply,
                    // },
                  });
                }
                // referenceTypeの更新処理へ
                const updatedReferenceType =
                  await new ProcessingInDynamo().updateMessage(postbackParse);
                const updateResultParse = JSON.parse(updatedReferenceType);
                // メッセージの保存回数を更新
                // await todaySave(updateResultParse.data.userId);
                await todaySave(hashUserId);
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
          // ユーザーテーブルの最終ログインを更新する
          // await updateUserInfo(event.source.userId, {
          //   lastLogin: jpDayjs().unix(),
          // });
          await updateUserInfo(hashUserId, {
            lastLogin: jpDayjs().unix(),
          });

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
      console.log('最後のレスポンス', response);

      console.timeEnd('test');
      return response;
    } catch (err) {
      console.error(err);
      this.logger.error(`LineBotエラー: ${err}`);
      return err;
    }
  }
}
