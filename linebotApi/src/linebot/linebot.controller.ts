import { Body, Controller, Post, Logger, Headers } from '@nestjs/common';
import { LineBotService } from './linebot.service';
import { fixedQuestions } from 'src/line/quickReply/fixedQuestion';
import { lineBotClient } from 'src/line/replyMessage/lineBotClient';
import { createUserIdHash, LineInspection } from 'src/common';
import { isRegisterUser, registerUser } from 'src/dynamodb';
import { imageModeText } from 'src/imageGeneration/generationMode';
import { imageProcess } from 'src/imageGeneration/imageProcess';
import { notTextMessage } from 'src/line/replyMessage/sorryReply';
import { postbackProcess, notSupported, answer, fixed } from 'src/reply';
import { follow } from 'src/reply/follow';
import LineRichMenu from 'src/line/richMenu';
import { imageGeneration } from 'src/dynamodb/imageGenaration/generation';

import type { UserInfo, ModeSelectTypeProps, UsersTable } from 'src/types/user';
import type { MessageReferenceTypeProps } from 'src/types/message';
import type {
  WebhookRequestBody,
  MessageAPIResponseBase,
  RichMenuResponse,
  WebhookEvent,
  TextEventMessage,
} from '@line/bot-sdk';
import { getUserInfo } from 'src/dynamodb/user/getUserInfo';

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
    console.log('リクエスト', signature);
    // 著名の検証
    const isSignature: boolean = new LineInspection().verifySignature(
      signature,
      JSON.stringify(req),
    );
    if (!isSignature) {
      console.error('不正なアクセス', isSignature);
      throw new Error('invalid signature');
    }

    this.logger.log('処理スタート');
    console.log('現在のステージ', process.env.NOW_STAGE);
    // リッチメニューがない場合は作成
    const richMenuCount: RichMenuResponse[] =
      await lineBotClient().getRichMenuList();
    if (richMenuCount.length === 0) await LineRichMenu();

    const events: WebhookEvent[] = req.events;

    try {
      const results = events.map(
        async (event: WebhookEvent): Promise<MessageAPIResponseBase> => {
          console.log('イベント', event);

          // LINEBOTのmodeがstandbyの時は何もしない
          if (event.mode === 'standby') return;

          // hash化したuserIdがuserTableにない場合は登録する
          const hashUserId = createUserIdHash(event.source.userId);
          // ユーザー登録の有無
          const isRegister: UserInfo = await isRegisterUser(hashUserId);

          // 未登録の場合登録
          let userInfo: string;
          if (!isRegister && event.type === 'postback') {
            // 友達登録後すぐにモード選択する場合
            const selectMode = JSON.parse(event.postback.data);
            await registerUser(hashUserId, selectMode.mode);
            const textMessage = await postbackProcess(selectMode, hashUserId);

            return lineBotClient().replyMessage(event.replyToken, textMessage);
          } else if (!isRegister) {
            // 友達登録後、メッセージ等送信した場合
            userInfo = await registerUser(hashUserId);
          }

          // ユーザー情報を取得
          let currentUser: UsersTable | number;
          if (userInfo) {
            currentUser = JSON.parse(userInfo).body.data as UsersTable;
          } else {
            currentUser = (await getUserInfo(hashUserId)) as UsersTable;
          }
          console.log('current user info...', currentUser);

          /* フォローしてくれた時 */
          if (event.type === 'follow') {
            const followMessage = follow();
            return lineBotClient().replyMessage(
              event.replyToken,
              followMessage,
            );
          } else if (event.type === 'unfollow') {
            /* TODOフォロー解除の時 */
          } else if (event.type === 'postback') {
            console.log('postbackの処理', currentUser);
            /* 保存時のPostBack */
            const postbackParse:
              | MessageReferenceTypeProps
              | ModeSelectTypeProps = JSON.parse(event.postback.data);
            console.log('postback value', postbackParse);

            // modeごとに渡すカウントを変更
            const modeSaveCount =
              currentUser.mode === 0
                ? {
                    weekMsgSave: currentUser.weekMsgSave + 1,
                    totalMsgSave: currentUser.totalMsgSave + 1,
                  }
                : {
                    weekImgSave: currentUser.weekImgSave + 1,
                    totalImgSave: currentUser.totalImgSave + 1,
                  };

            // referenceType更新・モード選択時の処理
            const textMessage = await postbackProcess(
              postbackParse,
              hashUserId,
              modeSaveCount,
            );
            console.log('postback return', textMessage);

            return lineBotClient().replyMessage(event.replyToken, textMessage);
          } else if (event.type === 'message') {
            /* typeがmessageの時 */
            const changeTextEvent = event.message as TextEventMessage;
            const textEvent = changeTextEvent.text;
            /* スタンプ・画像・ビデオの時謝罪メッセージを返却 */
            if (notTextMessage.includes(event.message.type)) {
              const sorry = notSupported(event);
              return lineBotClient().replyMessage(event.replyToken, sorry);
            }
            /* 固定の質問 */
            if (fixedQuestions.includes(textEvent)) {
              console.log('固定の質問', event);
              const textMessage = fixed(textEvent);
              return lineBotClient().replyMessage(
                event.replyToken,
                textMessage,
              );
            }
            /* テキストからの画像生成モード */
            if (imageModeText.includes(textEvent)) {
              const reply = await imageProcess(hashUserId);
              return lineBotClient().replyMessage(event.replyToken, reply);
            }
            /* 画像生成モード選択時 */
            if ([1, 2].includes(currentUser.mode)) {
              console.log('現在は画像モードの時の処理');
              const reply = await imageGeneration(
                hashUserId,
                textEvent,
                currentUser.mode,
                {
                  weekImg: currentUser.weekImg + 1,
                  totalImg: currentUser.totalImg + 1,
                },
              );
              return await lineBotClient().replyMessage(
                event.replyToken,
                reply,
              );
            } else if (currentUser.mode !== 9999) {
              // 質問からchatGPTの回答を得る
              const replyText = await this.lineBotService.chatGPTsAnswer(
                textEvent,
                hashUserId,
              );

              const textMessage = await answer(
                hashUserId,
                currentUser.mode,
                event,
                replyText,
                {
                  weekMsg: currentUser.weekMsg + 1,
                  totalMsg: currentUser.totalMsg + 1,
                },
              );

              return await lineBotClient().replyMessage(
                event.replyToken,
                textMessage,
              );
            }
          }
        },
      );
      const response = await Promise.all(results);

      return response;
    } catch (err) {
      console.error(err);
      this.logger.error(`LineBotエラー: ${err}`);
      // const errorEvent: LineBotError = events[0];
      // return await lineBotClient().replyMessage(,lineBotError());
      // エラーの時も何かメッセージを入れたい
      // return err;
    } finally {
      this.logger.log('全ての処理が終了');
    }
  }
}
