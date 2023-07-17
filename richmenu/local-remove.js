const line = require("@line/bot-sdk");
const { token, secret } = require("./secret");

// リッチメニュー更新時にIDとエイリアスを削除する
async function removeLichMenu() {
    const client = new line.Client({
        channelAccessToken: token,
        channelSecret: secret,
    });

    // リスト取得
    const list = await client.getRichMenuList();
    console.log("削除対象ID", list.length);

    list.forEach(async (item) => {
        await client.deleteRichMenu(item.richMenuId);
        console.log(item.richMenuId);
        console.log("削除後のリスト", await client.getRichMenuList());
    });

    // エイリアスリスト
    const aliasList = await client.getRichMenuAliasList();
    console.log("削除対象エイリアス", aliasList.aliases);

    if (aliasList.aliases.length > 0) {
        aliasList.aliases.forEach(async (item) => {
            await client.deleteRichMenuAlias(item.richMenuAliasId);
            console.log(
                "削除後のエイリアス",
                await client.getRichMenuAliasList()
            );
        });
    }

    console.log("削除後のリスト", await client.getRichMenuList());
    console.log(
        "削除後のエイリアスリスト",
        await client.getRichMenuAliasList()
    );
}

removeLichMenu();
