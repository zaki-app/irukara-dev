import {
  CreateScheduleCommand,
  SchedulerClient,
  Target,
} from '@aws-sdk/client-scheduler';
import type { CreateScheduleInput } from '@aws-sdk/client-scheduler';

export async function eventScheduler(
  status: number,
  userId: string,
): Promise<boolean> {
  let response: boolean;
  try {
    const client = new SchedulerClient({ region: process.env.REGION });
    const flexWindow = { Mode: 'OFF' };

    const lambdaArn =
      'arn:aws:lambda:ap-northeast-1:311789745928:function:dev-testBatch';
    const lambdaRole =
      'arn:aws:iam::311789745928:role/service-role/irukara-batch-eventbridge-schedule';

    // バッチに送信する情報
    const targetParams: Target = {
      Arn: lambdaArn, // ターゲットのLambdaのArn
      RoleArn: lambdaRole, // 上記のLambdaを動かしているロール
      Input: JSON.stringify({
        status: 9999,
        userId: 'fejaofajfeaoefjao',
      }),
    };

    console.log('送信データ', targetParams);

    const params: CreateScheduleInput = {
      Name: 'test_schedule',
      GroupName: 'irukara-batch',
      Description: 'irukaraバッチのテストスケジュールです',
      ScheduleExpression: 'at(2023-07-24T12:35:00)',
      ScheduleExpressionTimezone: 'Asia/Tokyo',
      Target: targetParams,
      FlexibleTimeWindow: flexWindow,
    };

    const command = new CreateScheduleCommand(params);

    const commandResult = await client.send(command);
    console.log('スケジュールレスポンス', commandResult);
    response = true;
  } catch (err) {
    console.error('schedule error...', err);
    response = false;
  }
  return response;
}
