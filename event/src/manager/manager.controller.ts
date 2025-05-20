import { Controller, Get, Headers, Post, Body, Res } from '@nestjs/common';
import { ManagerService } from './manager.service';
import { EventCreateDto } from '../dto/event-create.dto';
import { Response } from 'express';
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

  @Post('toggle-active')
  async toggleActive(@Body('eventId') eventId: string) {
    const result = await this.managerService.toggleActive(eventId);
    return result;
  }

  // requests 전체 데이터 조회
  @Get('requests')
  async getAllRequests() {
    return this.managerService.getAllRequests();
  }

  // requests 데이터 엑셀로 내보내기
  @Get('requests/export')
  async exportRequestsExcel(): Promise<Buffer> {
    return await this.managerService.exportRequestsExcel();
  }
}
