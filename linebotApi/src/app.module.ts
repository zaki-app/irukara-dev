import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { LinebotModule } from './linebot/linebot.module';

@Module({
  imports: [
    // 環境変数読み込み
    ConfigModule.forRoot(),
    LinebotModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
