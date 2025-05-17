// src/mongo-init.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { MongoClient } from 'mongodb';

@Injectable()
export class MongoInitService implements OnModuleInit {
  private readonly rootUri = 'mongodb://event-db:27017';
  private readonly targetDb = 'test-event';
  private readonly username = 'tester';
  private readonly password = 'tester123';

  async onModuleInit() {
    const client = new MongoClient(this.rootUri);

    try {
      await client.connect();
      const db = client.db(this.targetDb);

      // 유저 존재 여부 확인
      const users = await db.command({ usersInfo: this.username });
      const userExists = users.users.length > 0;

      if (!userExists) {
        console.log('Creating user...');
        await db.command({
          createUser: this.username,
          pwd: this.password,
          roles: [{ role: 'readWrite', db: this.targetDb }],
        });
      }

      // 컬렉션 존재 여부 확인
      const collections = await db.listCollections({ name: 'test' }).toArray();
      const collectionExists = collections.length > 0;

      if (!collectionExists) {
        console.log('Creating collection...');
        await db.createCollection('test');
        await db.collection('test').insertOne({ init: true });
      }

      console.log('event db 초기화 완료!');
    } catch (error) {
      console.error('event db 초기화 중 에러 발생:', error);
    } finally {
      await client.close();
    }
  }
}
