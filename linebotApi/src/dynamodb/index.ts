import { Logger } from '@nestjs/common';
import { TransactWriteItemsCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { SaveAnswerType } from 'src/dynamodb/types';
import { registerUser, isRegisterUser } from 'src/dynamodb/userRegister';
import { todayCount } from './messageCount';
import DynamoClient from 'src/dynamodb/client';
import dayjs from 'dayjs';

// dynamodbで何か処理が必要になった時のクラス
export class ProcessingInDynamo {
  // dynamodb設定
  private readonly dynamoDB = DynamoClient();

  /**
   * 保存時の処理
   * リプライトークンから該当レコードのreferenceTypeを更新する
   * 1 参考になった 2 参考にならなかった 0 保存しないor何もしてない
   * @param replyToken
   * @returns
   */

  async updateMessage(event) {
    let response: any;
    try {
      const body = JSON.parse(event);
      console.log('ボディ', body);

      const params = {
        TransactItems: [
          {
            Update: {
              TableName: process.env.DYNAMODB_TABLE_NAME,
              Key: marshall({
                messageId: body.messageId,
              }),
              UpdateExpression:
                'SET referenceType = :value1, updatedAt = :value2',
              ExpressionAttributeValues: marshall({
                ':value1': body.referenceType,
                ':value2': dayjs().unix(),
              }),
            },
          },
        ],
      };

      const command = new TransactWriteItemsCommand(params);

      // メッセージ保存処理
      try {
        response = await this.dynamoDB.send(command);
        response['body'] = body;
        console.log('body追加後', response);
      } catch (err) {
        response.body = JSON.stringify({
          message: 'Faild to Update...',
          errorMsg: err.message,
          errorStack: err.errorStack,
        });
      }

      // メッセージカウント処理
      try {
      } catch (err) {}
    } catch (err) {
      new Logger.error('レコード更新エラー', err);
      response.body = JSON.stringify({
        message: 'dynamodb以外でエラー',
        errorMsg: err.message,
        errorStack: err.errorStack,
      });
    }

    new Logger().log('更新レスポンス', response);
    return response;
  }
  /**
   * 質問と回答を保存する
   * @param event
   * @param replayText
   * @returns
   */
  async createMessage(event: any, replayText: string): Promise<any> {
    try {
      // 保存する項目
      const params: SaveAnswerType = {
        messageId: event.replyToken,
        userId: event.source.userId,
        lineUserId: event.source.userId,
        question: event.message.text,
        answer: replayText,
        referenceType: 0,
        memberStatus: 0,
        createdAt: dayjs().unix(),
      };

      console.log('パラムス', params);
      const transactItem = {
        // トランザクション用のparams
        TransactItems: [
          {
            Put: {
              TableName: process.env.DYNAMODB_TABLE_NAME,
              Item: marshall(params || {}),
            },
          },
        ],
      };

      const createTransact = await this.dynamoDB.send(
        new TransactWriteItemsCommand(transactItem),
      );

      // 同時に未登録ならユーザーテーブルにも保存する
      // const result: string | boolean = await isRegisterUser(
      //   event.source.userId,
      // );
      // if (typeof result === 'string') {
      //   const resultJs = JSON.parse(result);
      //   if (!resultJs.isRegister) {
      //     await registerUser(event.source.userId);
      //   }
      // }
      // ユーザーの送信カウントを1増加させる
      const userCount = await todayCount(event.source.userId);
      console.log('カウント', userCount);

      // レスポンスに保存データを含める
      createTransact['data'] = params;

      console.log('回答保存レスポンス', createTransact);
      return createTransact;
    } catch (err) {
      new Logger().error('保存時のエラー', err);
    }
  }

  async deleteMessage(messageId: string) {
    let response;
    try {
      const params = {
        TransactItems: [
          {
            Delete: {
              TableName: process.env.DYNAMODB_TABLE_NAME,
              Key: marshall({
                messageId: messageId,
              }),
            },
          },
        ],
      };

      const deleteResult = await this.dynamoDB.send(
        new TransactWriteItemsCommand(params),
      );
      response.body = JSON.stringify({
        message: 'DELETE Successfully!!',
        deleteResult,
      });
    } catch (err) {
      response.statusCode = 500;
      response.body = JSON.stringify({
        message: 'Failed to DELETE...',
        errorMsg: err.message,
        errorStack: err.errorStack,
      });
    }

    return response;
  }
}
