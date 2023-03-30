export const fixedQuestions = [
  '使い方を教えて',
  'TapNoteは何ができるの？',
  'TapNoteは無料なの？',
  '参考になったで保存',
  '参考にならなかったで保存',
  '保存しない',
];

export const fixedAnswer = (question: string) => {
  if (question === fixedQuestions[0]) {
    return {
      id: 0,
      text: `TapNoteを使っていただければ、\nChatGPTの回答がLINEで見れて保存ボタンを押すと回答を保存できるよ😋`,
    };
  } else if (question === fixedQuestions[1]) {
    return {
      id: 1,
      text: `ChatGPTの回答がLINEで見れて保存ボタンを押すと回答を保存できるよ😋`,
    };
  } else if (question === fixedQuestions[2]) {
    return { id: 2, text: `テスト段階では無料だよ` };
  }
  return;
};
