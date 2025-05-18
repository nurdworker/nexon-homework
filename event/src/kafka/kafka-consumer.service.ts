import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Kafka, Consumer } from 'kafkajs';

@Injectable()
export class KafkaConsumerService implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private consumer: Consumer;

  async onModuleInit() {
    this.kafka = new Kafka({
      clientId: 'event-service',
      brokers: ['kafka:9092'],
    });

    this.consumer = this.kafka.consumer({ groupId: 'event-consumer-group' });
    await this.consumer.connect();

    await this.consumer.subscribe({
      topic: 'auth-events',
      fromBeginning: true,
    });
    await this.consumer.subscribe({
      topic: 'user.signup',
      fromBeginning: true,
    });
    await this.consumer.subscribe({ topic: 'user.token', fromBeginning: true });

    await this.consumer.run({
      eachMessage: async ({ topic, message }) => {
        const value = message.value?.toString();
        console.log(`[Kafka] Message received on topic ${topic}:`, value);

        switch (topic) {
          case 'auth-events':
            this.handleAuthEvents(value);
            break;
          case 'user.signup':
            this.handleUserSignup(value);
            break;
          case 'user.token':
            this.handleUserToken(value);
            break;
          default:
            console.warn(`Unhandled topic: ${topic}`);
        }
      },
    });
  }

  async onModuleDestroy() {
    await this.consumer.disconnect();
  }

  // 카프카 컨슈머 핸들러들~
  private handleAuthEvents(message: string) {
    console.log('[kafka/event - auth-events] processing :', message);
    console.log('test/ event에서 테스트 카프카 메세지를 읽었어요!');
  }

  private handleUserSignup(message: string) {
    console.log('[kafka/event - user.signup] processing :', message);
    // TODO: 회원 가입 이벤트 처리 로직 작성
  }

  private handleUserToken(message: string) {
    console.log('[user.token] 처리중:', message);
    // TODO: 토큰 이벤트 처리 로직 작성
  }
}
