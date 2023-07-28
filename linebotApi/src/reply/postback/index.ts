import { TextMessage } from '@line/bot-sdk';
import { updateReferenceType } from 'src/reply/postback/updateReferenceType';
import { updateMode } from 'src/reply/postback/updateMode';

export async function postbackProcess(
  postbackParse,
  hashUserId: string,
  modeSaveCount?,
): Promise<TextMessage> {
  console.log('渡ってきた値', postbackParse);
  const modeNumber = [0, 1, 2];

  // referenceTypeの更新
  let response;
  if (postbackParse.referenceType) {
    response = await updateReferenceType(postbackParse, modeSaveCount);
  } else if (modeNumber.includes(postbackParse.mode)) {
    console.log('モード', postbackParse.mode);
    response = await updateMode(hashUserId, postbackParse.mode);
  }

  // reply内容を返却
  return response;
}
