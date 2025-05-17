import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello from event';
  }

  postBye(body: { name: string }): string {
    return `Bye ${body.name}`;
  }
}
