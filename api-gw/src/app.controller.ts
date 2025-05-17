import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // tester api들.
  @Get('hello')
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('bye')
  postBye(@Body() body: { name: string }): string {
    return this.appService.postBye(body);
  }

  @Get('authHello')
  getHelloFromAuth(): Promise<any> {
    return this.appService.getHelloFromAuth();
  }

  @Get('eventHello')
  getHelloFromEvent(): Promise<any> {
    return this.appService.getHelloFromEvent();
  }

  @Post('call-kafka-auth')
  async callAuth(): Promise<any> {
    return this.appService.callKafkaFromAuth();
  }
}
