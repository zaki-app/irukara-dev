/**
 * テキスト以外のメッセージタイプを受信したときに謝罪メッセージを返す
 * @param event
 * @returns
 */
export const sorryReply = (event: any) => {
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
};
