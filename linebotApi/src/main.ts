import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import serverlessExpress from '@vendia/serverless-express';
import { Callback, Context, Handler } from 'aws-lambda';
import { middleware } from '@line/bot-sdk';
import { NestApplicationOptions, ValidationPipe } from '@nestjs/common';

let server: Handler;

async function bootstrap(): Promise<Handler> {
  const options: NestApplicationOptions = {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  };

  const app = await NestFactory.create(AppModule, options);
  await app.init();
  app.use(
    middleware({
      channelSecret: process.env.CHANNEL_SECRET,
    }),
  );
  // validationPipe
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const expressApp = app.getHttpAdapter().getInstance();

  return serverlessExpress({ app: expressApp });
}

// 呼び出し
export const handler: Handler = async (
  event: any,
  context: Context,
  callback: Callback,
) => {
  server = server ?? (await bootstrap());
  return server(event, context, callback);
};

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);
//   await app.listen(6000);
// }
// bootstrap();
