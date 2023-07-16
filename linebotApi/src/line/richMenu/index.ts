import * as fs from 'fs';
import { leftMenu } from 'src/line/richMenu/left';
import { rightMenu } from 'src/line/richMenu/right';
import { lineBotClient } from '../replyMessage/lineBotClient';

export default async function LineRichMenu() {
  const client = lineBotClient();

  try {
    const leftId = await client.createRichMenu(leftMenu);
    const rightId = await client.createRichMenu(rightMenu);
    console.log('Get rich-menu id is...', leftId, rightId);
    console.log('rich-menu list...', await client.getRichMenuList());

    // 画像をアップロード
    const leftImage = fs.createReadStream('src/assets/left-com.png');
    await client.setRichMenuImage(leftId, leftImage);
    const rightImage = fs.createReadStream('src/assets/right-com.png');
    await client.setRichMenuImage(rightId, rightImage);
    console.log('image upload success...');

    // デフォルトを設定
    await client.setDefaultRichMenu(leftId);
    console.log('set default rich-menu success...');
    // タブの設定
    await client.createRichMenuAlias(leftId, 'alias-left');
    await client.createRichMenuAlias(rightId, 'alias-right');
    console.log('rich-menu alias is ...', await client.getRichMenuAliasList());
    console.log('rich-menu success!');
  } catch (err) {
    console.error('error in rich-menu...', err);
  } finally {
    console.log('リッチメニューの処理終了');
  }
  console.log('rich-menu id is...', await client.getRichMenuList());
  console.log('rich-menu alias is...', await client.getRichMenuAliasList());
}
