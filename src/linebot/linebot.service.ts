import { Injectable } from '@nestjs/common';

@Injectable()
export class LinebotService {
  getLinebot(): string {
    return 'linebotのサービスからです';
  }
}
