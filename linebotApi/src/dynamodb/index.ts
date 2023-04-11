import { InternalServerErrorException, Logger } from '@nestjs/common';
import {
  DynamoDBClient,
  ScanCommand,
  TransactWriteItemsCommand,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { nanoSecondFormat } from 'src/common/timeFormat';

// 型定義
type SaveAnswerType = {
  messageId: string;
  userId: string;
  question: string;
  answer: string;
  referenceType: number;
  memberStatus: number;
  createdAt: number;
};

type UpdateReferenceType = {
  replyToken: string;
  referenceType: string;
  createdAt: number;
};

type DynamodbUpdateTransactType = {
  TransactItems: [
    Update: {
      TableName: string;
      Key: {
        messageId: string;
        createdAt: string;
      };
      UpdateExpression: string;
      ExpressionAttributeValues: string;
    },
  ];
};

// dynamodbで何か処理が必要になった時のクラス
export class ProcessingInDynamo {
  // dynamodb設定
  private readonly dynamoDB = process.env.IS_OFFLINE
    ? new DynamoDBClient({
        region: 'localhost',
        endpoint: process.env.DYNAMODB_ENDPOINT,
      })
    : new DynamoDBClient({
        region: process.env.REGION,
      });

  /**
   * 全てのデータを取得する
   * @returns string
   */
  async getDatas(): Promise<any> {
    try {
      const { Items } = await this.dynamoDB.send(
        new ScanCommand({
          TableName: process.env.DYNAMODB_TABLE_NAME,
        }),
      );
      // dynamoのJSONから通常のJSONに変換する
      const newItems = Items.map((item) => unmarshall(item));
      return newItems;
    } catch (err) {
      console.log('残念ながらエラーになりました', err);
      throw new InternalServerErrorException(err);
    }
  }

  /**
   * 保存時の処理
   * リプライトークンから該当レコードのreferenceTypeを更新する
   * 1 参考になった 2 参考にならなかった 0 保存しないor何もしてない
   * @param replyToken
   * @returns
   */

  async updateMessage(event) {
    let response: any;
    console.log('イベント', event);
    try {
      const body = JSON.parse(event);
      console.log('ボディ', body);
      body.updatedAt = nanoSecondFormat();

      const params = {
        TransactItems: [
          {
            Update: {
              TableName: process.env.DYNAMODB_TABLE_NAME,
              Key: {
                messageId: { S: body.messageId },
                createdAt: { N: String(body.createdAt) },
              },
              // Key: marshall({
              //   messageId: body.messageId,
              //   createdAt: body.createdAt,
              // }),
              UpdateExpression:
                'SET referenceType = :value1, updatedAt = :value2',
              ExpressionAttributeValues: {
                ':value1': { N: String(body.referenceType) },
                ':value2': { S: body.updatedAt },
              },
            },
          },
        ],
      };

      params.TransactItems.forEach((item) => {
        console.log('更新パラムス', item.Update);
        console.log('ここで取得できるか？', body.messageId);
      });

      const command = new TransactWriteItemsCommand(params);

      try {
        console.log('tryに入った');
        response = await this.dynamoDB.send(command);
        console.log('bodyをつける前', response);
        response.body = JSON.stringify(body);
        console.log('body追加後', response);
      } catch (err) {
        response.body = JSON.stringify({
          message: 'Faild to Update...',
          errorMsg: err.message,
          errorStack: err.errorStack,
        });
      }
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
        question: event.message.text,
        answer: replayText,
        referenceType: 0,
        memberStatus: 0,
        createdAt: event.timestamp,
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
      const transact = transactItem.TransactItems.map((item) => {
        return item.Put.Item;
      });
      console.log('トランザクション', transact);
      const createTransact = await this.dynamoDB.send(
        new TransactWriteItemsCommand(transactItem),
      );

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
