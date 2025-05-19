import { Controller, Get, Headers } from '@nestjs/common';
import { TestService } from './test.service';

@Controller('test')
export class TestController {
  constructor(private readonly testService: TestService) {}

  @Get('get')
  testGet() {
    return this.testService.testGet();
  }

  @Get('role')
  testRole() {
    return this.testService.testRole();
  }

  @Get('header')
  testHeader(@Headers('authorization') authHeader: string) {
    return this.testService.testHeader(authHeader);
  }

  @Get('item')
  async testItem() {
    return this.testService.getAllItems();
  }
}
