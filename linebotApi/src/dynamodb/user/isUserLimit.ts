import { jpDayjs } from 'src/common';
import type { RegisterUserData } from 'src/dynamodb/types';

/* ユーザーの送信回数・保存回数を取得し、処理が進めるか判定 */
export async function isUserLimit({
  data,
}: RegisterUserData): Promise<boolean> {
  console.log('渡ってきたユーザーさん', data);
  // 明日の0:00を取得↓
  const currentUnix = jpDayjs().add(2, 'day').startOf('day').unix();

  // 今日の0:00を取得
  // const currentUnix = jpDayjs().startOf('day').unix();

  // まず現在時間よりlastLoginが
  // 毎回０にならないように実装しないといけない
  let response: boolean;
  if (data.lastLogin > currentUnix) {
    console.log('今日の0時より後の出来事');
    if (data.todayCount >= 20 || data.todaySave >= 5) {
      console.log('もう限度になってる');
      response = false;
    }
  } else {
    console.log('今日の0時より前、つまり昨日なので送信・保存回数を0にする');
    response = true;
  }

  return response;
}
