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

    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const value = message.value?.toString();
        console.log(`[Kafka] Message received on topic ${topic}:`, value);

        // 여기에 토픽 데이터 생성되면 쓸 코드드
      },
    });
  }

  async onModuleDestroy() {
    await this.consumer.disconnect();
  }
}
