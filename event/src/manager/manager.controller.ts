import { Controller, Get, Headers, Post, Body } from '@nestjs/common';
import { ManagerService } from './manager.service';
import { EventCreateDto } from '../dto/event-create.dto';
@Controller('event/manager')
export class ManagerController {
  constructor(private readonly managerService: ManagerService) {}

  @Get('options')
  getEventOptions() {
    return this.managerService.getEventOptions();
  }

  @Post()
  async createEvent(
    @Headers('authorization') authHeader: string,
    @Body() body: EventCreateDto,
  ) {
    return this.managerService.createEvent(authHeader, body);
  }
}
