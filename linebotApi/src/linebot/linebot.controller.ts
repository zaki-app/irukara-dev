import { Body, Controller, Post, Logger, Headers } from '@nestjs/common';
import { LineBotService } from './linebot.service';
import { fixedQuestions } from 'src/line/quickReply/fixedQuestion';
import { lineBotClient } from 'src/line/replyMessage/lineBotClient';
import { LineBotReqEventDto } from './dto/linebot-req-event.dto';
import { createUserIdHash, LineInspection } from 'src/common';
import { isRegisterUser, registerUser } from 'src/dynamodb';
import { imageModeText } from 'src/imageGeneration/generationMode';
import { imageProcess } from 'src/imageGeneration/imageProcess';
import { notTextMessage } from 'src/line/replyMessage/sorryReply';
import { postbackProcess, notSupported, answer, fixed } from 'src/reply';

import type {
  UserInfo,
  ReferenceTypeProps,
  ModeSelectTypeProps,
} from 'src/dynamodb/types';
import type { WebhookRequestBody, MessageAPIResponseBase } from '@line/bot-sdk';
import { getMode } from 'src/dynamodb/user/getUserInfo';
import { follow } from 'src/reply/follow';
import LineRichMenu from 'src/line/richMenu';
import { illustration } from 'src/dynamodb/imageGenaration/illustration';

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
    try {
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
          // postback時の処理
          if (event.type === 'postback') {
            const postbackParse: ReferenceTypeProps | ModeSelectTypeProps =
              JSON.parse(event.postback.data);
            console.log('postback value', postbackParse);

            // referenceType更新・モード選択時の処理
            const textMessage = await postbackProcess(
              postbackParse,
              hashUserId,
            );
            console.log('postback return', textMessage);

            return lineBotClient().replyMessage(event.replyToken, textMessage);
          }
          /* スタンプ・画像・ビデオの時謝罪メッセージを返却 */
          if (notTextMessage.includes(event.message.type)) {
            const sorry = notSupported(event);
            return lineBotClient().replyMessage(event.replyToken, sorry);
          }
          /* 固定の質問 */
          if (fixedQuestions.includes(event.message.text)) {
            const textMessage = fixed(event.message.text);
            return lineBotClient().replyMessage(event.replyToken, textMessage);
          }
          /* テキストからの画像生成モード */
          if (imageModeText.includes(event.message.text)) {
            const reply = await imageProcess(hashUserId);
            return lineBotClient().replyMessage(event.replyToken, reply);
          }

          const currentMode = await getMode(hashUserId);
          console.log('現在のモード', currentMode);
          /* 画像生成モード選択時 */
          if ([1, 2].includes(currentMode.mode)) {
            console.log('現在は画像モードの時の処理');
            const reply = await illustration(hashUserId, event.message.text);
            return await lineBotClient().replyMessage(event.replyToken, reply);
          } else if (currentMode.mode !== 9999) {
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
