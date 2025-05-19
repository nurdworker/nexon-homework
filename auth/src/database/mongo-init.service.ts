// src/mongo-init.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { MongoClient } from 'mongodb';

import { settingConfig } from '../config/setting.config';
import { hashPassword } from '../utils/password.util';

// console.log(settingConfig.testSecret); // 출력잘됨

@Injectable()
export class MongoInitService implements OnModuleInit {
  private readonly rootUri = settingConfig.dbUri;
  private readonly targetDb = settingConfig.dbName;
  private readonly username = settingConfig.userName;
  private readonly password = settingConfig.password;
  private readonly collectionsToInit = settingConfig.initCollectionLists;

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

      // 컬렉션 초기화 (컬렉션 만들기, 관리자 계정 넣어주기기)
      for (const name of this.collectionsToInit) {
        const exists = await db.listCollections({ name }).toArray();
        if (exists.length === 0) {
          console.log(`Creating collection: ${name}`);
          await db.createCollection(name);
        }
      }

      // 매니저 계정 users에 넣어줌줌
      const usersCollection = db.collection('users');

      for (const manager of settingConfig.managerLists) {
        const exists = await usersCollection.findOne({ email: manager.email });
        if (exists) {
          console.log(`Manager user already exists: ${manager.email}`);
          continue;
        }

        const hashedPassword = await hashPassword(manager.password);
        const newUser = {
          email: manager.email,
          password: hashedPassword,
          nickName: manager.nickName,
          roles: manager.roles,
          createdAt: manager.createdAt,
        };

        await usersCollection.insertOne(newUser);
        console.log(`Manager user created: ${manager.email}`);
      }

      console.log('auth db 초기화 완료!');
    } catch (error) {
      console.error('auth db 초기화 중 에러 발생:', error);
    } finally {
      await client.close();
    }
  }
}
