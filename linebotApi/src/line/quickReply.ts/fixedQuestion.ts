export const fixedQuestions = [
  '使い方を教えて',
  'イルカラは何ができるの？',
  'イルカラは無料なの？',
  '参考になったで保存',
  '参考にならなかったで保存',
  '保存しない',
];

export const fixedAnswer = (question: string) => {
  if (question === fixedQuestions[0]) {
    return {
      id: 0,
      text: `イルカラは現在テスト段階ですが、保存したい回答を保存することができる優れものです。まだまだ未熟者ですが、がんばっていきますので温かい目で見守ってくれると嬉しいです😋`,
    };
  } else if (question === fixedQuestions[1]) {
    return {
      id: 1,
      text: `ChatGPTをLINEで気軽にできて保存するボタンを押すと回答を保存できるよ😋`,
    };
  } else if (question === fixedQuestions[2]) {
    return {
      id: 2,
      text: `テスト段階では無料だよ👍\nもしかしたら今後は有料になっちゃうかもだけど`,
    };
  }
  return;
};
