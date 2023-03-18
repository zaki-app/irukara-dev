import { Controller, Get } from '@nestjs/common';
import { LinebotService } from './linebot.service';

@Controller('linebot')
export class LinebotController {
  constructor(private readonly linebotService: LinebotService) {}

  @Get()
  getLineBot(): string {
    return this.linebotService.getLinebot();
  }
}
