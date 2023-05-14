import DynamoClient from 'src/dynamodb/client';

/**
 * 今日の保存数、合計保存数を更新する
 */
export const todaySave = (userId: string) => {
  console.log('保存数カウント', userId);
};
