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

    const stage = process.env.NOW_STAGE;
    // スケジュール名は本番以外はわかりやすいように
    const scheduleName =
      stage === 'PRD'
        ? userId.slice(0, 64)
        : `${stage}_schedule_${userId.slice(0, 10)}`;
    const rateTime = stage === 'PRD' ? 'rate(7 days)' : 'rate(1 day)';
    const lambdaArn = process.env.LAMBDA_ARN;
    const lambdaRole = process.env.LAMBDA_ROLE;

    // バッチに送信する情報
    const targetParams: Target = {
      Arn: lambdaArn, // ターゲットのLambdaのArn
      RoleArn: lambdaRole, // 上記のLambdaを動かしているロール
      Input: JSON.stringify({
        status,
        userId,
      }),
    };

    console.log('送信データ', targetParams);

    const params: CreateScheduleInput = {
      // 名前は被らないようにuserIdにする(64文字の上限)
      Name: scheduleName,
      GroupName: 'irukara-batch',
      Description: `${userId}のスケジュール`,
      ScheduleExpression: rateTime,
      ScheduleExpressionTimezone: 'Asia/Tokyo',
      Target: targetParams,
      FlexibleTimeWindow: flexWindow,
    };

    const command = new CreateScheduleCommand(params);

    const commandResult = await client.send(command);
    response = true;
    console.log('schedule create success!', commandResult);
  } catch (err) {
    console.error('schedule error...', err);
    response = false;
  }
  return response;
}
