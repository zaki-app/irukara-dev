import { Logger } from '@nestjs/common';
import { TransactWriteItemsCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { SaveAnswerType, PostbackType } from 'src/dynamodb/types';
import { todayCount } from './messageCount';
import DynamoClient from 'src/dynamodb/client';
// import dayjs from 'dayjs';
import { jpDayjs } from 'src/common/timeFormat';

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

  async updateMessage(data: PostbackType) {
    try {
      // const body: PostbackType = JSON.parse(event);
      // console.log('ボディ', body);

      const params = {
        TransactItems: [
          {
            Update: {
              TableName: process.env.DYNAMODB_TABLE_NAME,
              Key: marshall({
                messageId: data.messageId,
              }),
              UpdateExpression:
                'SET referenceType = :value1, updatedAt = :value2',
              ExpressionAttributeValues: marshall({
                ':value1': data.referenceType,
                ':value2': jpDayjs().unix(),
              }),
            },
          },
        ],
      };

      const command = new TransactWriteItemsCommand(params);

      // メッセージ保存処理
      try {
        await this.dynamoDB.send(command);
        // 保存カウント用にuserIdを追加
        data['userId'] = data.userId;
        const response = JSON.stringify({
          statusCode: 200,
          data: data,
        });

        return response;
      } catch (err) {
        const response = JSON.stringify({
          message: 'Faild to Update...',
          errorMsg: err.message,
          errorStack: err.errorStack,
        });

        return response;
      }
    } catch (err) {
      new Logger.error('レコード更新エラー', err);
      const response = JSON.stringify({
        message: 'dynamodb以外でエラー',
        errorMsg: err.message,
        errorStack: err.errorStack,
      });

      return response;
    }
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
        createdAt: jpDayjs().unix(),
      };

      console.log('メッセージ保存パラムス', params);
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

      // メッセージの保存
      await this.dynamoDB.send(new TransactWriteItemsCommand(transactItem));

      // ユーザーの送信カウントを1増加させる
      const userCount = await todayCount(event.source.userId);
      console.log('メッセージカウントレスポンス', userCount);

      const answerResponse = JSON.stringify({
        statusCode: 200,
        body: {
          data: params,
        },
      });

      console.log('回答保存レスポンス', answerResponse);
      return answerResponse;
    } catch (err) {
      return JSON.stringify({
        statusCode: 500,
        message: err.message,
        stack: err.stack,
      });
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
