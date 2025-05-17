import { Injectable } from '@nestjs/common';
import { KafkaService } from '../kafka/kafka.service';

@Injectable()
export class AppService {
  constructor(private readonly kafkaService: KafkaService) {}

  getHello(): string {
    console.log('api-gw auth 연결 완료');
    return 'Hello from auth';
  }

  async postBye(body): Promise<string> {
    const message = `Bye ${body.name}`;

    await this.kafkaService.sendMessage('auth-events', {
      event: 'bye',
      name: body.name,
      message,
    });
    return message;
  }
}

//-------------------------------- test zone
