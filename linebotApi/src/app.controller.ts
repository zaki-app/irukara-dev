import { Controller, Get } from '@nestjs/common';

@Controller('api')
export class AppController {
  @Get('test')
  testApi() {
    const stage = process.env.NOW_STAGE;
    return {
      data: stage,
    };
  }
}
