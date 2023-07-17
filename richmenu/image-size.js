const fetch = require("node-fetch");

async function imageSize() {
    const imgUrl =
        "https://cdn.stablediffusionapi.com/generations/0-8b83264a-8c11-4cd5-b8c3-caf85ce4af52.png";

    const contentLength = response.headers.get("content-length");
    console.log("画像のサイズ:", contentLength, "バイト");
}

imageSize();
