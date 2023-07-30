import { UsersTable } from 'src/types/user';

/* ユーザーのステータスとカウント数から使用制限超過の場合はメッセージを送信する処理 */
/**
 * mode
 * 0 ... MsgとImgが10通まで
 * 1 ... Msgは40通まで、Imgは25通まで
 * 2 ... Msgは40通まで、Imgは25通まで
 * 3 ... Msgは100通まで、Imgは60通まで
 * 4 ... 無制限
 * @param currentUser
 */
export function upperLimit({ status, weekMsg, weekImg }: UsersTable) {
  let messageLimit = true;
  let imageLimit = true;
  let isLimit = false;

  switch (status) {
    // お試し期間終了後の無料プラン
    case 0:
      if (weekMsg > 10) messageLimit = false;
      if (weekImg > 10) imageLimit = false;
      if (!weekMsg && !weekImg) isLimit = true;
      console.log('無料ユーザー', messageLimit, imageLimit);
      break;
    // お試し期間中
    case 1:
      if (weekMsg > 5) messageLimit = false;
      if (weekImg > 3) imageLimit = false;
      if (!weekMsg && !weekImg) isLimit = true;
      console.log('お試し期間', messageLimit, imageLimit);
      break;
    // 420(予定)
    case 2:
      if (weekMsg > 40) messageLimit = false;
      if (weekImg > 25) imageLimit = false;
      if (!weekMsg && !weekImg) isLimit = true;
      console.log('420(イルカモ)', messageLimit, imageLimit);
      break;
    // 980(予定)
    case 3:
      if (weekMsg > 100) messageLimit = false;
      if (weekImg > 60) imageLimit = false;
      if (!weekMsg && !weekImg) isLimit = true;
      console.log('980(イルカラ)', messageLimit, imageLimit);
      break;
    // 3000(予定)
    case 4:
      messageLimit = true;
      imageLimit = true;
      console.log('3000(イルカラVIP)', messageLimit, imageLimit);
      break;
    default:
      console.log('ステータスがありません');
      messageLimit = false;
      imageLimit = false;
  }

  return {
    messageLimit,
    imageLimit,
  };
}
