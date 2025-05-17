import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Kafka, Consumer } from 'kafkajs';

@Injectable()
export class AppService implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private consumer: Consumer;

  getHello(): string {
    return 'Hello from event';
  }

  postBye(body): string {
    return `Bye ${body.name}`;
  }

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
        const eventData = message.value?.toString();
        console.log(`Received event on topic ${topic}:`, eventData);
      },
    });
  }

  async onModuleDestroy() {
    await this.consumer.disconnect();
  }
}
