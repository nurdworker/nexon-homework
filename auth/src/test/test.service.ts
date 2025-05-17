import { Injectable } from '@nestjs/common';
import { KafkaService } from '../kafka/kafka.service';

@Injectable()
export class TestService {
  constructor(private readonly kafkaService: KafkaService) {}

  testGet() {
    return { message: 'success api get from auth' };
  }

  async testKafka() {
    const name = 'muzzi';

    const message = `test kafka ${name}`;
    await this.kafkaService.sendMessage('auth-events', {
      event: 'testkafka',
      name,
      message,
    });

    return { message };
  }
}
