import DynamoClient from 'src/dynamodb/client';
import { isRegisterUser, updateUserInfo } from 'src/dynamodb/userRegister';
import { IsRegisterUser } from 'src/dynamodb/types';
import { UserInfo } from 'src/dynamodb/types';
import dayjs from 'dayjs';
import { UpdateUserTable } from 'src/dynamodb/types';

/**
 * ユーザーの送信数、保存数を特定の条件下でリセットする
 * 今日の0時より現在時間が大きく、かつ今日の0時が最終ログインより大きい時、カウントを0にする
 * @param userId
 * @return userInfoParse(ユーザー情報)
 */
export const isUpperLimit = async (userId: string) => {
  const userInfo: UserInfo = await isRegisterUser(userId);
  console.log('最初に見るユーザー情報', userInfo);

  if (typeof userInfo === 'string') {
    const userInfoParse: IsRegisterUser = JSON.parse(userInfo);

    const currentUnix: number = dayjs().unix();
    const todayStartUnix: number = dayjs().startOf('day').unix();

    // 条件分岐
    if (
      currentUnix > todayStartUnix &&
      todayStartUnix > userInfoParse.data.lastLogin
    ) {
      // カウント数と保存数を0にする
      const params = { todayCount: 0, todaySave: 0 };
      await updateUserInfo(userId, params);
      return {
        todayCount: 0,
        todaySave: 0,
        status: userInfoParse.data.status,
      };
    } else {
      return {
        todayCount: userInfoParse.data.todayCount,
        todaySave: userInfoParse.data.todaySave,
        status: userInfoParse.data.status,
      };
    }
  }
};
