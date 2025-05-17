// src/mongo-init.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { MongoClient } from 'mongodb';

import { authConfig } from '../config/auth.config';
// import { hashPassword } from './staticData'; // 얘 유저 비번 해시화할떄 쓸거임.

// console.log(authConfig.testSecret); // 출력잘됨

@Injectable()
export class MongoInitService implements OnModuleInit {
  private readonly rootUri = authConfig.dbUri;
  private readonly targetDb = authConfig.dbName;
  private readonly username = authConfig.userName;
  private readonly password = authConfig.password;

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

      console.log('auth db 초기화 완료!');
    } catch (error) {
      console.error('auth db 초기화 중 에러 발생:', error);
    } finally {
      await client.close();
    }
  }
}
