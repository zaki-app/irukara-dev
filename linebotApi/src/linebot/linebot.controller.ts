import { Body, Controller, Post, Logger, Headers } from '@nestjs/common';
import { LineBotService } from './linebot.service';
import { fixedQuestions } from 'src/line/quickReply.ts/fixedQuestion';
import { lineBotClient } from 'src/line/replyMessage/lineBotClient';
import { LineBotReqEventDto } from './dto/linebot-req-event.dto';
import { createUserIdHash, LineInspection } from 'src/common';
import {
  isRegisterUser,
  isUpdateMode,
  registerUser,
  updateMessage,
} from 'src/dynamodb';
import { imageModeText } from 'src/imageGeneration/generationMode';
import { imageProcess } from 'src/imageGeneration/imageProcess';
import { notTextMessage } from 'src/line/replyMessage/sorryReply';
import { replyReferenceType, notSupported, answer, fixed } from 'src/reply';

import type { UserInfo, PostbackType } from 'src/dynamodb/types';
import type { WebhookRequestBody, MessageAPIResponseBase } from '@line/bot-sdk';
import { getMode } from 'src/dynamodb/user/getUserInfo';
// import { richMenuTest } from 'src/line/richMenu/rich-menu';
import { follow } from 'src/reply/follow';
import LineRichMenu from 'src/line/richMenu';

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

    this.logger.log('処理スタート');
    console.log('ステージ', process.env.NOW_STAGE);
    try {
      // リッチメニューがない場合は作成
      const richMenuCount = await lineBotClient().getRichMenuList();
      if (richMenuCount.length === 0) {
        await LineRichMenu();
      }
      const events: any = req.events;

      const results: MessageAPIResponseBase[] = events.map(
        async (event: LineBotReqEventDto): Promise<MessageAPIResponseBase> => {
          console.log('イベント', event);

          // hash化したuserIdがuserTableにない場合は登録する
          const hashUserId = createUserIdHash(event.source.userId);
          const isRegister: UserInfo = await isRegisterUser(hashUserId);
          if (!isRegister) await registerUser(hashUserId);
          console.log('登録状況', isRegister);

          // フォローしてくれた時
          if (event.type === 'follow') {
            const followMessage = follow();
            return lineBotClient().replyMessage(
              event.replyToken,
              followMessage,
            );
          }
          // TODOフォロー解除の時
          if (event.type === 'unfollow') {
          }

          const currentMode = await getMode(hashUserId);
          /* 画像生成モード選択時 */
          if ([1, 2].includes(currentMode.mode)) {
            console.log('現在は画像モードの時の処理');
            // modeを0に戻す
            await isUpdateMode(hashUserId, 0);
          } else if (currentMode.mode !== 9999) {
            /* postback 保存・保存しないボタン押下 */
            if (event.type === 'postback') {
              const postbackParse: PostbackType = JSON.parse(
                event.postback.data,
              );
              console.log('postback', postbackParse);

              await updateMessage(postbackParse);
              const textMessage = replyReferenceType(
                postbackParse.referenceType,
              );

              return lineBotClient().replyMessage(
                event.replyToken,
                textMessage,
              );
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
                const reply = await imageProcess(hashUserId);
                return lineBotClient().replyMessage(event.replyToken, reply);
              } else {
                /* 通常の質問の場合 */
                if (event.message.type === 'text') {
                  /* postback以外の処理 通常の質問が来た時 */
                  // 質問からchatGPTの回答を得る
                  const replyText = await this.lineBotService.chatGPTsAnswer(
                    event.message.text,
                    hashUserId,
                  );

                  const textMessage = await answer(
                    hashUserId,
                    event,
                    replyText,
                  );

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
