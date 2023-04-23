import * as crypto from 'crypto';

/**
 * リクエストがLineプラットフォームからのものか確認する
 */
export default class LineInspection {
  private readonly channelSecret: string = process.env.CHANNEL_SECRET;

  verifySignature(signature: string, body: string): boolean {
    // hashの作成
    const hash = crypto
      .createHmac('SHA256', this.channelSecret)
      .update(body)
      .digest('base64');

    return hash === signature;
  }
}
