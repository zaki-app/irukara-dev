import {
  EventBridgeClient,
  PutEventsCommand,
  PutRuleCommand,
  PutTargetsCommand,
} from '@aws-sdk/client-eventbridge';
import type { EventBridgeClientConfig } from '@aws-sdk/client-eventbridge';

/* ユーザーの登録日から7日経過後にカウントを更新 */
export async function updateUserEventClient() {
  try {
    // クライアントの作成
    const ebClient = new EventBridgeClient({ region: process.env.REGION });

    const source = 'customEventSource';
    // const usedRole =
    //   // 'arn:aws:scheduler:ap-northeast-1:311789745928:schedule/irukara-batch/test-irukara-batch';
    //   'arn:aws:scheduler:ap-northeast-1:311789745928:schedule/irukara-batch/irukara-batch-text';
    const lambdaRole =
      'arn:aws:lambda:ap-northeast-1:311789745928:function:dev-testBatch';

    // 送信したいイベントの詳細
    const eventData = {
      event_type: 'テスト',
      detail: {
        status: 9999,
        userId: 'ちゃんと変わったかな？',
        other: 'その他のイベント',
      },
    };
    // ○分後に実行するように時間を取得
    const time = new Date();
    time.setMinutes(time.getMinutes() + 3);

    console.log('送信データ', JSON.stringify(eventData));

    // イベント送信
    const eventParams = {
      Entries: [
        {
          Detail: JSON.stringify(eventData),
          DetailType: 'customEventType',
          Source: source,
          EventBusName: 'default',
          Time: time,
        },
      ],
    };

    const putEventResutl = await ebClient.send(
      new PutEventsCommand(eventParams),
    );
    console.log('イベントデータ', putEventResutl);
  } catch (err) {
    console.error('eventBridge is error...', err.$metadata.httpStatusCode);
  }
}
