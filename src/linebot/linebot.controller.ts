import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { LinebotService } from './linebot.service';
import { WebhookEvent, WebhookRequestBody } from '@line/bot-sdk';

@Controller('linebot')
export class LinebotController {
  constructor(private readonly linebotService: LinebotService) {}

  @Get()
  getLineBot(@Req() request: Request): string {
    console.log('GETリクエストです');
    return this.linebotService.getLinebot();
  }

  @Post()
  requestLineBot(@Body() request: WebhookRequestBody) {
    return this.linebotService.sendResultMessage(request);
  }
}
