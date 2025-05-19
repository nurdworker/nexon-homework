// src/event-init.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { MongoClient } from 'mongodb';

import { settingConfig } from '../config/setting.config';

@Injectable()
export class MongoInitService implements OnModuleInit {
  private readonly rootUri = settingConfig.dbUri;
  private readonly targetDb = settingConfig.dbName;
  private readonly username = settingConfig.userName;
  private readonly password = settingConfig.password;
  private readonly collectionsToInit = settingConfig.initCollectionLists;
  private readonly managers = settingConfig.managerLists;
  private readonly initItems = settingConfig.initItems;

  async onModuleInit() {
    const client = new MongoClient(this.rootUri);

    try {
      await client.connect();
      const db = client.db(this.targetDb);

      // 유저 존재 확인 후 없으면 생성
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

      // 컬렉션 생성 + 인덱스 설정
      for (const { name, indexFields } of this.collectionsToInit) {
        const exists = await db.listCollections({ name }).toArray();
        if (exists.length === 0) {
          console.log(`event / 컬렉션을 생성했습니다!: ${name}`);
          await db.createCollection(name);
        }

        const collection = db.collection(name);

        for (const field of indexFields) {
          const indexSpec = { [field]: 1 }; // 1: ascending
          await collection.createIndex(indexSpec, { background: true });
          console.log(`${name}컬렉션에 ${field} 인덱싱 생성!`);
        }
      }

      // 매니저 유저 등록 (copiedUsers 컬렉션)
      const copiedUsers = db.collection('copiedUsers');
      for (const manager of this.managers) {
        const exists = await copiedUsers.findOne({ email: manager.email });
        if (exists) {
          console.log(`매니저 유저가 이미 존재하네요~: ${manager.email}`);
          continue;
        }

        const newUser = {
          email: manager.email,
          nickName: manager.nickName,
          roles: manager.roles,
          createdAt: manager.createdAt,
        };

        await copiedUsers.insertOne(newUser);
        console.log(`매니저 등록했어요~!: ${manager.nickName}`);
      }

      const items = db.collection('copiedItems');
      for (const itemName of this.initItems) {
        const exists = await items.findOne({ name: itemName });
        if (exists) {
          console.log(`이미 존재하는 아이템이네요~: ${itemName}`);
          continue;
        }

        await items.insertOne({ name: itemName, createdAt: new Date() });
        console.log(`아이템 등록했어요~!: ${itemName}`);
      }

      console.log('event DB 초기화 완료!!');
    } catch (error) {
      console.error('event DB 초기화 에러:', error);
    } finally {
      await client.close();
    }
  }
}
