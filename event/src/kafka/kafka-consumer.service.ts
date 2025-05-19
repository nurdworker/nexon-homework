import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Kafka, Consumer } from 'kafkajs';
import { DatabaseService } from '../database/database.service';
import { Db } from 'mongodb';

@Injectable()
export class KafkaConsumerService implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private consumer: Consumer;
  private db: Db;

  constructor(private readonly databaseService: DatabaseService) {}

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
    await this.consumer.subscribe({ topic: 'user.sign', fromBeginning: true });
    // DB 연결
    this.db = await this.databaseService.connect();

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
            await this.handleUserToken(value);
            break;
          case 'user.sign':
            await this.handleUserSign(value);
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

  private handleAuthEvents(message: string) {
    console.log('[kafka/event - auth-events] processing :', message);
    console.log('test/ event에서 테스트 카프카 메세지를 읽었어요!');
  }

  private async handleUserSignup(message: string) {
    console.log('[kafka/event - user.signup] processing :', message);

    try {
      const parsed = JSON.parse(message); // { userId, email, nickName }

      const copiedUsers = this.db.collection('copiedUsers');

      const user = {
        userId: parsed.userId,
        email: parsed.email,
        nickName: parsed.nickName,
        roles: ['user'],
      };

      await copiedUsers.insertOne(user);
      console.log(`[user.signup] 사용자 등록 완료: ${parsed.userId}`);
    } catch (err) {
      console.error('[user.signup] 처리 중 오류 발생:', err);
    }
  }

  private async handleUserToken(message: string) {
    console.log('[user.token] 처리중:', message);

    try {
      const parsed = JSON.parse(message); // { logId, userId, kind, createdAt }

      const copiedTokenLogs = this.db.collection('copiedTokenLogs');

      // 이메일 조회 부분 제거

      // 로그 삽입 (email 필드 제거)
      const log = {
        logId: parsed.logId,
        userId: parsed.userId,
        kind: parsed.kind,
        createdAt: new Date(parsed.createdAt),
      };

      await copiedTokenLogs.insertOne(log);
      console.log(`[user.token] 로그 저장 완료: ${parsed.logId}`);
    } catch (err) {
      console.error('[user.token] 처리 중 오류 발생:', err);
    }
  }

  private async handleUserSign(message: string) {
    console.log('[user.sign] 처리중:', message);

    try {
      const parsed = JSON.parse(message); // { userId, method, createdAt }

      const copiedSignLogs = this.db.collection('copiedSignLogs');

      const log = {
        userId: parsed.userId,
        method: parsed.method,
        createdAt: new Date(parsed.createdAt),
      };

      await copiedSignLogs.insertOne(log);
      console.log(`[user.sign] 로그 저장 완료: ${parsed.userId}`);
    } catch (err) {
      console.error('[user.sign] 처리 중 오류 발생:', err);
    }
  }
}
