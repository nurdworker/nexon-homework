import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongoInitService } from './database/mongo-init.service';
import { DatabaseModule } from './database/database.module';
import { KafkaModule } from './kafka/kafka.module';
import { TestModule } from './test/test.module';

@Module({
  imports: [KafkaModule, TestModule, DatabaseModule],
  controllers: [AppController],
  providers: [AppService, MongoInitService],
})
export class AppModule {}
