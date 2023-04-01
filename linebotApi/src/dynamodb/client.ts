import { InternalServerErrorException } from '@nestjs/common';
import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';

// dynamodbで何か処理が必要になった時のクラス
export class DynamoDB {
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
}
