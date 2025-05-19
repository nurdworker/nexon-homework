import { Controller, Get, Post, Body, Req, Headers } from '@nestjs/common';
import { AppService } from './app.service';
import axios from 'axios';

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

  // event api
  //manager
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
