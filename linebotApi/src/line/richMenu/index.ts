import * as fs from 'fs';
import { lineBotClient } from '../replyMessage/lineBotClient';
import { richMenuConfig } from './config';

export class LineRichMenu {
  private readonly client = lineBotClient();
  private readonly config = richMenuConfig;
  private richMenuId: string;

  constructor() {
    this.client = this.client;
    this.config = this.config;
    this.createRichMenu();
    this.setRichMenuImage();
    this.setDefaultRichMenu();
  }

  // リッチメニューの作成
  async createRichMenu() {
    await this.client.createRichMenu(this.config).then((rechMenuId) => {
      console.log('リッチメニューレスポンス', rechMenuId);
      this.richMenuId = rechMenuId;
    });
  }

  // 画像の設定
  async setRichMenuImage() {
    console.log('メニューID', this.richMenuId);
    // const image = fs.createReadStream('./images/sample.png');
    // console.log('画像', image);
    // await this.client.setRichMenuImage(this.richMenuId, image);
  }

  // デフォルトのリッチメニューの設定
  async setDefaultRichMenu() {
    await this.client.setDefaultRichMenu(this.richMenuId);
  }
}
