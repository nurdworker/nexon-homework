import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('hello')
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('bye')
  postBye(@Body() body: { name: string }): string {
    return this.appService.postBye(body);
  }

  @Get('lists')
  async getEvents() {
    return await this.appService.getEventsList();
  }

  @Get('list/:eventId')
  async getEvent(@Param('eventId') eventId: string) {
    return await this.appService.getEventById(eventId);
  }
}
