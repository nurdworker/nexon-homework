import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // tester api들.

  // api-gw test
  @Get('hello')
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('bye')
  postBye(@Body() body: { name: string }): string {
    return this.appService.postBye(body);
  }

  // auth test
  @Get('auth/hello')
  getHelloFromAuth(): Promise<any> {
    return this.appService.getHelloFromAuth();
  }

  @Get('auth/test/get')
  getFromTestAuth(): Promise<any> {
    console.log('api-gw controller');
    return this.appService.getFromTestAuth();
  }

  @Get('auth/test/kafka')
  getKafkaFromTestAuth(): Promise<any> {
    console.log('kafka test');
    return this.appService.getKafkaFromTestAuth();
  }

  // event test
  @Get('eventHello')
  getHelloFromEvent(): Promise<any> {
    return this.appService.getHelloFromEvent();
  }
}
