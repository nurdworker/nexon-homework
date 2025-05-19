import { Controller, Get } from '@nestjs/common';
import { ManagerService } from './manager.service';

@Controller('manager')
export class ManagerController {
  constructor(private readonly managerService: ManagerService) {}

  @Get('dashboard')
  getDashboard() {
    return this.managerService.getDashboard();
  }
}
