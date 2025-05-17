import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongoInitService } from './mongo-init.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, MongoInitService],
})
export class AppModule {}
