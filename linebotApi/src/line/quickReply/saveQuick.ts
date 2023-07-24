/* eslint-disable prettier/prettier */
import { QuickReplyItem } from '@line/bot-sdk';
import { createUserIdHash, jpDayjs } from 'src/common';

/**
 * 回答返信後に表示する保存クイックリプライ
 * @param event
 * @param text
 * @returns
 */
export const saveQuick = async (
  event: any,
  currentMode: number,
  text?: string,
): Promise<QuickReplyItem[]> => {
  console.log('保存したい時のイベント', event);

  let params: QuickReplyItem[];
  if (currentMode === 0) {
    // ユーザーIDはハッシュ化する
    const hashUserId = createUserIdHash(event.source.userId);
    params = [
      // mode=0 messagesTable更新
      // 保存は1, 保存しないは2に更新する, 何もしていないは0
      {
        type: 'action',
        action: {
          type: 'postback',
          label: '保存する',
          // dataは最大300文字の制限あり
          data: JSON.stringify({
            userId: hashUserId,
            messageId: event.replyToken,
            referenceType: 1,
            mode: currentMode,
            updatedAt: event.timestamp,
          }),
        },
      },
      {
        type: 'action',
        action: {
          type: 'postback',
          label: '保存しない',
          data: JSON.stringify({
            userId: hashUserId,
            messageId: event.replyToken,
            referenceType: 2,
            mode: currentMode,
            updatedAt: event.timestamp,
          }),
        },
      },
    ];
  } else if (currentMode === 1 || currentMode === 2) {
    params = [
      /* imagesTableのreferenceType更新 */
      {
        type: 'action',
        action: {
          type: 'postback',
          label: '保存する',
          // dataは最大300文字の制限あり
          data: JSON.stringify({
            userId: event.userId,
            imageId: event.imageId,
            referenceType: 1,
            mode: currentMode,
            updatedAt: jpDayjs().unix(),
          }),
        },
      },
      {
        type: 'action',
        action: {
          type: 'postback',
          label: '保存しない',
          data: JSON.stringify({
            userId: event.userId,
            imageId: event.imageId,
            referenceType: 2,
            mode: currentMode,
            updatedAt: jpDayjs().unix(),
          }),
        },
      },
    ];
  }

  return await Promise.all(params);
};
