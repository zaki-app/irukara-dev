import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import serverlessExpress from '@vendia/serverless-express';
import { Callback, Context, Handler } from 'aws-lambda';
import { middleware } from '@line/bot-sdk';
import { NestApplicationOptions } from '@nestjs/common';

let server: Handler;

async function bootstrap(): Promise<Handler> {
  const options: NestApplicationOptions = {
    // bodyParser: false,
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  };

  // console.log('オプション', options);

  const app = await NestFactory.create(AppModule, options);
  await app.init();
  app.use(
    middleware({
      channelSecret: process.env.CHANNEL_SECRET,
    }),
  );

  // console.log('最終的なやつ');
  const expressApp = app.getHttpAdapter().getInstance();

  // console.log('何が入ってる？', app);
  return serverlessExpress({ app: expressApp });
}

// // // 呼び出し
export const handler: Handler = async (
  event: any,
  context: Context,
  callback: Callback,
) => {
  // console.log('serverは何入ってる？', server);
  server = server ?? (await bootstrap());
  return server(event, context, callback);
};

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);
//   await app.listen(6000);
// }
// bootstrap();
