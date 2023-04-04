import { InternalServerErrorException, Logger } from '@nestjs/common';
import {
  DynamoDBClient,
  ScanCommand,
  TransactWriteItemsCommand,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

// 型定義
type SaveAnswerType = {
  answerId: string;
  userId: string;
  answer: string;
  createdAt: number;
};

// dynamodbで何か処理が必要になった時のクラス
export class ProcessingInDynamo {
  // dynamodb設定
  dynamoDB = process.env.IS_OFFLINE
    ? new DynamoDBClient({
        region: 'localhost',
        endpoint: process.env.DYNAMODB_ENDPOINT,
      })
    : new DynamoDBClient({
        region: process.env.REGION,
      });

  // 全てのデータを取得する
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
      console.log('残念ながらエラーになりました');
      throw new InternalServerErrorException(err);
    }
  }

  /**
   * リプライトークンから回答を取得
   */
  async getAnswer(replyToken: string) {
    //ここで得た回答を元にメインテーブルに保存する
  }

  /**
   * メインへの保存のために回答のみ保存
   */
  async createAnswer(event: any, replayText: string): Promise<any> {
    console.log('回答保存テーブル', event);
    // 保存する項目
    const params: SaveAnswerType = {
      answerId: event.replyToken,
      userId: event.source.userId,
      answer: replayText,
      createdAt: event.timestamp,
    };

    console.log('パラムス', params);

    const transactItem = {
      // トランザクション用のparams
      TransactItems: [
        {
          Put: {
            TableName: process.env.DYNAMODB_ANSWER_TABLE_NAME,
            Item: marshall(params || {}),
          },
        },
      ],
    };
    const createTransact = await this.dynamoDB.send(
      new TransactWriteItemsCommand(transactItem),
    );

    // レスポンスに保存データを含める
    createTransact['data'] = params;

    console.log('回答保存レスポンス', createTransact);
    return createTransact;
  }

  /**
   * postbackで来た時の保存処理
   */
  async createMessage(event: any): Promise<any> {
    try {
      const params = JSON.parse(event.postback.data);

      // console.log('保存データ', params);
      // // 残りの必要な項目を追加する
      // params['messageId'] = uuidv4();
      // params['reference'] = 1;
      // params['memberStatus'] = 0;

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

      console.log('トランザクション', transactItem);

      const createTransact = await this.dynamoDB.send(
        new TransactWriteItemsCommand(transactItem),
      );

      // レスポンスに保存データを含める
      createTransact['data'] = params;

      console.log('レスポンス', createTransact);
      return createTransact;
    } catch (err) {
      new Logger().error('ロッガーエラー', err);
      throw new InternalServerErrorException(err);
    }
  }
}
