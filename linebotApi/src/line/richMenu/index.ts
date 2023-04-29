import * as fs from 'fs';
import { richMenuConfig } from './config';
import { ClientConfig, RichMenu, Client } from '@line/bot-sdk';
import * as path from 'path';

export default class LineRichMenu {
  private readonly lineClient: Client;
  private richMenuId: string;

  constructor() {
    const lineConfig: ClientConfig = {
      channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
      // channelSecret: process.env.CHANNEL_SECRET,
    };

    this.lineClient = new Client(lineConfig);
    // this.createRichMenu();
    // this.setRichMenuImage();
  }

  // リッチメニュー作成
  async createRichMenu(): Promise<void> {
    const richMenuId: string = await this.lineClient.createRichMenu(
      richMenuConfig,
    );
    console.log('リッチメニュー作成', richMenuId);
    this.richMenuId = richMenuId;

    await this.setRichMenuImage();
    await this.setDefaultRichMenu();
    console.log('リッチ', this.richMenuId);
  }

  // 画像を設定する
  async setRichMenuImage(): Promise<void> {
    const image = fs.createReadStream('src/assets/richmenu.png');
    // console.log('画像', image);
    const result = await this.lineClient.setRichMenuImage(
      this.richMenuId,
      image,
    );
    console.log('画像は設定されえた？？', result);
  }

  // デフォルトのリッチメニューを設定
  async setDefaultRichMenu(): Promise<void> {
    const result = await this.lineClient.setDefaultRichMenu(this.richMenuId);
    console.log('デフォルト', result);
  }
}

// export class LineRichMenu {
//   private readonly client = lineBotClient();
//   private readonly config = richMenuConfig;
//   private richMenuId: string;

//   constructor() {
//     this.client = this.client;
//     this.config = this.config;
//     this.createRichMenu();
//     this.setRichMenuImage();
//     this.setDefaultRichMenu();
//   }

//   // リッチメニューの作成
//   async createRichMenu() {
//     await this.client.createRichMenu(this.config).then((rechMenuId) => {
//       console.log('リッチメニューレスポンス', rechMenuId);
//       this.richMenuId = rechMenuId;
//     });
//   }

//   // 画像の設定
//   async setRichMenuImage() {
//     console.log('メニューID', this.richMenuId);
//     // const image = fs.createReadStream('./images/sample.png');
//     // console.log('画像', image);
//     // await this.client.setRichMenuImage(this.richMenuId, image);
//   }

//   // デフォルトのリッチメニューの設定
//   async setDefaultRichMenu() {
//     await this.client.setDefaultRichMenu(this.richMenuId);
//   }
// }
