import { Test, TestingModule } from '@nestjs/testing';
import { LineBotController } from './linebot.controller';
import { LineBotService } from './linebot.service';

describe('LineBotController', () => {
  let controller: LineBotController;

  beforeEach(async () => {
    const linebot: TestingModule = await Test.createTestingModule({
      controllers: [LineBotController],
      providers: [LineBotService],
    }).compile();

    controller = linebot.get<LineBotController>(LineBotController);
  });

  describe('root', () => {
    it('should return "GETリクエストに変更"', () => {
      // expect(controller.getAccess()).toBe('GETリクエストに変更');
    });
  });
});
