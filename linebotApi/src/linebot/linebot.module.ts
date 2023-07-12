import { Module, Logger } from '@nestjs/common';
import { LineBotController } from './linebot.controller';
import { LineBotService } from './linebot.service';

@Module({
  imports: [],
  controllers: [LineBotController],
  providers: [LineBotService, Logger],
})
export class LinebotModule {}
