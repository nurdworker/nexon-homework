// src/database/database.service.ts
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { MongoClient, Db } from 'mongodb';
import { eventConfig } from '../config/event.config';

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  private client: MongoClient;
  private db: Db;

  async connect(): Promise<Db> {
    console.log('connect db')
    if (this.db) return this.db;

    this.client = new MongoClient(eventConfig.dbUriUser, {
      maxPoolSize: eventConfig.maxPoolSize,
      minPoolSize: eventConfig.minPoolSize,
      // event: {
      //   username: eventConfig.userName,
      //   password: eventConfig.password,
      // },
    });

    await this.client.connect();
    this.db = this.client.db(eventConfig.dbName);
    return this.db;
  }

  getDb(): Db {
    if (!this.db) throw new Error('Database not connected yet');
    return this.db;
  }

  async onModuleDestroy() {
    await this.client?.close();
  }
}
