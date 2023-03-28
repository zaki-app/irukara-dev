export const fixedQuestions = [
  '使い方を教えて',
  'TapNoteは何ができるの？',
  'TapNoteは無料なの？',
];

export const fixedAnswer = (question: string) => {
  console.log('固定の質問');
  if (question === fixedQuestions[0]) {
    return `使い方を教えてあげるよ`;
  } else if (question === fixedQuestions[1]) {
    return `なんでもできるよ`;
  } else if (question === fixedQuestions[2]) {
    return `テスト段階では無料だよ`;
  }
  return;
};
