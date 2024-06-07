import { Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    console.log('Request-Response time');

    res.on('finish', () => console.timeEnd('Request-Response time'));
    next();
  }
}
