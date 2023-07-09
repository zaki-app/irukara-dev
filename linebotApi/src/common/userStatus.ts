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
  free: 50,
  billing: 100,
  billingToFree: 50,
};

/**
 * 1日に保存できる上限
 */
export const userSavedLimit = {
  free: 5,
  billing: 100,
  billingToFree: 5,
};

/**
 * メッセージ送信上限を超えたリプライメッセージ
 */
export const toUpperLimitMessage = {
  text: '本日の送信上限に到達しました🙇🙇‍♂️\n無料プランでは1日15通までのメッセージ送信と3通のメッセージ保存ができます。\n良かったら有料プランもご検討くださいませ👀',
};

/**
 * 保存回数上限を超えたリプライメッセージ
 */
export const toUpperLimitSaved = {
  text: '本日の保存上限に到達しました🙇🙇‍♂️\n無料プランでは1日15通までのメッセージ送信と3通のメッセージ保存ができます。\n良かったら有料プランもご検討くださいませ👀',
};
