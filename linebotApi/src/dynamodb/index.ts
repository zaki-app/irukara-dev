import { InternalServerErrorException, Logger } from '@nestjs/common';
import {
  DynamoDBClient,
  GetItemCommand,
  ScanCommand,
  TransactWriteItemsCommand,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

// 型定義
type SaveAnswerType = {
  messageId: string;
  userId: string;
  question: string;
  answer: string;
  reference: number;
  memberStatus: number;
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
      console.log('GETアイテム', Items);
      // dynamoのJSONから通常のJSONに変換する
      const newItems = Items.map((item) => unmarshall(item));
      return newItems;
    } catch (err) {
      console.log('残念ながらエラーになりました', err);
      throw new InternalServerErrorException(err);
    }
  }

  /**
   * リプライトークンから保存するレコードを取得
   */
  async getMessageId(replyToken: string) {
    //ここで得た回答を元にメインテーブルに保存する
    try {
      const params = {
        TableName: process.env.DYNAMODB_TABLE_NAME,
        Key: marshall({
          messageId: replyToken,
        }),
      };

      console.log('パラメーター', params);

      const { Item } = await this.dynamoDB.send(new GetItemCommand(params));
      new Logger.log('レコード取得レスポンス', Item);
      return JSON.stringify({
        message: `${replyToken}のデータ取得成功`,
        data: Item ? unmarshall(Item) : 'データがありません',
      });
    } catch (err) {
      new Logger.error('レコード取得エラー', err);
    }
  }

  /**
   * 質問と回答を保存する
   * @param event
   * @param replayText
   * @returns
   */
  async createMessage(event: any, replayText: string): Promise<any> {
    console.log('回答保存テーブル', this.dynamoDB.config.endpoint);
    try {
      // 保存する項目
      const params: SaveAnswerType = {
        messageId: event.replyToken,
        userId: event.source.userId,
        question: event.message.text,
        answer: replayText,
        reference: 0,
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

  /**
   * postbackで来た時の保存処理
   */
  // async createMessage(event: any): Promise<any> {
  //   try {
  //     const params = JSON.parse(event.postback.data);

  //     // console.log('保存データ', params);
  //     // // 残りの必要な項目を追加する
  //     // params['messageId'] = uuidv4();
  //     // params['reference'] = 1;
  //     // params['memberStatus'] = 0;

  //     const transactItem = {
  //       // トランザクション用のparams
  //       TransactItems: [
  //         {
  //           Put: {
  //             TableName: process.env.DYNAMODB_TABLE_NAME,
  //             Item: marshall(params || {}),
  //           },
  //         },
  //       ],
  //     };

  //     console.log('トランザクション', transactItem);

  //     const createTransact = await this.dynamoDB.send(
  //       new TransactWriteItemsCommand(transactItem),
  //     );

  //     // レスポンスに保存データを含める
  //     createTransact['data'] = params;

  //     console.log('レスポンス', createTransact);
  //     return createTransact;
  //   } catch (err) {
  //     new Logger().error('ロッガーエラー', err);
  //     throw new InternalServerErrorException(err);
  //   }
  // }
}
