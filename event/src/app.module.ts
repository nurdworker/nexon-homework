import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongoInitService } from './database/mongo-init.service';
import { KafkaConsumerService } from './kafka/kafka-consumer.service';
import { DatabaseModule } from './database/database.module';
import { TestModule } from './test/test.module';

@Module({
  imports: [TestModule, DatabaseModule],
  controllers: [AppController],
  providers: [AppService, MongoInitService, KafkaConsumerService],
})
export class AppModule {}
