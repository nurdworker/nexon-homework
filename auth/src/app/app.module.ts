import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongoInitService } from '../database/mongo-init.service';
import { KafkaModule } from '../kafka/kafka.module';

@Module({
  imports: [KafkaModule],
  controllers: [AppController],
  providers: [AppService, MongoInitService],
})
export class AppModule {}
