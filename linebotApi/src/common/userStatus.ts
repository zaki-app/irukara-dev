/**
 * 無料と有料ユーザーに関する処理をまとめる
 */

/**
 * ユーザーステータス
 * free(無料), billing(有料), billingToFree(有料を解約)
 */
export const userStatus = {
  free: 0,
  billing: 1,
  billingToFree: 2,
};

/**
 * １日に送信できるメッセージの上限
 */
export const userMessageLimit = {
  free: 3,
  billing: 100,
  billingToFree: 2,
};

/**
 * 上限を超えた場合のメッセージ
 */
export const toUpperLimitMessage = {
  text: '本日の送信上限に到達しました🙇🙇‍♂️\n無料プランでは1日15通までのメッセージ送信と3通のメッセージ保存ができます。\n良かったら有料プランもご検討くださいませ👀',
};
