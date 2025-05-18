// src/mongo-init.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { MongoClient } from 'mongodb';

import { eventConfig } from '../config/event.config';

@Injectable()
export class MongoInitService implements OnModuleInit {
  private readonly rootUri = eventConfig.dbUri;
  private readonly targetDb = eventConfig.dbName;
  private readonly username = eventConfig.userName;
  private readonly password = eventConfig.password;

  async onModuleInit() {
    const client = new MongoClient(this.rootUri);

    try {
      await client.connect();
      const db = client.db(this.targetDb);

      // db 관리 유저 존재 여부 확인. 얘로 계속 db접속할거임.
      const users = await db.command({ usersInfo: this.username });
      const userExists = users.users.length > 0;

      if (!userExists) {
        console.log('Creating db user...');
        await db.command({
          createUser: this.username,
          pwd: this.password,
          roles: [{ role: 'readWrite', db: this.targetDb }],
        });
      }

      // 컬렉션 존재 여부 확인. 여기에 users랑 tokenLogs 컬렉션 생성하게 하자.
      const collections = await db.listCollections({ name: 'test' }).toArray();
      const collectionExists = collections.length > 0;

      if (!collectionExists) {
        console.log('Creating collection...');
        await db.createCollection('test');
        // await db.collection('test').insertOne({ init: true });
      }

      // 초기 관리자 유저 users에 생성해서 넣어주기.

      console.log('event db 초기화 완료!');
    } catch (error) {
      console.error('event db 초기화 중 에러 발생:', error);
    } finally {
      await client.close();
    }
  }
}
