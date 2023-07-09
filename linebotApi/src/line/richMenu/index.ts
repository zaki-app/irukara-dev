import * as fs from 'fs';
import { richMenuConfig } from './config';
import { ClientConfig, Client } from '@line/bot-sdk';

export default class LineRichMenu {
  private readonly lineClient: Client;
  private richMenuId: string;

  constructor() {
    const lineConfig: ClientConfig = {
      channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
    };

    this.lineClient = new Client(lineConfig);
  }

  // リッチメニュー作成
  async createRichMenu(): Promise<void> {
    const richMenuId: string = await this.lineClient.createRichMenu(
      richMenuConfig,
    );
    console.log('リッチメニュー作成', richMenuId);
    console.log('リッチメニュー設定', richMenuConfig.areas[0]);
    console.log('リッチメニューURL', process.env.LIFF_URL);
    this.richMenuId = richMenuId;

    await this.setRichMenuImage();
    await this.setDefaultRichMenu();
    console.log('リッチ', this.richMenuId);
  }

  // 画像を設定する
  async setRichMenuImage(): Promise<void> {
    const image = fs.createReadStream('src/assets/richmenu.png');
    await this.lineClient.setRichMenuImage(this.richMenuId, image);
  }

  // デフォルトのリッチメニューを設定
  async setDefaultRichMenu(): Promise<void> {
    const result = await this.lineClient.setDefaultRichMenu(this.richMenuId);
    console.log('デフォルト', result);
  }
}
