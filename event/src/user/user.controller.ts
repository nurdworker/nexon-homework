import { Controller, Post, Body, Headers, Get } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('event/user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Post('request')
  async requestEvent(
    @Body('eventId') eventId: string,
    @Headers('authorization') authHeader: string,
  ) {
    return this.userService.requestEvent(eventId, authHeader);
  }

  @Get('request/me')
  async getMyRequests(@Headers('authorization') authHeader: string) {
    return this.userService.getMyEventRequests(authHeader);
  }
}
