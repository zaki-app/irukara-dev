# LINEBot TapNote

Lambda と APIGateway で Nest.js を動かしています。

<br>

### 必要なもの

- serverless framework
- cfn-lint(https://qiita.com/5hintaro/items/40fd4d73d146aaaf4636)
- nest-cli
- volta

<br>

### 環境構築

先に npm install して、Node のバージョンを合わせてください

```
npm install
npm buildoff
```

npm buildoff でビルドと serverless offline が立ち上がります。

<br>

### テスト

```
# postmanなど
http://localhost:6000/dev/linebot
or
curl http://localhost:6000/dev/linebot
```

```
curl -v -X POST https://api.line.me/v2/bot/message/reply \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer j6i/HBkaHEbGYmWuv/w5DaHytPSQL8e/yX4hEfkBTLBZmy8iPNsd9IlTFqeWV6W+BeiP7/E0JutLy2SNocJoty0hNTy1X/Vie2WGw2tl+Iv53uKs90iSHqqCcGX0csfDUwlJ5wyS6RUdptRbZrAUogdB04t89/1O/w1cDnyilFU=' \
-d '{
    "replyToken":"nHuyWiB7yP5Zw52FIkcQobQuGDXCTA",
    "messages":[
        {
            "type":"text",
            "text":"Hello, user"
        },
        {
            "type":"text",
            "text":"May I help you?"
        }
    ]
}'

```

```
curl -v -X POST https://api.line.me/v2/bot/message/reply \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer j6i/HBkaHEbGYmWuv/w5DaHytPSQL8e/yX4hEfkBTLBZmy8iPNsd9IlTFqeWV6W+BeiP7/E0JutLy2SNocJoty0hNTy1X/Vie2WGw2tl+Iv53uKs90iSHqqCcGX0csfDUwlJ5wyS6RUdptRbZrAUogdB04t89/1O/w1cDnyilFU=' \
-d '{
    "replyToken":"nHuyWiB7yP5Zw52FIkcQobQuGDXCTA",
    "messages":[
        {
            "type":"text",
            "text":"Hello, user"
        },
        {
            "type":"text",
            "text":"May I help you?"
        }
    ]
}'
```

<br>

### serverless deploy

デプロイ前に Lint を走らせてください

```
npm run cfn-lint
```
