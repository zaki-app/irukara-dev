import { UserInfoType } from '../types';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import DynamoClient from 'src/dynamodb/client';
import {
  TransactWriteItemsCommand,
  GetItemCommand,
} from '@aws-sdk/client-dynamodb';
import { UserInfo } from 'src/dynamodb/types';
import { UpdateUserTable } from 'src/dynamodb/types';
import { jpDayjs } from 'src/common/timeFormat';

/**
 * ユーザーが未登録なら登録する
 * @param userId
 * @returns JSON形式のレスポンス string
 */
export const registerUser = async (userId: string): Promise<string> => {
  try {
    console.log('登録時のユーザーID', userId);
    const client = DynamoClient();

    const params: UserInfoType = {
      userId: userId,
      subUserId: uuidv4(),
      status: 0,
      todayCount: 0,
      totalCount: 0,
      todaySave: 0,
      totalSave: 0,
      lastLogin: jpDayjs().unix(),
      createdAt: jpDayjs().unix(),
    };

    const transactItem = {
      TransactItems: [
        {
          Put: {
            TableName: process.env.DYNAMODB_USER_TABLE_NAME,
            Item: marshall(params || {}),
          },
        },
      ],
    };

    await client.send(new TransactWriteItemsCommand(transactItem));

    // ユーザーが正常保存されたら何も返さない
    return JSON.stringify({
      statusCode: 200,
      body: {
        data: params,
      },
    });
  } catch (err) {
    return JSON.stringify({
      statusCode: 500,
      message: err.errorMessage,
      stack: err.stack,
    });
  }
};

/**
 * ユーザーIDから登録済みかどうか判定しtrueならユーザー情報を返却する
 * @param userId
 * @returns IsRegisterUser
 */
export const isRegisterUser = async (userId: string): Promise<UserInfo> => {
  try {
    const client = DynamoClient();

    const params = {
      TableName: process.env.DYNAMODB_USER_TABLE_NAME,
      Key: marshall({
        userId: userId,
      }),
    };

    const { Item } = await client.send(new GetItemCommand(params));

    const searchUser = JSON.stringify({
      data: Item ? unmarshall(Item) : {},
      isRegister: true,
    });
    const searchUserParse = JSON.parse(searchUser);

    if (Object.keys(searchUserParse.data).length === 0) {
      return false;
    } else {
      return searchUser;
    }
  } catch (err) {
    console.log('search User error...', err);
    return false;
  }
};

/**
 * ユーザーテーブルを更新する
 * @params userid
 * @params UpdateUserTable
 */
export const updateUserInfo = async (
  userId: string,
  updateParams: UpdateUserTable,
) => {
  try {
    const client = DynamoClient();
    const objKeys = Object.keys(updateParams);
    const params = {
      TransactItems: [
        {
          Update: {
            TableName: process.env.DYNAMODB_USER_TABLE_NAME,
            Key: marshall({
              userId: userId,
            }),
            UpdateExpression: `SET ${objKeys
              .map((_, index) => `#key${index} = :value${index}`)
              .join(', ')}`,
            ExpressionAttributeNames: objKeys.reduce(
              (acc, key, index) => ({
                ...acc,
                [`#key${index}`]: key,
              }),
              {},
            ),
            ExpressionAttributeValues: marshall(
              objKeys.reduce(
                (acc, key, index) => ({
                  ...acc,
                  [`:value${index}`]: updateParams[key],
                }),
                {},
              ),
            ),
          },
        },
      ],
    };

    const command = new TransactWriteItemsCommand(params);
    await client.send(command);

    const response = JSON.stringify({
      statusCode: 200,
      body: {
        data: updateParams,
        message: `${userId}の更新が成功しました`,
      },
    });

    console.log('update userTable success!', response);

    return response;
  } catch (err: any) {
    const response = JSON.stringify({
      statusCode: 500,
      body: {
        message: 'ユーザー情報の更新に失敗しました',
        errorMessage: err.message,
        errorStack: err.stack,
      },
    });

    console.log('update userTable Failed...', response);
    return response;
  }
};
