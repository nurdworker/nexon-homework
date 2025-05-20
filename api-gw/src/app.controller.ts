import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  Headers,
  UnauthorizedException,
  Param,
  Res,
} from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from 'express';

import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from './auth/guards/roles.guard';
import { Roles } from './auth/decorators/roles.decorator';

export interface SignUpInfo {
  email: string;
  password: string;
  nickName: string;
}

export interface SignInInfo {
  email: string;
  password: string;
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // auth api
  @Post('auth/signup')
  async signUp(@Body() signUpInfo: SignUpInfo) {
    return await this.appService.signUp(signUpInfo);
  }

  @Post('auth/signin')
  async signIn(@Body() signInInfo: SignInInfo) {
    return await this.appService.signIn(signInInfo);
  }

  @Post('auth/refresh')
  async refresh(@Headers('authorization') authHeader: string) {
    if (!authHeader)
      throw new UnauthorizedException('Refresh token이 필요합니다.');
    const refreshToken = authHeader.replace('Bearer ', '').trim();
    return await this.appService.refreshAccessToken(refreshToken);
  }

  @Post('auth/logout')
  async logout(@Headers('authorization') authHeader: string) {
    if (!authHeader)
      throw new UnauthorizedException('Refresh token이 필요합니다.');
    const refreshToken = authHeader.replace('Bearer ', '').trim();
    return await this.appService.logout(refreshToken);
  }

  // event api / public
  @Get('event/lists')
  getEvents() {
    return this.appService.getEventsLists();
  }

  @Get('event/list/:eventId')
  getEvent(@Param('eventId') eventId: string) {
    return this.appService.getEventById(eventId);
  }

  //event api / manager
  @Get('event/manager/option')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('operator', 'admin')
  getEventOptions(@Headers('authorization') authHeader: string) {
    return this.appService.getEventOptions(authHeader);
  }

  @Post('event/manager')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('operator', 'admin')
  createEvent(@Headers('authorization') authHeader: string, @Body() body: any) {
    return this.appService.createEvent(authHeader, body);
  }

  @Post('event/manager/toggle-active')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('operator', 'admin')
  toggleActive(
    @Headers('authorization') authHeader: string,
    @Body() body: { eventId: string },
  ) {
    return this.appService.toggleEventActive(authHeader, body);
  }

  @Get('event/manager/requests')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('operator', 'admin', 'auditor')
  getEventRequests() {
    return this.appService.getEventRequests();
  }

  @Get('event/manager/requests/export')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('operator', 'admin', 'auditor')
  async exportEventRequests(@Res() res: Response) {
    const buffer = await this.appService.exportEventRequests();

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="event_requests.xlsx"',
    );
    res.setHeader('Content-Length', buffer.length.toString());

    res.send(buffer);
  }

  // event api / user
  @Post('event/user/request')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('user')
  requestRewards(
    @Headers('authorization') authHeader: string,
    @Body() body: { eventId: string },
  ) {
    return this.appService.requestRewards(authHeader, body);
  }

  @Get('event/user/request/me')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('user')
  getMyRequests(@Headers('authorization') authHeader: string) {
    return this.appService.getMyRequests(authHeader);
  }

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
    return this.appService.getFromTestAuth();
  }

  @Get('auth/test/kafka')
  getKafkaFromTestAuth(): Promise<any> {
    console.log('kafka test');
    return this.appService.getKafkaFromTestAuth();
  }

  // event test
  @Get('event/hello')
  getHelloFromEvent(): Promise<any> {
    return this.appService.getHelloFromEvent();
  }

  @Get('event/test/get')
  getFromTestEvent(): Promise<any> {
    return this.appService.getFromTestEvent();
  }

  @Get('event/test/role')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('user')
  getOnlyForUserFromEvent(): Promise<any> {
    return this.appService.getOnlyForUserFromEvent();
  }

  @Get('event/test/header')
  @UseGuards(AuthGuard('jwt'))
  @Roles('user')
  getHeaderFromEvent(@Req() req: Request): Promise<any> {
    return this.appService.getHeaderFromEvent(req);
  }

  @Get('event/test/item')
  getItemsFromTestEvent(): Promise<any> {
    return this.appService.getItemsFromTestEvent();
  }
}
