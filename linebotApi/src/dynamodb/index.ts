import { InternalServerErrorException, Logger } from '@nestjs/common';
import {
  DynamoDBClient,
  ScanCommand,
  TransactWriteItemsCommand,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { v4 as uuidv4 } from 'uuid';

// dynamodbで何か処理が必要になった時のクラス
export class ProcessingInDynamo {
  // dynamodb設定
  dynamoDB = process.env.IS_OFFLINE
    ? new DynamoDBClient({
        region: 'localhost',
        endpoint: process.env.DYNAMODB_ENDPOINT,
      })
    : new DynamoDBClient({
        region: process.env.AWS_REGION,
        endpoint: process.env.DYNAMODB_ENDPOINT,
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
   * postbackで来た時の保存処理
   */
  async createMessage(event: any): Promise<any> {
    try {
      const params = JSON.parse(event.postback.data);

      console.log('保存データ', params);
      // 残りの必要な項目を追加する
      params['messageId'] = uuidv4();
      params['reference'] = 1;
      params['memberStatus'] = 0;

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
