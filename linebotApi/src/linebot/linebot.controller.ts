import { Body, Controller, Post, Logger, Headers } from '@nestjs/common';
import { LineBotService } from './linebot.service';
import { fixedQuickReply } from 'src/line/quickReply.ts/sorryQuickReply';
import { fixedQuestions } from 'src/line/quickReply.ts/fixedQuestion';
import { lineBotClient } from 'src/line/replyMessage/lineBotClient';
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
  updateMessage,
  isUserLimit,
} from 'src/dynamodb';
import { replyReferenceType } from 'src/reply/postback';
import { imageModeText } from 'src/imageGeneration/generationMode';
import { imageProcess } from 'src/imageGeneration/imageProcess';
import { notSupported } from 'src/reply/notSupported';
import { answer } from 'src/reply/answer';
import { fixed } from 'src/reply/fixed';
import { notTextMessage } from 'src/line/replyMessage/sorryReply';

import type { UserInfo, PostbackType } from 'src/dynamodb/types';
import type { WebhookRequestBody, MessageAPIResponseBase } from '@line/bot-sdk';

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
          console.log('登録状況', isRegister);

          // ユーザーのmodeを確認

          /* postback 保存・保存しないボタン押下 */
          if (event.type === 'postback') {
            const postbackParse: PostbackType = JSON.parse(event.postback.data);
            console.log('postback', postbackParse);

            await updateMessage(postbackParse);
            const textMessage = replyReferenceType(postbackParse.referenceType);

            return lineBotClient().replyMessage(event.replyToken, textMessage);
          } else if (notTextMessage.includes(event.message.type)) {
            /* スタンプ・画像・ビデオの時謝罪メッセージを返却 */
            const sorry = notSupported(event);
            return lineBotClient().replyMessage(event.replyToken, sorry);
          } else {
            /* 固定の質問場合 */
            if (fixedQuestions.includes(event.message.text)) {
              const textMessage = fixed(event.message.text);
              return lineBotClient().replyMessage(
                event.replyToken,
                textMessage,
              );
            } else if (imageModeText.includes(event.message.text)) {
              /* 画像生成モード */
              const reply = imageProcess();
              console.log('何が帰ってくる？', reply);
              return lineBotClient().replyMessage(event.replyToken, reply);
            } else {
              /* 通常の質問の場合 */
              // const userInfo = JSON.parse(isRegister);
              // const userLimit = await isUserLimit(userInfo);
              // console.log('ユーザーはまだ遊べるか？', userLimit);
              // TODO ファイルわけはリミットの実装終わってから
              // if (!userLimit) {
              //   return lineBotClient().replyMessage(event.replyToken, {
              //     type: 'text',
              //     text: toUpperLimitMessage.text,
              //     quickReply: {
              //       items: fixedQuickReply,
              //     },
              //   });
              // }
              if (event.message.type === 'text') {
                /* postback以外の処理 通常の質問が来た時 */
                // 質問からchatGPTの回答を得る
                const replyText = await this.lineBotService.chatGPTsAnswer(
                  event.message.text,
                  hashUserId,
                );

                const textMessage = await answer(hashUserId, event, replyText);

                return await lineBotClient().replyMessage(
                  event.replyToken,
                  textMessage,
                );
              } else {
                // 何にも該当しなかった場合のメッセージを入れる
                console.log('何もなかった');
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
