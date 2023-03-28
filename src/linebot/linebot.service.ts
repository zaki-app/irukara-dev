import { Injectable } from '@nestjs/common';
import { Client, WebhookEvent } from '@line/bot-sdk';
import { Configuration, OpenAIApi } from 'openai';

@Injectable()
export class LineBotService {
  // lineBotClient
  createLineBotClient() {
    const tokens = {
      channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN ?? '',
      channelSecret: process.env.CHANNEL_SECRET ?? '',
    };
    return new Client(tokens);
  }

  // chatGpt
  async chatGPTsAnswer(question: string) {
    console.log('回答前の質問', question);

    const chatGPTConfig = new Configuration({
      apiKey: process.env.CHATGPT_API_KEYS,
    });
    const openAiApi = new OpenAIApi(chatGPTConfig);

    // 質問を投げる
    const setQuestion = await openAiApi.createChatCompletion({
      model: process.env.CHATGPT_MODEL,
      max_tokens: 500,
      // この値が高いほどめちゃくちゃな文章になるらしい
      temperature: 0,
      // 生成された文章に含まれる単語の確率分布の上位何割までを考慮するかを指定します。
      top_p: 1.0,
      // 頻出した単語の使用頻度に対するペナルティーを指定します。高いほど頻出単語が使われなくなります。
      frequency_penalty: 0.0,
      // 既出の単語の重複に対するペナルティーを指定します。高いほど同じ単語が連続して出現するのを避けようとします。
      presence_penalty: 0.0,
      // messages: [{ role: 'user', content: question }],
      messages: [
        {
          role: 'system',
          content:
            'あなたは「TapNote」です。名前を聞かれたらTapNoteって答えてください。TapNoteは現在テスト段階ですが、TapNoteのプロフィールをカスタマイズできるアシスタントになる予定です。まだまだ未熟者ですが、がんばっていきますので温かい目で見守ってくれると嬉しいですって答えてください',
        },
        {
          role: 'system',
          content:
            'あなたはAIアシスタントですが、そこまで丁寧じゃなくてもいいです。親しみやすい感じで話してください',
        },
        {
          role: 'system',
          content:
            '嬉しい時や悲しい時など感情が入った質問や、答えの時は絵文字や顔文字を使ってください',
        },
        {
          role: 'system',
          content: '一人称は「TapNote」にしてください',
        },
        {
          role: 'system',
          content:
            '回答は完結にしてください。長くなりそうなら分割して続きを再度送ってください',
        },
        {
          role: 'system',
          content:
            'ありがとうって言われたり感謝されたら絵文字を入れて喜んでください',
        },
        {
          role: 'system',
          content:
            '自己紹介は、TapNoteは現在テスト段階ですが、TapNoteのプロフィールをカスタマイズできるアシスタントになる予定です。まだまだ未熟者ですが、がんばっていきますので温かい目で見守ってくれると嬉しいですって答えてくださいって答えてね',
        },
        {
          role: 'system',
          content:
            'TapNoteのことを聞かれたらTapNoteは現在テスト段階ですが、TapNoteのプロフィールをカスタマイズできるアシスタントになる予定です。まだまだ未熟者ですが、がんばっていきますので温かい目で見守ってくれると嬉しいですって答えてくださいって答えてね',
        },
        {
          role: 'user',
          content: question,
        },
      ],
    });
    // 回答文を取得
    const answer = setQuestion.data.choices[0].message.content;
    // 最初の改行を除去
    const replaceAnswer = answer.replace('\n\n', '');

    console.log('最終の回答', replaceAnswer);

    return replaceAnswer;
  }

  // 画像やスタンプの場合謝罪のメッセージを返す
  replySorry(event: any) {
    console.log('謝罪時のイベント', event);

    // postbackの時
    if (event.type === 'postback') {
      const parseData = event.postback.data;
      const result = JSON.parse(parseData);
      console.log('ポストバックの結果', parseData.action);
      return `ポストバックです！ ${result.action}`;
    } else {
      return '実装中';
    }
    // console.log('どんなタイプかな', type);
    // if (type === 'image' || type === 'video' || type === 'sticker') {
    //   return 'すいません🙇‍♂️\nまだスタンプや画像とか動画には対応してないんです。。。\nテキストメッセージならご質問にお応えできます！\n対応できるまで暫しお待ちを！';
    // } else if (type === 'audio') {
    //   return 'すてきな音楽ですね！\nでもAIアシスタントは音楽がまだ聞けないんです😂\nいつか一緒に音楽を楽しみたいです！';
    // } else if (type === 'location') {
    //   return "お！地図ですね！\n私も旅行に行ってみたいです(ｏ'∀')ﾉ";
    // } else {
    //   console.log('postbackに入りました');
    //   const parseData = JSON.parse();
    //   return 'せっかく送ってくれたんですが、まだ対応できてないんです。\nテキストメッセージならご質問にお応えできます！\n対応できるまで暫しお待ちを！';
    // }
  }
}
