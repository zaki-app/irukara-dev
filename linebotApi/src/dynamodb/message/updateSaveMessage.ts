import { PostbackType, UserInfo } from 'src/dynamodb/types';
import { marshall } from '@aws-sdk/util-dynamodb';
import { jpDayjs } from 'src/common/timeFormat';
import { TransactWriteItemsCommand } from '@aws-sdk/client-dynamodb';
import { isRegisterUser } from 'src/dynamodb';

/**
 * 保存するボタンクリック後の更新処理
 * referenceType, todaySave, totalSave, lastLogin, updatedAtを更新
 * @param data
 * @returns
 */

export async function updateMessage(data: PostbackType) {
  console.log('更新処理の時', data.messageId);
  try {
    const userInfo: UserInfo = await isRegisterUser(data.messageId);
    if (typeof userInfo === 'string') {
      const userInfoParse = JSON.parse(data.messageId);
      console.log('更新処理userInfoParse', userInfoParse);
      let todaySave: number, totalSave: number;
      if (userInfoParse.isRegister) {
        todaySave = parseInt(userInfoParse.data.todaySave) + 1;
        totalSave = parseInt(userInfoParse.data.totalSave) + 1;
        console.log('save count', todaySave, totalSave);
      }
    }

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
    const response = JSON.stringify({
      message: 'dynamodb以外でエラー',
      errorMsg: err.message,
      errorStack: err.errorStack,
    });

    return response;
  }
}
