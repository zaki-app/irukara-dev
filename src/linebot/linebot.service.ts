import { Injectable } from '@nestjs/common';
import { Client } from '@line/bot-sdk';
import { Configuration, OpenAIApi } from 'openai';
@Injectable()
export class LineBotService {
  // lineBotClient
  createLineBotClient() {
    const tokens = {
      channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN ?? '',
      channelSecret: process.env.CHANNEL_SECRET ?? '',
    };
    console.log('トークンたち', tokens);
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
      messages: [{ role: 'user', content: question }],
    });
    // 回答文を取得
    const answer = setQuestion.data.choices[0].message.content;
    // 最初の改行を除去
    const replaceAnswer = answer.replace('\n\n', '');

    console.log('最終の回答', replaceAnswer);

    return replaceAnswer;
  }
}
