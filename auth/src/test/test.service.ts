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
    console.log('test/ auth에서 테스트 카프카 메세지를 보냈어요!');
    return { message };
  }
}
