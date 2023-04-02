import { Injectable } from '@nestjs/common';
import { Configuration, OpenAIApi } from 'openai';

@Injectable()
export class LineBotService {
  // chatGpt
  async chatGPTsAnswer(question: string) {
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
            'あなたは「TapNote」です。名前を聞かれたらTapNoteって答えてください。TapNoteは現在テスト段階ですが、回答を参考になった、ならなかったで分けて保存できます。まだまだ未熟者ですが、がんばっていきますので温かい目で見守ってくれると嬉しいですって答えてください',
        },
        {
          role: 'system',
          content:
            'あなたはAIアシスタントですが、そこまで丁寧じゃなくてもいいです。親しみやすい感じで完結に答えてください',
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
            'ありがとうって言われたり感謝されたら絵文字を入れて喜んでください',
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
}
