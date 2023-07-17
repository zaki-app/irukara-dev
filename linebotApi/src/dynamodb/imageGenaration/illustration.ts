import type {
  AnythingV4Response,
  BodyParams,
  ImageSaveProps,
} from 'src/dynamodb/imageGenaration/types';
import fetch from 'node-fetch';
import { ImageMessage, TextMessage } from '@line/bot-sdk';
import { isImageSave } from 'src/line/quickReply/imageSave';
import { createUUID, jpDayjs } from 'src/common';
import { imageSaveError } from 'src/reply/error';

type ReturnType = [ImageMessage, TextMessage] | TextMessage;

// テキストからイラストを生成する
export async function illustration(
  hashUserId: string,
  text: string,
): Promise<ReturnType> {
  let returnReply;
  try {
    const bodyParams: BodyParams = {
      key: process.env.STABLE_DIFFUSION_API_KEY,
      prompt: text,
      negative_prompt:
        'painting, extra fingers, mutated hands, poorly drawn hands, poorly drawn face, deformed, ugly, blurry, bad anatomy, bad proportions, extra limbs, cloned face, skinny, glitchy, double torso, extra arms, extra hands, mangled fingers, missing lips, ugly face, distorted face, extra legs, anime',
      model_id: 'anything-v4',
      width: 512,
      height: 512,
      samples: 1,
      num_inference_steps: 31,
      seed: null,
      guidance_scale: 7.5,
      multi_lingual: 'yes',
      webhook: null,
      track_id: null,
    };

    // bodyは最後jsonに変換が必要
    const options = {
      method: 'POST',
      body: JSON.stringify(bodyParams),
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const endpoint = 'https://stablediffusionapi.com/api/v3/dreambooth';

    const response = await fetch(endpoint, options);
    const data = (await response.json()) as AnythingV4Response;

    let imageUrl: string;
    if (data.status === 'success') {
      imageUrl = data.output[0];
    }

    // imageテーブルに保存する
    const saveProps: ImageSaveProps = {
      imageId: createUUID(),
      hashUserId,
      prompt: text,
      imageUrl: data.output[0],
      mode: 1,
      createdAt: jpDayjs().unix(),
    };
    const saveResponse = await isImageSave(saveProps);
    console.log('保存結果', saveResponse);

    // replyメッセージ
    const success = [
      {
        type: 'image',
        originalContentUrl: imageUrl,
        previewImageUrl: imageUrl,
      },
      {
        type: 'text',
        text: `${text} のイラストを生成しました！\n気に入ったら保存ボタンを教えてみましょう！`,
        // quickReply: {
        //   items:
        // }
      },
    ];

    const errorReply = {
      type: 'text',
      text: imageSaveError(saveProps.prompt) ?? '',
    };

    returnReply = saveResponse ? success : errorReply;
  } catch (err) {
    console.error('illustration generation error...', err);

    returnReply = imageSaveError();
  }
  return returnReply;
}
