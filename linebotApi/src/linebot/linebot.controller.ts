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
} from 'src/common/userStatus';
import { todaySave } from 'src/dynamodb/messageSave';
import { jpDayjs } from 'src/common/timeFormat';
import { UserInfo } from 'src/dynamodb/types';

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

          // ユーザーが未登録なら登録する
          const isRegister: UserInfo = await isRegisterUser(
            event.source.userId,
          );
          console.log('ユーザー登録状況', isRegister);
          if (!isRegister) await registerUser(event.source.userId);

          // テキストの場合は今日のメッセージカウント上限に到達してないか確認
          if (event.type !== 'postback') {
            const isLimit = await isUpperLimit(event.source.userId);
            console.log('isLimit', isLimit);
            if (
              (isLimit.status === userStatus.free ||
                isLimit.status === userStatus.billingToFree) &&
              isLimit.todayCount >= userMessageLimit.free
            ) {
              console.log(
                `こちらのユーザー(${event.source.userId})は上限に到達しました`,
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
           * メッセージ保存時や、テキストメッセージ以外の処理
           */
          if (event.type !== 'message' || event.message.type !== 'text') {
            // referenceTypeの値によって保存か削除か分かれる
            if (event.type === 'postback') {
              console.log('postbackの処理', event.postback);
              // referenceTypeの更新処理へ
              const updatedReferenceType =
                await new ProcessingInDynamo().updateMessage(
                  event.postback.data,
                );
              const updateResultParse = JSON.parse(updatedReferenceType);
              // メッセージの保存回数を更新
              await todaySave(updateResultParse.data.userId);
              // referenceの値によって返信するメッセージを変更
              const postbackMessage =
                updateResultParse.data.referenceType === 1
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
          await updateUserInfo(event.source.userId, {
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
      this.logger.log('最後のレスポンス', response);

      console.timeEnd('test');
      return response;
    } catch (err) {
      console.error(err);
      this.logger.error(`LineBotエラー: ${err}`);
      return err;
    }
  }
}
