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
import { saveQuick } from 'src/line/quickReply/saveQuick';
import { ImageCounts } from 'src/types/user';
import { updateUser } from '../user/updateUser';

type ReturnType = [ImageMessage, TextMessage] | TextMessage;

/* モードからイラストとリアルで分岐する */
export async function generation(
  hashUserId: string,
  text: string,
  mode: number,
  imageCount: ImageCounts,
): Promise<ReturnType> {
  let returnReply;
  try {
    // モードによって切り替える
    let bodyParams: BodyParams;
    let endpoint: string;
    let replyMessage: string;

    if (mode === 1) {
      bodyParams = {
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
      endpoint = 'https://stablediffusionapi.com/api/v3/dreambooth';
      replyMessage = 'イラスト';
    } else if (mode === 2) {
      bodyParams = {
        key: process.env.STABLE_DIFFUSION_API_KEY,
        prompt: text,
        negative_prompt:
          'EasyNegative, paintings, sketches, (worst quality:2), (low quality:2), (normal quality:2), lowres, normal quality, ((monochrome)),worst quality, low quality, normal quality, jpegartifacts, signature, watermark, blurry, cropped, poorly draw, poorly draw, worst quality, low quality, lowres, painting,sketches !ogo.watermark, text(worst quality:2),(low quality:2),(normal quality:2),lowers.normal quality,((monochrome)),((grayscale),skin spots acnes,skin blemishes, age, spot,(outdoor:1.6),nsfw.ugly face,breasts out, too much muscle, bad hands, bad arms, missing fingers,',
        width: 512,
        height: 512,
        samples: 1,
        num_inference_steps: 31,
        safety_checker: 'no',
        enhance_prompt: 'yes',
        seed: null,
        guidance_scale: 7.5,
        multi_lingual: 'yes',
        panorama: 'no',
        self_attention: 'no',
        upscale: 'no',
        embeddings_model: null,
        webhook: null,
        track_id: null,
      };
      endpoint = 'https://stablediffusionapi.com/api/v3/text2img';
      replyMessage = 'リアル画像';
    }

    // bodyは最後jsonに変換が必要
    const options = {
      method: 'POST',
      body: JSON.stringify(bodyParams),
      headers: {
        'Content-Type': 'application/json',
      },
    };

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
      mode,
      createdAt: jpDayjs().unix(),
    };
    const saveResponse = await isImageSave(saveProps);
    console.log('保存結果', saveResponse);

    // replyメッセージ
    const updateParams = {
      userId: hashUserId,
      imageId: saveProps.imageId,
    };
    const quickItems = await saveQuick(updateParams, mode);
    const success = [
      {
        type: 'image',
        originalContentUrl: imageUrl,
        previewImageUrl: imageUrl,
      },
      {
        type: 'text',
        text: `${text} の${replyMessage}を生成しました！\n気に入ったら保存ボタンを押してください！`,
        quickReply: {
          items: quickItems,
        },
      },
    ];

    // usersTableの画像カウントを更新する
    const userImageCount = await updateUser(hashUserId, imageCount);
    if (JSON.parse(userImageCount).statusCode === 200) returnReply = success;
  } catch (err) {
    console.error('illustration generation error...', err);

    returnReply = imageSaveError();
  }
  return returnReply;
}
